const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080/api";
export async function apiGet(path){ const r=await fetch(`${API_BASE}${path}`,{cache:"no-store"}); if(!r.ok) throw new Error(`GET ${path} -> ${r.status}`); return r.json(); }
export async function apiPost(path,body){ const r=await fetch(`${API_BASE}${path}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}); if(!r.ok) throw new Error(`POST ${path} -> ${r.status}`); return r.json(); }
