import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  name: {
    type: String,
    required: [true, 'Department name is required'],
    trim: true,
    unique: true,
  },
}, { timestamps: true });

const Department = mongoose.model("Department", departmentSchema);

export default Department;
