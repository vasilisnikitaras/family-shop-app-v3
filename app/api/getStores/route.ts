import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { family_code } = await request.json();

    if (!family_code) {
      return NextResponse.json({ stores: [] });
    }

    // Βρες το family_id
    const family = await sql`
      SELECT id FROM families WHERE family_code = ${family_code}
    `;
    if (family.length === 0) {
      return NextResponse.json({ stores: [] });
    }

    const family_id = family[0].id;

    // Φέρε όλα τα stores για το family
    const stores = await sql`
      SELECT 
        id,
        store_name AS name,
        created_at,
        family_id
      FROM stores_v2
      WHERE family_id = ${family_id}
      ORDER BY store_name ASC
    `;

    return NextResponse.json({ stores }, { status: 200 });

  } catch (error) {
    console.error("Error fetching stores:", error);
    return NextResponse.json(
      { error: "Failed to fetch stores" },
      { status: 500 }
    );
  }
}
