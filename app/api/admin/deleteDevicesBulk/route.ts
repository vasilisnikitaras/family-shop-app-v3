import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(req: Request) {
  try {
    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Missing ids array" }, { status: 400 });
    }

    await sql`
      DELETE FROM devices
      WHERE id IN (SELECT UNNEST(ARRAY[${ids.join(',')}]));
    `;

    return NextResponse.json({
      success: true,
      deleted: ids.length,
      received: ids
    });

  } catch (error) {
    return NextResponse.json({ error: "Failed to bulk delete devices" }, { status: 500 });
  }
}
