import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  type: { // aadhar, pan, marksheet, etc.
    type: String,
    required: [true, 'Document type is required'],
    trim: true,
  },
  fileUrl: { // Cloudinary file URL
    type: String,
    required: [true, 'File URL is required'],
  },
  publicId: { // Cloudinary public ID
    type: String,
    required: [true, 'Cloudinary public_id is required'],
  },
  fileMimeType: { // image/jpeg, application/pdf
    type: String,
  },
  status: {
    type: String,
    enum: ['approved', 'pending-update', 'pending-delete'],
    default: 'approved',
  },
  
  reasonForRequest: { //need for emp to update/delete
    type: String,
    trim: true,
  },
  requestedChanges: { //need for emp to update
    type: {
      type: String,
      trim: true,
    },
    fileUrl: String,
    publicId: String,
    fileMimeType: String,
  }
}, { timestamps: true });

const Document = mongoose.model("Document", documentSchema);

export default Document;
