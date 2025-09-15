import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import axios from "axios";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4001;
const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/productsdb";
const REDIS_URL = process.env.REDIS_URL || "mock";
const SEARCH_URL = process.env.SEARCH_SERVICE_URL || "http://127.0.0.1:4002";
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || "supersecret";

await mongoose.connect(MONGO_URL);
const Product = mongoose.model("Product", new mongoose.Schema({
  name: { type: String, required: true, index: true },
  description: String,
  price: { type: Number, required: true }
}, { timestamps: true }));

// tiny mock cache with TTL
const store = new Map();
const cache = {
  async get(k){ return store.get(k) || null; },
  async set(k,v,ttl=60){ store.set(k,v); setTimeout(()=>store.delete(k),ttl*1000); },
  async delPrefix(prefix){ [...store.keys()].forEach(k=>k.startsWith(prefix)&&store.delete(k)); }
};

app.get("/health", (_,res)=>res.json({ok:true,service:"product-service"}));

app.post("/products", async (req,res)=>{
  const {name,description="",price} = req.body||{};
  if(!name || typeof price!=="number") return res.status(400).json({error:"name and price required"});
  const doc = await Product.create({name,description,price});
  await cache.delPrefix("products:");
  // async index (best-effort)
  try{
    await axios.post(`${SEARCH_URL}/index`, { id: doc._id, name, description, price }, { headers:{ "x-internal-key": INTERNAL_API_KEY } });
  }catch(e){ console.log("index warn:", e.message); }
  res.status(201).json(doc);
});

app.get("/products", async (req,res)=>{
  const limit = Math.max(1, Math.min(parseInt(req.query.limit||"10"), 100));
  const page = Math.max(1, parseInt(req.query.page||"1"));
  const key = `products:${limit}:${page}`;
  const hit = await cache.get(key);
  if(hit) return res.json(hit);
  const [data,total] = await Promise.all([
    Product.find().sort({_id:-1}).skip((page-1)*limit).limit(limit).lean(),
    Product.countDocuments()
  ]);
  const resp = { data, page, limit, total, totalPages: Math.ceil(total/limit) };
  await cache.set(key, resp, 60);
  res.json(resp);
});

app.listen(PORT, ()=>console.log(`product-service :${PORT}`));
