import { NextResponse } from "next/server";
import { Pool } from "@neondatabase/serverless";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT id, family_code, store_name, created_at
       FROM stores
       ORDER BY store_name ASC`
    );

    return NextResponse.json({ stores: result.rows }, { status: 200 });
  } catch (error) {
    console.error("Error fetching stores:", error);
    return NextResponse.json(
      { error: "Server error while fetching stores" },
      { status: 500 }
    );
  }
}
