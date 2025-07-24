import mongoose from "mongoose";

const standardWorkingHourSchema = new mongoose.Schema({
  startTime: {
    type: String,
    default: "09:00",
  },
  endTime: {
    type: String,
    default: "18:00",
  },
  breakDurationInMin: {
    type: Number,
    default: 60, // 1 hour break
  },
  weeklyHours: {
    type: Number,
    default: 40, // 40 hours per week
  },
}, { timestamps: true })

const StandardWorkingHour = mongoose.model("StandardWorkingHour", standardWorkingHourSchema);

export default StandardWorkingHour;