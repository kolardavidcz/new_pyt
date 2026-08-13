/**
 * Vercel Serverless Function Proxy for Upstash Redis Cloud Database Sync
 * Securely proxies client GET/POST sync requests without exposing API tokens in client JS.
 */

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const kvUrl = process.env.UPSTASH_REDIS_REST_URL || "https://tough-husky-101028.upstash.io";
  const kvToken = process.env.UPSTASH_REDIS_REST_TOKEN || "gQAAAAAAAYqkAAIgcDFiZjJmZTQ3MWE4OTg0MWJjOWUwYmY5ZjU3MGEzOTg3NA";

  const { action, key } = req.query;

  try {
    if (req.method === "GET") {
      const targetKey = key || req.query.k;
      if (!targetKey) {
        return res.status(400).json({ error: "Missing key parameter" });
      }
      const response = await fetch(`${kvUrl}/get/${encodeURIComponent(targetKey)}`, {
        headers: { Authorization: `Bearer ${kvToken}` },
      });
      const data = await response.json();
      return res.status(200).json(data);
    }

    if (req.method === "POST") {
      const body = req.body;
      
      // Batch sync handling: array of { key, val } operations
      if (Array.isArray(body)) {
        const results = [];
        for (const op of body) {
          if (op && op.key) {
            const response = await fetch(`${kvUrl}/set/${encodeURIComponent(op.key)}`, {
              method: "POST",
              headers: { Authorization: `Bearer ${kvToken}` },
              body: JSON.stringify(op.val),
            });
            results.push({ key: op.key, ok: response.ok });
          }
        }
        return res.status(200).json({ status: "ok", results });
      }

      // Single operation: { key, val }
      const targetKey = key || body?.key;
      const targetVal = body?.val !== undefined ? body.val : body;
      if (!targetKey) {
        return res.status(400).json({ error: "Missing key in payload" });
      }

      const response = await fetch(`${kvUrl}/set/${encodeURIComponent(targetKey)}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${kvToken}` },
        body: JSON.stringify(targetVal),
      });

      const data = await response.json();
      return res.status(200).json(data);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
