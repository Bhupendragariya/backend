import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true }, 
  endTime: { type: String, required: true },
  description: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]

  
}, { timestamps: true });


const Meeting = mongoose.model("Meeting", meetingSchema);

export default Meeting;