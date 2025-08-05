import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    attachment: {
      url: { type: String },
      public_id: { type: String },
    },
     status: { type: String, enum: ['unread', 'read'], default: 'unread' },
  },
  { timestamps: true }
);


export const Feedback = mongoose.model("Feedback", feedbackSchema);

export default Feedback;

