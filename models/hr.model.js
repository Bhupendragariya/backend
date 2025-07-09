import mongoose from "mongoose";

const hrSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
}, { timestamps: true });

export const Hr = mongoose.model('Hr', hrSchema);