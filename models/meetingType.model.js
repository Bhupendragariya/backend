import mongoose from "mongoose";


const meetingTypeSchema = new mongoose.Schema({
  name: { //daily meeting, weekly meeting, interview, training
    type: String,
     enum: ['Meeting',  "Event"],
    required: [true, 'Event title is required'],
    trim: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
});

const MeetingType = mongoose.model("MeetingType", meetingTypeSchema);

export default MeetingType;