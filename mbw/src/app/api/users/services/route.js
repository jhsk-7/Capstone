// /app/api/services/route.js (Next.js App Router)
import { NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Service from "@/models/serviceModel";

connect();

export async function GET() {
  try {
    const services = await Service.find(); 
    return NextResponse.json({ data: services }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}
