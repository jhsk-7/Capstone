
import { NextResponse } from "next/server";
import { connectToDB } from "@/dbConfig/db";
import Appointment from "@/models/appointmentModel";
import "@/models/userModel";
import "@/models/bikeModel";   
import "@/models/serviceModel"; 
import mongoose from "mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";


export async function GET(request, context) {
  await connectToDB();

  try {
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid appointment id" }, { status: 400 });
    }

    const appt = await Appointment.findOne({
      _id: id,
    })
      .populate({path: "userId", select: "username"})
      .populate({ path: "bikes.bikeId", select: "nickname" }) 
      .populate({ path: "bikes.services", select: "name" })   
      .lean();

    if (!appt) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    const res = NextResponse.json(
      { message: "Appointment retrieved successfully", data: appt },
      { status: 200 }
    );
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || "Server error" },
      { status: 500 }
    );
  }
}


export async function PATCH(request, context) {
  try {
    const { id } = context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid appointment id" }, { status: 400 });
    }
    const body = await request.json();
    const { status } = body;
    if (!status || !["Pending", "Confirmed", "Completed", "Cancelled"].includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }
    const updated = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).lean();
    if (!updated) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Status updated", data: updated }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error?.message || "Server error" }, { status: 500 });
  }
}