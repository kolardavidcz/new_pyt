/**
 * Vercel Serverless Function: Question & Slide Improvements API
 * Cloud-First Single Source of Truth for feedback reports in Upstash Redis (key: pyt:global:question_improvements).
 */

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const kvUrl = process.env.UPSTASH_REDIS_REST_URL || "https://tough-husky-101028.upstash.io";
  const kvToken = process.env.UPSTASH_REDIS_REST_TOKEN || "gQAAAAAAAYqkAAIgcDFiZjJmZTQ3MWE4OTg0MWJjOWUwYmY5ZjU3MGEzOTg3NA";
  const REDIS_KEY = "pyt:global:question_improvements";

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
      const body = req.body || {};

      // 1. Explicit Delete Action
      if (body.action === "delete" && body.id) {
        const remoteItems = await fetchRemoteImprovements();
        const updatedList = remoteItems.filter((i) => i.id !== body.id);
        await saveRemoteImprovements(updatedList);
        return res.status(200).json({ status: "ok", action: "delete", id: body.id, result: updatedList, total: updatedList.length });
      }

      // 2. Explicit Update Action (Status, fixSummary)
      if (body.action === "update" && body.id) {
        const remoteItems = await fetchRemoteImprovements();
        const idx = remoteItems.findIndex((i) => i.id === body.id);
        if (idx !== -1) {
          if (body.status) remoteItems[idx].status = body.status;
          if (body.resolvedAt) remoteItems[idx].resolvedAt = body.resolvedAt;
          else if (body.status === "resolved") remoteItems[idx].resolvedAt = new Date().toISOString();
          if (body.fixSummary !== undefined) remoteItems[idx].fixSummary = body.fixSummary;
          await saveRemoteImprovements(remoteItems);
        }
        return res.status(200).json({ status: "ok", action: "update", id: body.id, result: remoteItems, total: remoteItems.length });
      }

      // 3. Upsert / Add report entry or array of entries
      const incomingEntries = Array.isArray(body)
        ? body
        : (body.entry ? [body.entry] : (body.id || body.deckKey ? [body] : []));

      if (incomingEntries.length === 0) {
        return res.status(400).json({ error: "Missing improvement payload" });
      }

      const validEntries = incomingEntries.map((e) => ({
        id: e.id || `imp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: e.timestamp || new Date().toISOString(),
        deckKey: e.deckKey || "",
        questionId: e.questionId || "presentation-content",
        questionText: e.questionText || "",
        questionType: e.questionType || "presentation",
        category: e.category || "content_error",
        categoryLabel: e.categoryLabel || "Chyba v obsahu prezentace",
        userNote: e.userNote || "",
        status: e.status || "open",
        resolvedAt: e.resolvedAt || undefined,
        fixSummary: e.fixSummary || undefined,
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
