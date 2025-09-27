import { NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Bundle from "@/models/bundleModel";
import Service from "@/models/serviceModel";
import { requireAdmin } from "@/helpers/requireAdmin";

connect();

export async function PATCH(request, { params }) {
  const gate = requireAdmin(request);
  if (!gate.ok) return gate.res;

  try {
    const updates = await request.json();

    // If updating price or services, revalidate bundle pricing rule
    if (updates.price != null || updates.serviceIds?.length) {
      const idList = updates.serviceIds || (await Bundle.findById(params.id)).serviceIds;
      const services = await Service.find({ _id: { $in: idList } });
      const sum = services.reduce((a, s) => a + s.price, 0);
      const price = updates.price != null ? updates.price : (await Bundle.findById(params.id)).price;
      if (price >= sum) {
        return NextResponse.json(
          { error: `Bundle price must be lower than sum of services (${sum})` },
          { status: 400 }
        );
      }
    }

    const updated = await Bundle.findByIdAndUpdate(params.id, updates, { new: true }).populate("serviceIds");
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
    const deleted = await Bundle.findByIdAndDelete(params.id);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ message: "Deleted" });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
