export default {
  async fetch(request, env) {
    try {
      if (request.method === "OPTIONS") {
        return new Response("", {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        });
      }

      if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
      }

      const data = await request.json();
      const type = data.type;

      if (type === "subscribe") {
        // langsung forward ke Google Apps Script
        return await forwardToAppScript(env.APP_SCRIPT_URL, data);
      }

      if (type === "check") {
        // cek status email di Apps Script
        return await forwardToAppScript(env.APP_SCRIPT_URL, data);
      }

      if (type === "review") {
        // validasi & simpan review
        return await forwardToAppScript(env.APP_SCRIPT_URL, data);
      }

      return new Response(JSON.stringify({ status: "error", message: "Unknown type" }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        status: 400,
      });
    } catch (err) {
      return new Response(JSON.stringify({ status: "error", message: err.message }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        status: 500,
      });
    }
  },
};

async function forwardToAppScript(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const text = await res.text();
  try {
    return new Response(text, {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ status: "error", message: "Invalid response from Apps Script" }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      status: 500,
    });
  }
}
