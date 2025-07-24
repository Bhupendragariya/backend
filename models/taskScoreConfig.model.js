import mongoose from "mongoose";

const taskScoreConfigSchema = new mongoose.Schema({
  minScore: {
    type: Number,
    default: 1,
  },
  maxScore: {
    type: Number,
    default: 5,
  },
}, { timestamps: true })

const TaskScoreConfig = mongoose.model("TaskScoreConfig", taskScoreConfigSchema);

export default TaskScoreConfig;