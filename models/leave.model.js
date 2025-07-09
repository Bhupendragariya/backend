import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema({
   user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  leaveType: {
    type: String,
    required: true
  },

  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  comment: {
    type: String
  },
  

  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
  createdAt: {
    type: Date,
    default: Date.now
  }

});

const Leave = mongoose.model("Leave", leaveSchema);

export default Leave;
