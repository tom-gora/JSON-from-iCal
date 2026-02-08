import type { APIRoute } from "astro";
import { runJSoon } from "../../lib/jsoon";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { urls, options } = await request.json();
    const isVerbose = process.env.JSOON_WEB_VERBOSE === "true";
    const result = await runJSoon(urls, options);
    
    return new Response(JSON.stringify({ ...result, verbose: isVerbose }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
