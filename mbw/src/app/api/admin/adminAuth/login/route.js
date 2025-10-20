import { NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Admin from "@/models/adminModel";
import bcrypt from "bcryptjs";
import { serialize } from "cookie";
import { signAdminJWT } from "@/helpers/adminAuth";


connect();

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const admin = await Admin.findOne({
      email: email 
    });
    if (!admin) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const ok = await bcrypt.compare(password, admin.password);
    if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const token = signAdminJWT(admin);
    const cookie = serialize("admin_token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return NextResponse.json(
      { message: "Logged in", user: { id: admin._id, email: admin.email, username: admin.username } },
      { status: 200, headers: { "Set-Cookie": cookie } }
    );
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
