import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { family_code, is_active } = await request.json();

    if (!family_code || typeof is_active !== "boolean") {
      return NextResponse.json(
        { error: "Missing family_code or is_active" },
        { status: 400 }
      );
    }

    await sql`
      UPDATE families_v2
      SET is_active = ${is_active}
      WHERE family_code = ${family_code};
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error toggling family active state:", error);
    return NextResponse.json(
      { error: "Failed to toggle family active state" },
      { status: 500 }
    );
  }
}
