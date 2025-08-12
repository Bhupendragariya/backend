import mongoose from "mongoose";

const attendanceConfigSchema = new mongoose.Schema({
  //-------check-in/out rules-----------
  checkInbufferTime: {//min
    type: Number,
    min: 0,
    default: 20
  },
  checkOutbufferTime: {//min
    type: Number,
    min: 0,
    default: 20
  },
  LateMarkThreshold: {//min
    type: Number,
    min: 0,
    default: 60
  },
  HalfDayThreshold: {//hr
    type: Number,
    min: 0,
    default: 4
  },




  //--------weekend and holiday rules--------
  weekendDays: {
    type: [String],
    enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    default: ['Saturday', 'Sunday']
  },



  //--------location and gps rules--------
  gpsTrackingEnabled: { type: Boolean, default: false },
  restrictByLocation: { type: Boolean, default: false },
  allowedRadiusMeters: { type: Number, default: 100 },



  //--------automatic rules--------
  autoMarkAbsent: { //auto absent if no checkin/out
    type: Boolean,
    default: false
  },
  autoAbsentAfterHours: {
    type: Number,
    default: 2
  },
  autoCheckout: { //auto chekout at end of day
    type: Boolean,
    default: false
  },

}, { timestamps: true });

const AttendanceConfig = mongoose.model("AttendanceConfig", attendanceConfigSchema);

export default AttendanceConfig;