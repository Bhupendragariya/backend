import mongoose from "mongoose";


const leaveConfigSchema = new mongoose.Schema({
  leaveTypes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LeaveType',
  }],

  //----carried forward rules-----
  enabledCarryForward: {
    type: Boolean,
    default: false
  },
  maximumCarryForwardDays: { //max no of unused leave days that can be carried forward
    type: Number,
    min: 0,
    default: 0
  },
  validityOfCarriedLeave: { //12 months
    period: {
      type: String,
      enum: ['monthly', 'quarterly', 'annually', 'biannually'],
      default: 'monthly'
    },
    duration: {
      type: Number,
      min: 1,
      default: 12
    },
  },
  cycleReset: {
    type: String,
    enum: ['monthly', 'quarterly', 'annually', 'biannually'],
    default: 'annually'
  },

  //----leave rules and restrictions-----
  maxAdvanceNoticePeriod: { //max no of days before which leave can be applied
    type: Number,
    min: 0,
    default: 0
  },
  maxConsecutiveLeaveDays: { //max no of consecutive leave days allowed
    type: Number,
    min: 0,
    default: 0
  },
  isBlockWeekendLeaveApplication: { //if true, leave application on weekends is blocked
    type: Boolean,
    default: false
  },
  isBlockHolidayLeaveApplication: { //if true, leave application on holidays is blocked
    type: Boolean,
    default: false
  },


}, { timestamps: true });

const LeaveConfig = mongoose.model("LeaveConfig", leaveConfigSchema);

export default LeaveConfig;