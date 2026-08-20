import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function POST() {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    // 1) Μεταφέρουμε ΟΛΑ τα orphan items σε ένα σωστό family (π.χ. 5023)
    await sql`
      UPDATE items_v2
      SET family_id = 5023
      WHERE family_id IN (
        SELECT id FROM families WHERE family_code = 'DEFAULT'
      );
    `;

    // 2) Σβήνουμε ΟΛΑ τα DEFAULT families
    await sql`
      DELETE FROM families
      WHERE family_code = 'DEFAULT';
    `;

    return NextResponse.json({
      success: true,
      message: "Orphan items moved & DEFAULT families deleted"
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to clean DEFAULT families" },
      { status: 500 }
    );
  }
}
