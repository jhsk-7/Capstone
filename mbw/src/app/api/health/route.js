// app/api/health/route.js
export async function GET() { return new Response("ok", { status: 200 }); }