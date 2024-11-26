import { neon } from "@neondatabase/serverless";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const radius = Number(url.searchParams.get("radius")); // Default radius to 1 km
    const ratingThreshold = radius === 1 ? 4.0 : radius === 2 ? 3.0 : 0; // Define rating thresholds for each radius

    const sql = neon(`${process.env.DATABASE_URL}`);
    const response = await sql`
      SELECT * FROM drivers
      WHERE rating >= ${ratingThreshold}
    `;

    return Response.json({ data: response });
  } catch (error) {
    console.error("Error fetching drivers:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
