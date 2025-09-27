import { NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Bundle from "@/models/bundleModel";
import Service from "@/models/serviceModel";
import { requireAdmin } from "@/helpers/requireAdmin";

connect();

export async function GET(request) {
  const gate = requireAdmin(request);
  if (!gate.ok) return gate.res;

  const bundles = await Bundle.find().populate("serviceIds").sort({ createdAt: -1 });
  return NextResponse.json({ data: bundles });
}

export async function POST(request) {
  const gate = requireAdmin(request);
  if (!gate.ok) return gate.res;

  try {
    const body = await request.json();
    const { name, description = "", serviceIds, price, active = true } = body;

    if (!name || !serviceIds?.length || price == null) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Validate price is lower than sum of services
    const services = await Service.find({ _id: { $in: serviceIds } });
    const sum = services.reduce((acc, s) => acc + s.price, 0);
    if (price >= sum) {
      return NextResponse.json(
        { error: `Bundle price must be lower than sum of services (${sum})` },
        { status: 400 }
      );
    }

    const created = await Bundle.create({ name, description, serviceIds, price, active });
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
