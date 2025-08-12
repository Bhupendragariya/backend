import mongoose from "mongoose";

const metricSchema = new mongoose.Schema({
  name: { type: String }, //Work Quality,Task Completion Rate,Quality Score,Attendance Rate,Goal Achievement,Team Collaboration,Innovation and Creativity
  enabled: { type: Boolean, default: false },
}, { timestamps: true })

const perfMetricsConfigSchema = new mongoose.Schema({
  metrics: [metricSchema],
}, { timestamps: true })

const PerfMetricsConfig = mongoose.model("PerfMetricsConfig", perfMetricsConfigSchema);

export default PerfMetricsConfig;
fullName: {type: String}