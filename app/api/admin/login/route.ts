export async function POST(req: Request) {
  const { username, password } = await req.json();

  if (username !== "admin" || password !== "admin123") {
    return Response.json({ success: false, message: "Invalid credentials" });
  }

  return Response.json({
    success: true,
    token: "admin_session_token"
  });
}
