import mongoose from "mongoose";
const { Schema, Types } = mongoose;

const bikeSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    nickname: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    make: {
      type: String,
      trim: true,
      maxlength: 60,
      default: "",
    },
    model: {
      type: String,
      trim: true,
      maxlength: 60,
      default: "",
    },
    color: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 40,
    },
    picture: {
      type: String,
      trim: true,
      default: null, // not required; your API can set a path/URL when available
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
      },
    },
    toObject: { virtuals: true },
  }
);

// Optional but useful: prevent duplicate nicknames per user
bikeSchema.index({ user: 1, nickname: 1 }, { unique: true });

export default mongoose.models.Bike || mongoose.model("Bike", bikeSchema);
