import mongoose from "mongoose";

const performanceSchema = new mongoose.Schema({
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
  scores: [{
    metricName: { type: String }, //Task Completion Rate, Quality Score
    score: { type: Number }
  }],
  notes: {
    type: String,
    default: "Excellent team player and consistently delivers high-quality work.",
  },
  performanceScore: {
    sumOfScores: { type: Number },
    totalOfMaxScore: { type: Number },
    percentageScore: { type: Number },
    averageScore: { type: Number },
  }
}, { timestamps: true }
);

const Performance = mongoose.model("Performance", performanceSchema);

export default Performance;
