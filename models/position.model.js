import mongoose from "mongoose";

const positionSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  name: {
    type: String,
    required: [true, 'Position name is required'],
    trim: true,
    unique: true,
  },
}, { timestamps: true });

const Position = mongoose.model("Position", positionSchema);

export default Position;
