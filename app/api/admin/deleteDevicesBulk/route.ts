import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  const { ids } = await req.json();

  if (!ids || !Array.isArray(ids)) {
    return NextResponse.json({ success: false });
  }

  // Neon-safe bulk delete using UNNEST
  await sql`
    DELETE FROM admin_devices
    WHERE id IN (SELECT UNNEST(${ids}::int[]));
  `;

  return NextResponse.json({ success: true });
}
