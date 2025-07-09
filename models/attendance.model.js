import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },

  punchIn: String,
  punchOut: String,
  workingHours: Number,
  status: {
    type: String,
    enum: ["Present", "Absent", "Late", "Work From Home"],
    default: "Present",
  },
});


const Attendance = mongoose.model("Attendance", attendanceSchema)


export default Attendance;
