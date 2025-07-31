import mongoose from "mongoose";

const reviewCycleConfigSchema = new mongoose.Schema({
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
  autoGenerateReviewForm: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const ReviewCycleConfig = mongoose.model("ReviewCycleConfig", reviewCycleConfigSchema);

export default ReviewCycleConfig;