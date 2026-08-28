import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(req: Request) {
  try {
    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Missing ids array" }, { status: 400 });
    }

    // 🔥 FIX: Convert string IDs → numbers
    const cleanIds = ids.map((id: any) => Number(id));

    await sql`
      DELETE FROM devices
      WHERE id IN (${cleanIds});
    `;

    return NextResponse.json({
      success: true,
      deleted: cleanIds.length,
      received: cleanIds
    });

  } catch (error: any) {
    console.error("Bulk delete error:", error);
    return NextResponse.json(
      { error: error?.message || "Unknown SQL error" },
      { status: 500 }
    );
  }
}
