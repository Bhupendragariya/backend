import mongoose from "mongoose";

const metricSchema = new mongoose.Schema({
  name: { type: String }, //Work Quality,Task Completion Rate,Quality Score,Attendance Rate,Goal Achievement,Team Collaboration,Innovation and Creativity
  isEnabled: { type: Boolean, default: false },
}, { timestamps: true })

const Metric = mongoose.model("Metric", metricSchema);
export default Metric;