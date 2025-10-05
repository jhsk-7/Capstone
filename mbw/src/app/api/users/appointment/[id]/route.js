import { NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Appointment from "@/models/appointmentModel";
import { getDataFromToken } from "@/helpers/userAuth";
import mongoose from "mongoose";

connect();

// GET /api/service/appointment/[id]
export async function GET(request, context) {
  try {
    const userId = await getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid appointment id" }, { status: 400 });
    }

    // Single query: verify ownership AND populate the fields you need
    const appt = await Appointment.findOne({
      userId: userId,
    })
      .populate({ path: "bikes.bikeId", select: "nickname" }) 
      .populate({ path: "bikes.services", select: "name" })   
      .select("_id status notes date bikes createdAt updatedAt user userId")
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
    console.error("GET /api/service/appointment/[id] error:", error);
    return NextResponse.json(
      { error: error?.message || "Server error" },
      { status: 500 }
    );
  }
}
