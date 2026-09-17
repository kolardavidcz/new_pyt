/**
 * Vercel Serverless Function Proxy for Upstash Redis Cloud Database Sync
 * Securely proxies client GET/POST sync requests without exposing API tokens in client JS.
 */

export default async function handler(req, res) {
  // CORS origin check
  const origin = req.headers.origin;
  const isAllowedOrigin = !origin || 
    origin.includes("localhost") || 
    origin.includes("127.0.0.1") || 
    origin.endsWith(".vercel.app") ||
    origin.includes("vscht.cz");

  res.setHeader("Access-Control-Allow-Origin", isAllowedOrigin ? (origin || "*") : "null");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-admin-key");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const kvUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const kvToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  if (!kvUrl || !kvToken) {
    return res.status(500).json({ error: "Serverless KV storage is not configured" });
  }

  const adminSecret = process.env.ADMIN_API_KEY || "pcs-admin-key-v1";
  const clientKey = req.headers["x-admin-key"] || req.headers["authorization"]?.replace(/^Bearer\s+/i, "");
  const isAuthorizedAdmin = Boolean(clientKey && clientKey === adminSecret);

  const { action, key } = req.query;

  function isValidKey(k) {
    if (typeof k !== "string") return false;
    const trimmed = k.trim();
    if (trimmed.length === 0 || trimmed.length > 128) return false;
    return /^(pyt:[a-zA-Z0-9_.-]{1,64}:[a-zA-Z0-9_.-]{1,64}|pcs-[a-zA-Z0-9_.-]{1,64}(:[a-zA-Z0-9_.-]{1,64})?)$/.test(trimmed);
  }

  try {
    if (req.method === "GET") {
      const targetKey = key || req.query.k;
      if (!targetKey) {
        return res.status(400).json({ error: "Missing key parameter" });
      }
      if (!isValidKey(targetKey)) {
        return res.status(400).json({ error: "Invalid key parameter format" });
      }
      const response = await fetch(`${kvUrl}/get/${encodeURIComponent(targetKey)}`, {
        headers: { Authorization: `Bearer ${kvToken}` },
      });
      const data = await response.json();
      return res.status(200).json(data);
    }

    if (req.method === "POST") {
      // Enforce 256KB max batch payload length to protect cloud storage quota
      const rawLen = parseInt(req.headers["content-length"] || "0", 10);
      if (rawLen > 262144) {
        return res.status(413).json({ error: "Payload too large (max 256KB)" });
      }

      const body = req.body;
      
      // Batch sync handling: array of { key, val } operations
      if (Array.isArray(body)) {
        const results = [];
        for (const op of body) {
          if (op && op.key && isValidKey(op.key)) {
            // Protect global namespace from unauthenticated writes
            if (op.key.startsWith("pyt:global:") && !isAuthorizedAdmin) {
              results.push({ key: op.key, ok: false, error: "Unauthorized global key" });
              continue;
            }
            if (JSON.stringify(op.val).length > 65536) {
              results.push({ key: op.key, ok: false, error: "Item payload exceeds 64KB" });
              continue;
            }
            const response = await fetch(`${kvUrl}/set/${encodeURIComponent(op.key)}`, {
              method: "POST",
              headers: { Authorization: `Bearer ${kvToken}` },
              body: JSON.stringify(op.val),
            });
            results.push({ key: op.key, ok: response.ok });
          } else if (op && op.key) {
            results.push({ key: op.key, ok: false, error: "Invalid key format" });
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
      if (!isValidKey(targetKey)) {
        return res.status(400).json({ error: "Invalid key format in payload" });
      }
      if (targetKey.startsWith("pyt:global:") && !isAuthorizedAdmin) {
        return res.status(403).json({ error: "Unauthorized: writing to global namespace requires admin authorization" });
      }
      if (JSON.stringify(targetVal).length > 65536) {
        return res.status(413).json({ error: "Item payload exceeds 64KB limit" });
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
