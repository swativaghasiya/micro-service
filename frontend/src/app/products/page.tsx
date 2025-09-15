"use client";
import { useState, useEffect } from "react";
import { apiGet, apiPost } from "../../lib/api";

export default function ProductsPage() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  async function load(p = 1) {
    const res = await apiGet(`/products?limit=5&page=${p}`);
    setProducts(res.data);
    setPage(res.page);
    setTotalPages(res.totalPages);
  }

  useEffect(() => {
    load(1);
  }, []);

  async function add() {
    if (!name || !price) return;
    await apiPost("/products", { name, description, price: Number(price) });
    setName("");
    setPrice("");
    setDescription("");
    load(1);
  }

  const card = {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
  };

  const input = {
    padding: "10px 12px",
    margin: "6px 0",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    width: "100%",
    fontSize: 14
  };

  const button = {
    background: "#2563eb",
    color: "#fff",
    padding: "10px 16px",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 500,
    marginTop: 10
  };

  const buttonDisabled = {
    ...button,
    background: "#9ca3af",
    cursor: "not-allowed"
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 20, fontFamily: "system-ui" }}>
      <div style={card}>
        <h2 style={{ marginTop: 0, marginBottom: 12 }}>➕ Add Product</h2>
        <input style={input} placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <input style={input} placeholder="Price" type="number" value={price} onChange={e => setPrice(e.target.value)} />
        <textarea
          style={{ ...input, minHeight: 70 }}
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <button style={button} onClick={add}>Add Product</button>
      </div>

      <div style={card}>
        <h2 style={{ marginTop: 0, marginBottom: 12 }}>📦 Products</h2>
        {products.length === 0 ? (
          <p style={{ color: "#6b7280" }}>No products available.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {products.map(p => (
              <li
                key={p._id}
                style={{
                  padding: "10px 0",
                  borderBottom: "1px solid #f3f4f6",
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                <span style={{ fontWeight: 600, fontSize: 15 }}>{p.name}</span>
                <span style={{ color: "#2563eb", fontWeight: 500 }}>₹{p.price}</span>
                <span style={{ fontSize: 13, color: "#4b5563" }}>{p.description}</span>
              </li>
            ))}
          </ul>
        )}

        <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            style={page <= 1 ? buttonDisabled : button}
            disabled={page <= 1}
            onClick={() => load(page - 1)}
          >
            ◀ Prev
          </button>
          <span style={{ fontSize: 14, color: "#374151" }}>
            Page {page} / {totalPages}
          </span>
          <button
            style={page >= totalPages ? buttonDisabled : button}
            disabled={page >= totalPages}
            onClick={() => load(page + 1)}
          >
            Next ▶
          </button>
        </div>
      </div>
    </div>
  );
}
