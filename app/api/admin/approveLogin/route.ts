import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(req: Request) {
  try {
    const { id } = await req.json();
    const numericId = Number(id); // ⭐ ΤΟ FIX

    await sql`
      UPDATE login_requests
      SET status = 'approved'
      WHERE id = ${numericId};
    `;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("approveLogin error:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
