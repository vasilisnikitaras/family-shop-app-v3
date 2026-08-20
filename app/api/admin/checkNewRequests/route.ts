import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    const rows = await sql`
      SELECT COUNT(*) AS pending_count
      FROM login_requests
      WHERE status = 'pending';
    `;

    return NextResponse.json({
      success: true,
      pending: Number(rows[0].pending_count),
    });

  } catch (err) {
    console.error("checkNewRequests error:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
