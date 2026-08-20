import { NextResponse } from "next/server";
import { sql } from "@/lib/neon";

export async function POST(req: Request) {
  const body = await req.json();
  const { old_code, new_code } = body;

  if (!old_code || !new_code) {
    return NextResponse.json({ success: false, message: "Missing data" });
  }

  try {
    await sql`
      UPDATE families
      SET family_code = ${new_code}
      WHERE family_code = ${old_code}
    `;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "DB error" });
  }
}
