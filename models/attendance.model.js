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

   
});



const Attendance = mongoose.model("Attendance", attendanceSchema)


export default Attendance;
