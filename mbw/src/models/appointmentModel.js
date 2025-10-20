import mongoose from "mongoose";
const { Schema, Types } = mongoose;

const BikeSelectionSchema = new Schema(
  {
    bikeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bike",
      required: true,
    },

    services: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        required: true,
      },
    ],
  },
  { _id: false }
);

const appointmentSchema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    bikes: {
      type: [BikeSelectionSchema],
      required: true,
      validate: (arr) => Array.isArray(arr) && arr.length > 0,
    },
    date: { type: Date, required: true }, // consider storing start-of-day UTC
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

// helpful indexes
appointmentSchema.index({ userId: 1, date: 1 });
appointmentSchema.index({ "bikes.bikeId": 1 });

export default mongoose.models.Appointment || mongoose.model("Appointment", appointmentSchema);