import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'On Leave', 'WFH'],
    default: 'Absent',
  },
  punchInDate: { //inp time 09:00
    type: Date,
    default: null,
  },
  punchOutDate: { //inp time 18:00
    type: Date,
    default: null,
  },
  locationType: {
    type: String,
    enum: ['Online', 'Offline', 'N/A'],
    default: 'N/A'
  },
  notes: {
    type: String,
    trim: true
  },


  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  workingHours: {  //8.5
    type: Number,
    default: 0,
  },
  isLate: {
    type: Boolean,
    default: false
  },
  lateByMinutes: {
    type: Number,
    default: 0,
  },
  isEarlyCheckout: {
    type: Boolean,
    default: false,
  },
  earlyCheckoutByMinutes: {
    type: Number,
    default: 0,
  },
  isHalfDay: {
    type: Boolean,
    default: false
  },
}, { timestamps: true });



const Attendance = mongoose.model("Attendance", attendanceSchema)


export default Attendance;

//create pre middleware to calculate workinghour and others

