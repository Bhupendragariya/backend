import mongoose from "mongoose";


const leaveTypeSchema = new mongoose.Schema({
  name: { //annual leave,sick leave,casual leave,maternity leave,privelage leave,wfh,earned leave
    type: String,
    enum: ["Sick Leave", "Earned Leave", "Casual Leave", "Maternity Leave", "Other"],
    required: [true, 'Leave type name is required'],
  },
  type: {
    type: String,
    enum: ['paid', 'unpaid'],
    default: 'paid',
  },
  totalLeaveDays: {
    type: Number,
    min: [1, 'Total leave days must be greater than 0'],
    required: [true, 'Total leave days must be specified']
  },
  frequency: {
    type: String,
    enum: ['monthly', 'quarterly', 'annually', 'biannually'],
    default: 'monthly'
  },
  enabledCarryForward: {
    type: Boolean,
    default: false
  },
  enabledRequireApproval: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
}, { timestamps: true });

const LeaveType = mongoose.model("LeaveType", leaveTypeSchema);

export default LeaveType;