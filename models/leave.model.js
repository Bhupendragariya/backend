import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema({
   user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },

  leaveType: {
    type: String,
    enum: ["Casual Leave", "Sick Leave", "Earned Leave", "Maternity Leave", "Other"],
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
  },
  reviewedAt: {
      type: Date,
    },

     reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      default: null,
    },

});

const Leave = mongoose.model("Leave", leaveSchema);

export default Leave;
