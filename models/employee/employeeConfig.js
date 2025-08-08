import mongoose from "mongoose";

const employeeConfigSchema = new mongoose.Schema({
  //-------employee id config-----------
  autoGenerate: {
    type: Boolean,
    default: true,
  },
  idPrefix: {
    type: String,
    default: 'NN/IN',
  },
  idNumberLength: {
    type: Number,
    default: 4,
  },


  //-------woking hour--------
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


  //--------positions--------
  positions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Position',
  }],

  //--------departments--------
  departments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
  }],

}, { timestamps: true });

const EmployeeConfig = mongoose.model("EmployeeConfig", employeeConfigSchema);

export default EmployeeConfig;