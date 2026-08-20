import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(req: Request) {
  try {
    const { family_code, family_password } = await req.json();

    if (!family_code || !family_password) {
      return NextResponse.json(
        { success: false, message: "Missing family code or password" },
        { status: 400 }
      );
    }

    // 🔥 Βρίσκουμε την οικογένεια
    const existing = await sql`
      SELECT * FROM families WHERE family_code = ${family_code};
    `;

    // 🔥 Αν ΔΕΝ υπάρχει → AUTO CREATE
    if (existing.length === 0) {
      const created = await sql`
        INSERT INTO families (
          name,
          family_code,
          family_password,
          is_online,
          is_active,
          last_seen
        )
        VALUES (
          'New Family',
          ${family_code},
          ${family_password},
          TRUE,
          TRUE,
          NOW()
        )
        RETURNING *;
      `;

      // 🔥 First login tracking για νέο family
      const userAgent = req.headers.get("user-agent") || "Unknown Device";

      await sql`
        INSERT INTO first_logins (family_code, device)
        VALUES (${family_code}, ${userAgent});
      `;

      return NextResponse.json({
        success: true,
        message: "Family created automatically",
        family: created[0],
      });
    }

    // 🔥 Αν υπάρχει → password check
    const fam = existing[0];
    const realPassword = fam.family_password;

    if (!realPassword) {
      return NextResponse.json(
        { success: false, message: "Family has no password set" },
        { status: 401 }
      );
    }

    if (String(realPassword) !== String(family_password)) {
      return NextResponse.json(
        { success: false, message: "Wrong password" },
        { status: 401 }
      );
    }

    // 🔥 First login check (μόνο την πρώτη φορά)
    const first = await sql`
      SELECT * FROM first_logins
      WHERE family_code = ${family_code}
      LIMIT 1;
    `;

    if (first.length === 0) {
      const userAgent = req.headers.get("user-agent") || "Unknown Device";

      await sql`
        INSERT INTO first_logins (family_code, device)
        VALUES (${family_code}, ${userAgent});
      `;
    }

    // 🔥 LOGIN SUCCESS
    return NextResponse.json({
      success: true,
      message: "Login successful",
      family: fam,
    });

  } catch (err) {
    console.error("❌ loginFamily error:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
