import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const families = await sql`
      SELECT id, family_code, family_password, created_at
      FROM families
      ORDER BY id ASC;
    `;

    return NextResponse.json({ success: true, families });
  } catch (error) {
    console.error("Error fetching families:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch families" },
      { status: 500 }
    );
  }
}
