/**
 * Vercel Serverless Function: Question & Slide Improvements API
 * Cloud-First Single Source of Truth for feedback reports in Upstash Redis (key: pyt:global:question_improvements).
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

  const REDIS_KEY = "pyt:global:question_improvements";
  const adminSecret = process.env.ADMIN_API_KEY || "pcs-admin-key-v1";
  const clientKey = req.headers["x-admin-key"] || req.headers["authorization"]?.replace(/^Bearer\s+/i, "");
  const isAuthorizedAdmin = Boolean(clientKey && clientKey === adminSecret);

  function sanitizeId(id) {
    if (typeof id === "string" && /^imp-\d+-[a-zA-Z0-9_-]{1,16}$/.test(id)) {
      return id;
    }
    return `imp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  }

  async function fetchRemoteImprovements() {
    try {
      const resp = await fetch(`${kvUrl}/get/${encodeURIComponent(REDIS_KEY)}`, {
        headers: { Authorization: `Bearer ${kvToken}` },
      });
      if (!resp.ok) return [];
      const data = await resp.json();
      if (!data || data.result === undefined || data.result === null) return [];
      
      let parsed = data.result;
      while (typeof parsed === "string") {
        try {
          parsed = JSON.parse(parsed);
        } catch {
          break;
        }
      }
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  async function saveRemoteImprovements(list) {
    const jsonStr = JSON.stringify(list);
    const resp = await fetch(`${kvUrl}/set/${encodeURIComponent(REDIS_KEY)}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${kvToken}` },
      body: JSON.stringify(jsonStr),
    });
    return resp.ok;
  }

  try {
    if (req.method === "GET") {
      const items = await fetchRemoteImprovements();
      return res.status(200).json({ status: "ok", result: items, total: items.length });
    }

    if (req.method === "POST") {
      // Enforce 32KB max payload length to protect cloud storage quota
      const rawLen = parseInt(req.headers["content-length"] || "0", 10);
      if (rawLen > 32768) {
        return res.status(413).json({ error: "Payload too large (max 32KB)" });
      }

      const body = req.body || {};

      // 1. Explicit Delete Action (Admin-Only)
      if (body.action === "delete" && body.id) {
        if (!isAuthorizedAdmin) {
          return res.status(403).json({ error: "Unauthorized: admin credentials required for delete action" });
        }
        const remoteItems = await fetchRemoteImprovements();
        const updatedList = remoteItems.filter((i) => i.id !== body.id);
        await saveRemoteImprovements(updatedList);
        return res.status(200).json({ status: "ok", action: "delete", id: body.id, result: updatedList, total: updatedList.length });
      }

      // 2. Explicit Update Action (Admin-Only)
      if (body.action === "update" && body.id) {
        if (!isAuthorizedAdmin) {
          return res.status(403).json({ error: "Unauthorized: admin credentials required for update action" });
        }
        const remoteItems = await fetchRemoteImprovements();
        const idx = remoteItems.findIndex((i) => i.id === body.id);
        if (idx !== -1) {
          const { action, ...updates } = body;
          if (updates.status === "resolved" && !updates.resolvedAt) {
            updates.resolvedAt = new Date().toISOString();
          }
          if (updates.fixSummary) {
            updates.fixSummary = String(updates.fixSummary).slice(0, 500);
          }
          if (updates.userNote) {
            updates.userNote = String(updates.userNote).slice(0, 2000);
          }
          remoteItems[idx] = { ...remoteItems[idx], ...updates };
          await saveRemoteImprovements(remoteItems);
        }
        return res.status(200).json({ status: "ok", action: "update", id: body.id, result: remoteItems, total: remoteItems.length });
      }

      // 3. Upsert / Add report entry or array of entries (Students & Public)
      const incomingEntries = Array.isArray(body)
        ? body
        : (body.entry ? [body.entry] : (body.id || body.deckKey ? [body] : []));

      if (incomingEntries.length === 0) {
        return res.status(400).json({ error: "Missing improvement payload" });
      }

      const validEntries = incomingEntries.slice(0, 10).map((e) => ({
        id: sanitizeId(e.id),
        timestamp: e.timestamp || new Date().toISOString(),
        deckKey: String(e.deckKey || "").slice(0, 64),
        questionId: String(e.questionId || "presentation-content").slice(0, 64),
        questionText: String(e.questionText || "").slice(0, 500),
        questionType: String(e.questionType || "presentation").slice(0, 32),
        category: String(e.category || "content_error").slice(0, 32),
        categoryLabel: String(e.categoryLabel || "Chyba v obsahu prezentace").slice(0, 64),
        userNote: String(e.userNote || "").slice(0, 2000),
        status: "open",
        resolvedAt: undefined,
        fixSummary: undefined,
      }));

      const remoteItems = await fetchRemoteImprovements();
      const byId = new Map();
      for (const item of remoteItems) {
        if (item && item.id) byId.set(item.id, item);
      }
      for (const item of validEntries) {
        if (item && item.id) {
          const existing = byId.get(item.id) || {};
          byId.set(item.id, { ...existing, ...item });
        }
      }

      const mergedList = Array.from(byId.values()).sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );

      await saveRemoteImprovements(mergedList);

      return res.status(200).json({
        status: "ok",
        total: mergedList.length,
        saved: validEntries.length,
        result: mergedList,
      });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
