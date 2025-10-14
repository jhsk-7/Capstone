import { NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Appointment from "@/models/appointmentModel";
import "@/models/userModel";
import "@/models/bikeModel";   
import "@/models/serviceModel"; 
import { getDataFromToken } from "@/helpers/userAuth";
import mongoose from "mongoose";

connect();

export async function GET(request, context) {
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
