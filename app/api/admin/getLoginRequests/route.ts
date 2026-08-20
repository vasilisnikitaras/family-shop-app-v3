import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    const rows = await sql`
      SELECT * FROM login_requests
      ORDER BY requested_at DESC;
    `;

    return NextResponse.json({
      success: true,
      requests: rows,
    });
  } catch (err) {
    console.error("getLoginRequests error:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
