import mongoose from "mongoose";

const standardWorkingHourSchema = new mongoose.Schema({
  startTime: { //inp time 09:00
    type: String,
    default: "09:00",
  },
  endTime: { //inp time 18:00
    type: String,
    default: "18:00",
  },
  breakDurationInMin: { //inp num 60
    type: Number,
    default: 60, // 1 hour break
  },
  weeklyHours: { //inp num 40
    type: Number,
    default: 40, // 40 hours per week
  },
}, { timestamps: true })

const StandardWorkingHour = mongoose.model("StandardWorkingHour", standardWorkingHourSchema);

export default StandardWorkingHour;