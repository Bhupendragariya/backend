import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // required: true,
  },
  name: { //aadhar,pan..
    type: String,
    required: [true, 'Document name is required'],
    trim: true,
  },
  fileUrl: { //cloudinary file url
    type: String,
    required: [true, 'File URL is required'],
  },
  publicId: { //cloudinary public id
    type: String,
    required: [true, 'Cloudinary public_id is required'],
  },
  type: { //jpg,pdf..
    type: String,
  },
}, { timestamps: true });

const Document = mongoose.model("Document", documentSchema);

export default Document;
