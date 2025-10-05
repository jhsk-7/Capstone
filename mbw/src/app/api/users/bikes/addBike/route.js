// /app/api/bikes/route.js (or route.ts)
import { NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Bike from "@/models/bikeModel";
import { getDataFromToken } from "@/helpers/userAuth";
import fs from "fs/promises";
import path from "path";

connect();

export async function POST(req) {
  try {
    const userId = await getDataFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";
    const payload = {
      nickname: "",
      make: "",
      model: "",
      color: "",
      picture: null,
    };

    if (contentType.includes("application/json")) {
      const body = await req.json();
      payload.nickname = body.nickname ?? "";
      payload.make = body.make ?? "";
      payload.model = body.model ?? "";
      payload.color = body.color ?? "";
      payload.picture = body.picture ?? null; // allow a URL / data-uri string
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      payload.nickname = formData.get("nickname") ?? "";
      payload.make = formData.get("make") ?? "";
      payload.model = formData.get("model") ?? "";
      payload.color = formData.get("color") ?? "";

      const file = formData.get("picture");
      // If a file was actually picked, save it under /public/uploads
      if (file && typeof file === "object" && "arrayBuffer" in file) {
        const bytes = await file.arrayBuffer();
        if (bytes.byteLength > 0) {
          const buffer = Buffer.from(bytes);
          const uploadDir = path.join(process.cwd(), "public", "uploads");
          await fs.mkdir(uploadDir, { recursive: true });

          const safeName =
            `${Date.now()}-` + String(file.name || "upload").replace(/[^a-z0-9.\-_]/gi, "");
          const filePath = path.join(uploadDir, safeName);
          await fs.writeFile(filePath, buffer);

          payload.picture = `/uploads/${safeName}`;
        }
      } else {
        // If you sent a string "picture" in form-data (e.g., a URL)
        const picStr = formData.get("picture");
        if (typeof picStr === "string" && picStr.trim()) {
          payload.picture = picStr.trim();
        }
      }
    } else {
      return NextResponse.json({ error: "Unsupported Content-Type" }, { status: 415 });
    }

    const bike = await Bike.create({
      user: userId,
      nickname: payload.nickname.trim(),
      make: payload.make.trim(),
      model: payload.model.trim(),
      color: payload.color.trim(),
      picture: payload.picture, // can be null, URL, or /uploads/xxx
    });

    return NextResponse.json({ message: "Bike created", data: bike }, { status: 201 });
  } catch (error) {
      return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
