import { NextResponse } from "next/server";
import { sql } from "@/lib/neon";

export async function POST(req: Request) {
  const body = await req.json();
  const { family_code, new_password } = body;

  if (!family_code || !new_password) {
    return NextResponse.json({ success: false, message: "Missing data" });
  }

  try {
    await sql`
      UPDATE families
      SET family_password = ${new_password}
      WHERE family_code = ${family_code}
    `;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "DB error" });
  }
}
