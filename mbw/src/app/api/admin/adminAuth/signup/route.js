import { NextResponse } from "next/server";
import { connectToDB } from "@/dbConfig/db";
import Admin from "@/models/adminModel";
import bcrypt from "bcryptjs";
import { serialize } from "cookie";
import { signAdminJWT } from "@/helpers/adminAuth";

export async function POST(request) {
  await connectToDB();

  try {
    const { email, username, password, secretCode } = await request.json();

    if (!email || !username || !password || !secretCode) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (secretCode !== process.env.ADMIN_SIGNUP_CODE) {
      return NextResponse.json({ error: "Invalid secret code" }, { status: 403 });
    }

    const exists = await Admin.findOne({ $or: [{ email }, { username }] });
    if (exists) {
      return NextResponse.json({ error: "Admin user already exists" }, { status: 400 });
    }

    const hash = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ email, username, password: hash });

    const token = signAdminJWT(admin);
    const cookie = serialize("admin_token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return NextResponse.json(
      { message: "Admin created", user: { id: admin._id, email, username } },
      { status: 201, headers: { "Set-Cookie": cookie } }
    );
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
