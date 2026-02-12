const BASE = "http://localhost:4004";
const workers = 30;
const perWorker = 120;

async function j(url, opts = {}) {
  const r = await fetch(url, opts);
  const t = await r.text();
  let b = {};
  try { b = JSON.parse(t); } catch {}
  return { ok: r.ok, status: r.status, body: b };
}

(async () => {
  const email = `load${Date.now()}@example.com`;
  const password = "password123";

  const reg = await j(`${BASE}/api/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Load User", email, password, role: "BUYER" })
  });
  if (!reg.ok || !reg.body.token) throw new Error("register failed");

  const token = reg.body.token;
  const products = await j(`${BASE}/api/products`);
  if (!products.ok || !Array.isArray(products.body) || products.body.length === 0) {
    throw new Error("no products");
  }
  const productId = products.body[0].id;

  const start = Date.now();
  let ok = 0;
  let fail = 0;

  async function runWorker() {
    for (let i = 0; i < perWorker; i++) {
      const o = await j(`${BASE}/api/orders`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity: 1 })
      });
      if (o.ok) ok++;
      else fail++;
    }
  }

  await Promise.all(Array.from({ length: workers }, runWorker));
  const sec = (Date.now() - start) / 1000;
  console.log({ workers, perWorker, total: workers * perWorker, ok, fail, duration_sec: sec, rps: (ok + fail) / sec });
})();
