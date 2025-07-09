import mongoose from "mongoose";


const eventSchema = new mongoose.Schema({
   title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
  },
  type: {
    type: String,
    enum: ['Meeting', 'Interview', 'Training'],
    required: [true, 'Event type is required'],
  },

  isGlobal: {
    type: Boolean,
    default: false, 
  },


  date: {
    type: Date,
    required: [true, 'Event date is required'],
  },
  time: {
    type: String,
    required: [true, 'Event time is required'],
  },
  notes: {
    type: String,
    trim: true,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});



const Event = mongoose.model("Event", eventSchema);

export default Event;