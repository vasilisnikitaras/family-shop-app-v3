import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    await sql`
      UPDATE login_requests
      SET status = 'denied'
      WHERE id = ${id};
    `;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("denyLogin error:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
