import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4002;
const ES_NODE = process.env.ES_NODE || "http://127.0.0.1:9200";
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || "supersecret";
const MODE = process.env.SEARCH_MODE || "elastic"; // set to "mock" to bypass ES
const INDEX = "products";

let es = null;
let usingMock = false;

async function bootElastic() {
  const { Client } = await import("@elastic/elasticsearch");
  es = new Client({ node: ES_NODE });

  // 1) ping first (fast fail if ES not reachable / security on)
  await es.ping();

  // 2) exists() has different shapes across client versions
  let existsResp = await es.indices.exists({ index: INDEX });
  const exists =
    typeof existsResp === "boolean"
      ? existsResp
      : (existsResp?.statusCode ? existsResp.statusCode === 200 : existsResp?.body === true);

  if (!exists) {
    await es.indices.create({
      index: INDEX,
      body: {
        mappings: {
          properties: {
            name: { type: "text", fields: { keyword: { type: "keyword" } } },
            description: { type: "text" },
            price: { type: "double" }
          }
        }
      }
    });
  }
}

function wireMockRoutes() {
  const docs = new Map();
  app.get("/health", (_req, res) => res.json({ ok: true, service: "search-service", mode: "mock" }));
  app.post("/index", (req, res) => {
    if (req.header("x-internal-key") !== INTERNAL_API_KEY) return res.status(403).json({ error: "forbidden" });
    const { id, name, description = "", price } = req.body || {};
    if (!id || !name) return res.status(400).json({ error: "id and name required" });
    docs.set(id, { name, description, price });
    res.json({ ok: true });
  });
  app.get("/search", (req, res) => {
    const q = (req.query.q || "").toString().toLowerCase();
    if (!q) return res.json({ query: q, hits: [] });
    const hits = [];
    for (const [id, d] of docs.entries()) {
      const text = `${d.name} ${d.description}`.toLowerCase();
      if (text.includes(q)) hits.push({ id, score: 1.0, ...d });
    }
    res.json({ query: q, count: hits.length, hits });
  });
}

function wireElasticRoutes() {
  app.get("/health", async (_req, res) => {
    try {
      const info = await es.info();
      const version = info?.body?.version?.number || info?.version?.number || "ok";
      res.json({ ok: true, service: "search-service", es: version });
    } catch {
      res.json({ ok: true, service: "search-service" });
    }
  });

  app.post("/index", async (req, res) => {
    if (req.header("x-internal-key") !== INTERNAL_API_KEY) return res.status(403).json({ error: "forbidden" });
    const { id, name, description = "", price } = req.body || {};
    if (!id || !name) return res.status(400).json({ error: "id and name required" });
    await es.index({ index: INDEX, id, body: { name, description, price } });
    await es.indices.refresh({ index: INDEX });
    res.json({ ok: true });
  });

  app.get("/search", async (req, res) => {
    const q = (req.query.q || "").toString();
    if (!q) return res.json({ query: q, hits: [] });
    const r = await es.search({
      index: INDEX,
      body: {
        query: { multi_match: { query: q, fields: ["name^3", "description"], fuzziness: "AUTO" } },
        size: 20
      }
    });
    const raw = r?.body?.hits?.hits ?? r?.hits?.hits ?? [];
    const hits = raw.map(h => ({ id: h._id, score: h._score, ...(h._source || {}) }));
    res.json({ query: q, count: hits.length, hits });
  });
}

(async () => {
  try {
    if (MODE === "mock") {
      usingMock = true;
      wireMockRoutes();
    } else {
      await bootElastic();      // may throw if ES not ready or secured
      wireElasticRoutes();
    }
  } catch (e) {
    console.error("[search-service] Elastic boot failed:", e.message);
    console.error("Falling back to MOCK mode. Set SEARCH_MODE=elastic once ES is ready.");
    usingMock = true;
    wireMockRoutes();
  }

  app.listen(PORT, () => {
    console.log(`search-service :${PORT}`, { ES_NODE, mode: usingMock ? "mock" : "elastic" });
  });
})();
