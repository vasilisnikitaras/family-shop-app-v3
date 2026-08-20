import { sql } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { id } = await request.json();

    await sql`
      DELETE FROM items_v2
      WHERE id = ${id}
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting item:", error);
    return Response.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}
