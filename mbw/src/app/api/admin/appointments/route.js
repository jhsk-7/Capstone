import { NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Appointment from "@/models/appointmentModel";
import "@/models/userModel";
import "@/models/bikeModel";   
import "@/models/serviceModel"; 

connect();

export async function GET(request) {
  try {
    const appts = await Appointment.find({})
      .populate({
        path: "userId",
        select: "username", 
      })
      .populate("bikes.bikeId")
      .populate("bikes.services")
      .sort({ date: 1 })
      .lean();

    return NextResponse.json({ appointments: appts }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
