import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { family_code } = await request.json();

    if (!family_code) {
      return NextResponse.json(
        { error: "Missing family_code" },
        { status: 400 }
      );
    }

    // Delete items
    await sql`
      DELETE FROM items_v2
      WHERE family_code = ${family_code};
    `;

    // Delete stores
    await sql`
      DELETE FROM stores_v2
      WHERE family_code = ${family_code};
    `;

    // Delete family record
    await sql`
      DELETE FROM families_v2
      WHERE family_code = ${family_code};
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting family:", error);
    return NextResponse.json(
      { error: "Failed to delete family" },
      { status: 500 }
    );
  }
}
