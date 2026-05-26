const API_BASE = process.env.REACT_APP_API_BASE || '';

export async function apiGet(path) {
  const res = await fetch(`${API_BASE}/api${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}
