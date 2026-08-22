import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { family_code } = await request.json();

    if (!family_code) {
      return NextResponse.json({ items: [] });
    }

    // Βρες το family_id
    const family = await sql`
      SELECT id FROM families WHERE family_code = ${family_code}
    `;
    if (family.length === 0) {
      return NextResponse.json({ items: [] });
    }

    const family_id = family[0].id;

    // ΠΡΕΠΕΙ ΝΑ ΕΠΙΣΤΡΕΨΟΥΜΕ added_by !!!
   const items = await sql`
  SELECT 
    id,
    name,
    quantity,
    store_id,
    is_checked,
    added_by
  FROM items_v2
  WHERE family_id = ${family_id}
  ORDER BY id DESC
`;

const normalized = items.map((x) => ({
  ...x,
  id: String(x.id),
  store_id: String(x.store_id),
}));

return NextResponse.json({ items: normalized });


  } catch (error) {
    console.error("Error fetching list:", error);
    return NextResponse.json(
      { error: "Failed to fetch list" },
      { status: 500 }
    );
  }
}
