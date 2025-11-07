import { NextResponse } from "next/server";
import { connectToDB } from "@/dbConfig/db";
import Service from "@/models/serviceModel";
import { requireAdmin } from "@/helpers/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";


export async function PATCH(request, { params }) {
  await connectToDB();
  
  const gate = requireAdmin(request);
  if (!gate.ok) return gate.res;

  try {
    const updates = await request.json();
    const updated = await Service.findByIdAndUpdate(params.id, updates, { new: true });
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: updated });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const gate = requireAdmin(request);
  if (!gate.ok) return gate.res;

  try {
    const deleted = await Service.findByIdAndDelete(params.id);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ message: "Deleted" });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
