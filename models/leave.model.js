import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },

  type: { 
    type: String,
     enum: ["Paid", "Sick", "Casual"],
      required: true 
    },
  startDate: Date,
  endDate: Date,
  reason: String,
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
  requestedOn: { type: Date, default: Date.now },
});

const Leave = mongoose.model("Leave", leaveSchema);

export default Leave;
