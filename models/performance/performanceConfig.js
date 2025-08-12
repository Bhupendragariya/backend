import mongoose from "mongoose";

const performanceConfigSchema = new mongoose.Schema({
  //-------review cycle-----------
  reviewFrequency: {
    type: String,
    required: true,
    default: "monthly",
    enum: ["monthly", "quarterly", "annually", "biannually"],
  },
  reviewDayOfMonth: {
    type: String,
    default: "last",
  },
  isAutoGenerateReviewForm: {
    type: Boolean,
    default: false,
  },

  //-------task scoring cycle-----------
  minScore: {
    type: Number,
    default: 1,
  },
  maxScore: {
    type: Number,
    default: 5,
  },

  //-------performance metrics config-----------
  metrics: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Metric',
  }],

}, { timestamps: true });

const PerformanceConfig = mongoose.model("PerformanceConfig", performanceConfigSchema);

export default PerformanceConfig;