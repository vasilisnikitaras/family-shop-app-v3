import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(req: Request) {
  try {
    const { family_code, family_password } = await req.json();

    if (!family_code || !family_password) {
      return NextResponse.json(
        { success: false, message: "Missing fields" },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO families (family_code, family_password, created_at)
      VALUES (${family_code}, ${family_password}, NOW())
      RETURNING *;
    `;

    return NextResponse.json({
      success: true,
      family: result[0],
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Error creating family" },
      { status: 500 }
    );
  }
}
