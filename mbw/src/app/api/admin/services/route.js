import { NextResponse } from "next/server";
import Service from "@/models/serviceModel";
import { requireAdmin } from "@/helpers/adminAuth";
import { connectToDB } from "@/dbConfig/db";

export const dynamic = "force-dynamic";


export async function GET(request) {
  await connectToDB();

  const gate = requireAdmin(request);
  if (!gate.ok) return gate.res;

  const services = await Service.find().sort({ createdAt: -1 });
  return NextResponse.json({ data: services });
}

export async function POST(request) {
  const gate = requireAdmin(request);
  if (!gate.ok) return gate.res;

  try {
    const body = await request.json();
    const { name, description = "", price, durationMinutes, active = true } = body;
    if (!name || price == null || durationMinutes == null) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const created = await Service.create({ name, description, price, durationMinutes, active });
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
