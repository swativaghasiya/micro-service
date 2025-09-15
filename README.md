Micro-Platform — Product Listing & Search

A microservice-based platform built with Node.js, Express, MongoDB, Elasticsearch, and Next.js.
It demonstrates:

Product Service → add & fetch products (with mock Redis caching)

Search Service → full-text search with Elasticsearch (or mock mode)

Gateway → single public entry point

Frontend → Next.js App for adding, listing, and searching products

🚀 Features

Add a product (name, description, price)

Fetch all products (optionally paginated)

GET responses cached (mock Redis in-memory with TTL)

Search products by keyword (via Elasticsearch)

API Gateway to expose /api/products and /api/search only

Frontend UI built with Next.js App Router

📂 Project Structure
micro-platform/
├── product-service/ # Mongo + cache + indexing
├── search-service/ # Elasticsearch-backed search (or mock mode)
├── gateway/ # API Gateway with http-proxy-middleware
└── frontend/ # Next.js App frontend

🛠️ Requirements

Node.js
v18+

MongoDB
running locally (mongodb://127.0.0.1:27017)

Elasticsearch
(8.x) running on http://127.0.0.1:9200

Set in elasticsearch.yml:

discovery.type: single-node
xpack.security.enabled: false

Start with bin/elasticsearch.bat (Windows) or bin/elasticsearch (Linux/Mac)

(You can also set SEARCH_MODE=mock in search-service/.env to run without Elasticsearch.)

⚙️ Installation

cd micro-platform

1. Product Service
   cd product-service
   npm install

2. Search Service
   cd ../search-service
   npm install

3. Gateway
   cd ../gateway
   npm install

4. Frontend (Next.js)
   cd ../frontend
   npm install

Now visit 👉 http://localhost:3000

🧪 Testing APIs with curl
Health
curl http://localhost:8080/api/products/health
curl http://localhost:8080/api/search/health

Add product
curl -X POST http://localhost:8080/api/products \
 -H "Content-Type: application/json" \
 -d '{"name":"iPhone 13","description":"Apple smartphone","price":699}'

List products
curl http://localhost:8080/api/products?limit=5&page=1

Search
curl http://localhost:8080/api/search?q=iphone

🌐 Frontend Screens

/products → Add + list products (styled card layout)

/search → Search bar + results list (styled card layout)

📌 Notes

Redis is mocked with an in-memory Map() + TTL. Swap to real Redis easily by replacing cache functions.

Search indexing is best-effort → product creation never fails if search-service is down.

To reset Elasticsearch security, delete its data/ folder after disabling security in config.

Future improvements: authentication, rate limiting, Docker Compose for all services.
