export default {
  async fetch(request, env) {
    try {
      // --- CORS ---
      if (request.method === "OPTIONS") {
        return new Response("", {
          status: 204,
          headers: corsHeaders(),
        });
      }

      if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
      }

      const { pathname } = new URL(request.url);
      const data = await request.json();

      // --- Routing ---
      if (pathname.endsWith("/subscribe")) {
        return await forwardToAppScript(env.APP_SCRIPT_URL, {
          type: "subscribe",
          email: data.email,
        });
      }

      if (pathname.endsWith("/validate")) {
        return await forwardToAppScript(env.APP_SCRIPT_URL, {
          type: "check",
          email: data.email,
        });
      }

      if (pathname.endsWith("/review")) {
        return await forwardToAppScript(env.APP_SCRIPT_URL, {
          type: "review",
          ...data,
        });
      }

      return new Response(
        JSON.stringify({ status: "error", message: "Unknown endpoint" }),
        { headers: corsHeaders(), status: 404 }
      );
    } catch (err) {
      return new Response(
        JSON.stringify({ status: "error", message: err.message }),
        { headers: corsHeaders(), status: 500 }
      );
    }
  },
};

// --- Helper untuk forward request ke Google Apps Script ---
async function forwardToAppScript(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const text = await res.text();

  return new Response(text, {
    headers: corsHeaders(),
  });
}

// --- CORS headers ---
function corsHeaders() {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
