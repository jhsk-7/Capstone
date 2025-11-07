// /app/api/bikes/myBikes/route.js
import { NextResponse } from "next/server";
import { connectToDB } from "@/dbConfig/db";
import Bike from "@/models/bikeModel";
import { getDataFromToken } from "@/helpers/userAuth";



export const dynamic = "force-dynamic";

export async function GET(request) {
  await connectToDB();
  
  try {
    const userId = await getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Pagination
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "20", 10), 1),
      100
    );
    const skip = (page - 1) * limit;

    // Search & filters
    const q = (searchParams.get("q") || "").trim();
    const color = (searchParams.get("color") || "").trim().toLowerCase();
    const hasPicture = searchParams.get("hasPicture"); // "true" | "false" | null

    const query = { user: userId };
    if (q) {
      query.$or = [
        { nickname: { $regex: q, $options: "i" } },
        { make: { $regex: q, $options: "i" } },
        { model: { $regex: q, $options: "i" } },
      ];
    }
    if (color) query.color = color;
    if (hasPicture === "true") query.picture = { $exists: true, $ne: null };
    if (hasPicture === "false") query.$or = [{ picture: null }, { picture: { $exists: false } }, { picture: "" }];

    // Sorting (default by nickname asc; allow ?sort=-createdAt if your schema has timestamps)
    const sortParam = (searchParams.get("sort") || "nickname").trim();
    let sort = {};
    if (sortParam.startsWith("-")) {
      sort[sortParam.slice(1)] = -1;
    } else {
      sort[sortParam] = 1;
    }

    const [total, items] = await Promise.all([
      Bike.countDocuments(query),
      Bike.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .select("_id nickname make model color picture createdAt updatedAt"),
    ]);

    const meta = {
      total,
      page,
      limit,
      hasMore: skip + items.length < total,
    };

    const res = NextResponse.json(
      { message: "Bikes retrieved successfully", data: items, meta },
      { status: 200 }
    );
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
