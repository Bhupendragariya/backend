import mongoose from "mongoose";


const eventSchema = new mongoose.Schema({
  title: String,
  type: { 
    type: String,
     enum: ['Meeting', 'Interview', 'Training']
     },
  employee: {
     type: mongoose.Schema.Types.ObjectId, 
     ref: 'user'
     },
  date: Date,
  time: String,
  notes: String
});



const Event = mongoose.model("Event", eventSchema);

export default Event;