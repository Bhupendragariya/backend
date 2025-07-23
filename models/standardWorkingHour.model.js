import mongoose from "mongoose";

const standardWorkingHourSchema = new mongoose.Schema({
  startTime: {
    type: String,
  },
  endTime: { 
    type: String,
  },
  breakDuration: {
    type: Number,
  },
  weeklyHours: {
    type: Number,
  },
  
})

const StandardWorkingHour = mongoose.model("StandardWorkingHour", standardWorkingHourSchema);

export default StandardWorkingHour;