import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// 🔥 Email sender (SendGrid / Resend / SMTP)
async function sendApprovalEmail(family_code: string) {
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "VNF Software <no-reply@vnfsoftware.com>",
        to: "vasilis.nikitaras@gmail.com",
        subject: `Login Request: ${family_code}`,
        html: `
          <h2>New Login Request</h2>
          <p>Family <b>${family_code}</b> is trying to log in.</p>
          <p>Approve or deny here:</p>
          <a href="https://your-admin-url.com/admin/login-requests">
            Open Login Requests
          </a>
        `,
      }),
    });
  } catch (err) {
    console.error("Email error:", err);
  }
}

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

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, message: "Family not found" },
        { status: 404 }
      );
    }

    const fam = existing[0];

    // 🔥 Βρίσκουμε το πραγματικό password
    const realPassword =
      fam.password ??
      fam.family_password ??
      fam.code ??
      fam.last_login;

    if (String(realPassword) !== String(family_password)) {
      return NextResponse.json(
        { success: false, message: "Wrong password" },
        { status: 401 }
      );
    }

    // 🔥 Δημιουργούμε login request
    const request = await sql`
      INSERT INTO login_requests (family_code, requested_at, status)
      VALUES (${family_code}, NOW(), 'pending')
      RETURNING *;
    `;

    // 🔥 Στέλνουμε email σε εσένα
    await sendApprovalEmail(family_code);

    return NextResponse.json({
      success: true,
      message: "Login request sent for approval",
      request: request[0],
    });

  } catch (err) {
    console.error("❌ loginFamily error:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
