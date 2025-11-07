import { NextResponse } from "next/server";
import { connectToDB } from "@/dbConfig/db";
import Bike from "@/models/bikeModel";
import Appointment from "@/models/appointmentModel"; // ✅ needed
import { getDataFromToken } from "@/helpers/userAuth";
import mongoose from "mongoose";


// GET /api/bikes/myBikes/[id]
export async function GET(request, context) {
  await connectToDB();

  try {
    const userId = await getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params; // ✅ await params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid bike id" }, { status: 400 });
    }

    // If your Bike schema uses 'userId' instead of 'user', swap the field below.
    const bike = await Bike.findOne({ _id: id, user: userId })
      .lean()
      .select("_id nickname make model color picture createdAt updatedAt");

    if (!bike) {
      return NextResponse.json({ error: "Bike not found" }, { status: 404 });
    }

    const res = NextResponse.json(
      { message: "Bike retrieved successfully", data: bike },
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

// DELETE /api/bikes/myBikes/[id]  (cascade: delete related appointments too)
export async function DELETE(request, context) {
  try {
    const userId = await getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params; // ✅ await params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid bike id" }, { status: 400 });
    }

    // Verify the bike belongs to the user first
    const bike = await Bike.findOne({ _id: id, user: userId })
      .select("_id")
      .lean();
    if (!bike) {
      return NextResponse.json({ error: "Bike not found" }, { status: 404 });
    }

    const bikeObjectId = new mongoose.Types.ObjectId(id);

    // Simple sequential deletes (works without transactions)
    const apptResult = await Appointment.deleteMany({
      userId: userId,                    // if your schema uses 'userId', swap this field
      "bikes.bikeId": bikeObjectId,
    });
    const bikeResult = await Bike.deleteOne({ _id: bikeObjectId, user: userId });

    return NextResponse.json(
      {
        message: "Bike and related appointments deleted",
        data: {
          deletedAppointments: apptResult.deletedCount ?? 0,
          deletedBike: bikeResult.deletedCount ?? 0,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/bikes/myBikes/[id] error:", error);
    return NextResponse.json(
      { error: error?.message || "Server error" },
      { status: 500 }
    );
  }
}

