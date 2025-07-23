import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  punchIn: {
    type: String,
    default: null,
  },
  punchOut: {
    type: String,
    default: null,
  },

  locationType: { type: String },


  workingHours: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late', 'Work From Home'],
    default: 'Present',
  },

   notes: { type: String },


     checkInBufferTime: {
    type: Number,
    default: 20, 
  },
  checkOutBufferTime: {
    type: Number,
    default: 20, 
  },
  lateMarkThreshold: {
    type: Number,
    default: 60, 
  },
  halfDayThreshold: {
    type: Number,
    default: 4, 
  },


   
});



const Attendance = mongoose.model("Attendance", attendanceSchema)


export default Attendance;
