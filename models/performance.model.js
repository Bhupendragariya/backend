import mongoose from "mongoose";

const performanceEvaluationSchema = new mongoose.Schema({
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
  scores: {
    workQuality: { type: Number, required: true },
    productivity: { type: Number, required: true },
    reliability: { type: Number, required: true },
    teamwork: { type: Number, required: true },
    innovation: { type: Number, required: true },
  },
  notes: { type: String },
  performanceScore: { type: Number, required: true }, 
}, { timestamps: true });

const Performance = mongoose.model("Performance", performanceEvaluationSchema);
export default Performance;
