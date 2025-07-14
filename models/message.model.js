import mongoose from 'mongoose';
const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  attachment: {
    filename: String,
    path: String,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });



const Message = mongoose.model("Message", messageSchema);

export default Message;

