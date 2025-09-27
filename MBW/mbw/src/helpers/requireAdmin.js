import { NextResponse } from "next/server";
import { getAdminFromRequest } from "@/helpers/adminAuth";

export function requireAdmin(request) {
  const admin = getAdminFromRequest(request);
  if (!admin || admin.role !== "admin") {
    return { ok: false, res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { ok: true, admin };
}
