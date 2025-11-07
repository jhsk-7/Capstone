// /app/api/services/route.js (Next.js App Router)
import { NextResponse } from "next/server";
import { connectToDB } from "@/dbConfig/db";
import Service from "@/models/serviceModel";

export async function GET() {
  await connectToDB();
  
  try {
    const services = await Service.find(); 
    return NextResponse.json({ data: services }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}
