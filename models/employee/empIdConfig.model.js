import mongoose from "mongoose";

const empIdConfigSchema = new mongoose.Schema({
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
})

const EmpIdConfig = mongoose.model("EmpIdConfig", empIdConfigSchema);

export default EmpIdConfig;