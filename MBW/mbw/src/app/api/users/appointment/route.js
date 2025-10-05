import { NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Appointment from "@/models/appointmentModel";
import { getDataFromToken } from "@/helpers/userAuth";


connect();

export async function POST(request) {
  try {
    const authUserId = await getDataFromToken(request);
    if (!authUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { bikes, date } = await request.json();

    if (!Array.isArray(bikes) || bikes.length === 0 || !date) {
      return NextResponse.json({ error: "bikes[] and date are required" }, { status: 400 });
    }

    const normalizedDate = new Date(`${date}T00:00:00`);

    const doc = await Appointment.create({
      userId: authUserId,
      bikes,            
      date: normalizedDate,
    });

    return NextResponse.json(
      { message: "Appointment booked successfully", success: true, data: doc },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const userId = await getDataFromToken(request); 
    console.log(userId) 

    const appts = await Appointment.find({ 
      userId: userId,
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


