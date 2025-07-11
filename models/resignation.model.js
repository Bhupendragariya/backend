import mongoose from "mongoose";

const resignationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  note: {
    type: String,
    required: true,
  },
  proposedLastWorkingDate: {
    type: Date,
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
});

const Resignation = mongoose.model("Resignation", resignationSchema);

export default Resignation;
