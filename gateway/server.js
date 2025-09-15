import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createProxyMiddleware } from "http-proxy-middleware";
dotenv.config();

const app = express();
app.use(cors());
const PORT = process.env.PORT || 8080;
const PRODUCT_URL = process.env.PRODUCT_URL || "http://127.0.0.1:4001";
const SEARCH_URL  = process.env.SEARCH_URL  || "http://127.0.0.1:4002";

app.get("/", (_req,res)=>res.json({ok:true,service:"gateway",routes:["/api/products","/api/search"]}));

// health shortcuts
app.use("/api/products/health", createProxyMiddleware({ target: PRODUCT_URL, changeOrigin:true, pathRewrite:()=>"/health" }));
app.use("/api/search/health",   createProxyMiddleware({ target: SEARCH_URL,  changeOrigin:true, pathRewrite:()=>"/health"  }));

// single /api proxy with router + explicit rewrite
app.use("/api", createProxyMiddleware({
  changeOrigin: true,
  router: (req)=> req.url.startsWith("/search") ? SEARCH_URL : PRODUCT_URL,
  pathRewrite: (path)=>{
    const [p,qs] = path.split("?",2); const q = qs?`?${qs}`:"";
    if(p==="/api/products") return "/products"+q;
    if(p.startsWith("/api/products/")) return "/products"+p.slice("/api/products".length)+q;
    if(p==="/api/search") return "/search"+q;
    if(p.startsWith("/api/search/")) return "/search"+p.slice("/api/search".length)+q;
    return (p.replace(/^\/api/,"")||"/")+q;
  }
}));

app.listen(PORT, ()=>console.log(`gateway :${PORT}`, {PRODUCT_URL,SEARCH_URL}));
