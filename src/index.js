export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response("", {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    try {
      const url = env.SHEET_URL; // di-set dari Cloudflare Worker Settings → Variables
      if (!url) {
        return new Response(
          JSON.stringify({ status: "error", message: "SHEET_URL not set" }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }

      const body = await request.text();
      const resp = await fetch(url, {
        method: request.method,
        headers: { "Content-Type": "application/json" },
        body: body,
      });

      const data = await resp.text();

      return new Response(data, {
        status: resp.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (err) {
      return new Response(
        JSON.stringify({ status: "error", message: err.toString() }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  },
};
