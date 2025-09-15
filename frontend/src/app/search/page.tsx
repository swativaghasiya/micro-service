"use client";
import { useState } from "react";
import { apiGet } from "../../lib/api";

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function run() {
    try {
      setLoading(true);
      setErr("");
      const res = await apiGet(`/search?q=${encodeURIComponent(q)}`);
      setHits(res.hits || []);
    } catch (e: any) {
      setErr(e.message || "Search failed");
    } finally {
      setLoading(false);
    }
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
    borderRadius: 8,
    border: "1px solid #d1d5db",
    flex: 1,
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
    marginLeft: 10
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 20, fontFamily: "system-ui" }}>
      <div style={card}>
        <h2 style={{ marginTop: 0, marginBottom: 12 }}>🔎 Search Products</h2>
        <div style={{ display: "flex", marginBottom: 16 }}>
          <input
            style={input}
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Type a keyword (e.g. iphone)"
          />
          <button style={button} onClick={run} disabled={loading}>
            {loading ? "Searching…" : "Search"}
          </button>
        </div>

        {err && <div style={{ color: "red", marginBottom: 10 }}>❌ {err}</div>}

        {hits.length === 0 && !loading ? (
          <p style={{ color: "#6b7280" }}>No results yet. Try searching above.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {hits.map(h => (
              <li
                key={h.id}
                style={{
                  padding: "12px 0",
                  borderBottom: "1px solid #f3f4f6"
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 15 }}>{h.name}</div>
                <div style={{ color: "#2563eb", fontWeight: 500 }}>₹{h.price}</div>
                <div style={{ fontSize: 13, color: "#4b5563" }}>{h.description}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
