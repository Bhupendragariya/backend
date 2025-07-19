import mongoose from "mongoose";

const standardWorkingHourSchema = new mongoose.Schema({
  startTime: {// '09:00'
    type: String,
  },
  endTime: {  // '18:00'
    type: String,
  },
  breakDuration: { //in minutes
    type: Number,
  },
  weeklyHours: { //in minutes
    type: Number,
  },
})

const StandardWorkingHour = mongoose.model("StandardWorkingHour", standardWorkingHourSchema);

export default StandardWorkingHour;