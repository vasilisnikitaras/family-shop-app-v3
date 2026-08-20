import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    const rows = await sql`
      SELECT * FROM first_logins
      ORDER BY timestamp DESC;
    `;

    return NextResponse.json({
      success: true,
      logins: rows,
    });
  } catch (err) {
    console.error("❌ getFirstLogins error:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
