import jwt from "jsonwebtoken";

export function signAdminJWT(admin) {
  return jwt.sign(
    { id: admin._id, role: "admin", email: admin.email },
    process.env.TOKEN_SECRET,
    { expiresIn: "7d" }
  );
}

export function getAdminFromRequest(request) {
  const token = request.cookies.get("admin_token")?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.TOKEN_SECRET);
  } catch {
    return null;
  }
}
