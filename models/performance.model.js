import mongoose from "mongoose";

const performanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    evaluator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    workQuality: {
      type: Number,
      required: true,
    },
    productivity: {
      type: Number,
      required: true,
    },
    reliability: {
      type: Number,
      required: true,
    },
    teamwork: {
      type: Number,
      required: true,
    },
    innovation: {
      type: Number,
      required: true,
    },
    notes: {
      type: String,
      default: "",
    },
    performanceScore: {
      type: Number, // This is the average
      required: true,
    },
  },
  { timestamps: true }
);

const Performance = mongoose.model("Performance", performanceSchema);

export default Performance;
