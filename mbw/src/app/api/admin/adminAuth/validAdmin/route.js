import { NextResponse } from "next/server";
import { connectToDB } from "@/dbConfig/db";
import Admin from "@/models/adminModel";
import { getAdminFromRequest } from "@/helpers/adminAuth"; 

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  await connectToDB();
  try {
    // Read and verify the admin_token cookie
    const decoded = getAdminFromRequest(request);

    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json(
        { authenticated: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Find the admin
    const admin = await Admin.findById(decoded.id).select("-password");
    if (!admin) {
      return NextResponse.json(
        { authenticated: false, error: "Admin not found" },
        { status: 404 }
      );
    }

    // Success
    return NextResponse.json({
      authenticated: true,
      message: "Admin authenticated",
      data: {
        id: admin._id,
        email: admin.email,
        role: "admin",
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        authenticated: false,
        error: err.message || "Server error",
      },
      { status: 400 }
    );
  }
}
