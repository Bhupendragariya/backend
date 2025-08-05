import mongoose from "mongoose";

export const DOCUMENT_TYPE_ENUM = [
  'empIdProof',
  'empPhoto',
  'emp10PassCert',
  'emp12PassCert',
  'empGradCert',
  'empExpCert',
  'empResume',
  'empOfferLetter',
  'empOtherDoc'
];

const documentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  type: { // photo,id proof,marksheet etc.
    type: String,
    required: [true, 'Document type is required'],
    enum: DOCUMENT_TYPE_ENUM,
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
    enum: ['approved', 'rejected', 'pending-update', 'pending-delete'],
    default: 'approved',
  },
  reasonForRequest: { //reason, if emp update/delete doc
    type: String,
    trim: true,
  },
  requestedChanges: { //to add change,if emp update
    type: {
      type: String,
      trim: true,
    },
    fileUrl: {
      type: String
    },
    publicId: {
      type: String
    },
    fileMimeType: {
      type: String
    },
  }
}, { timestamps: true });

const Document = mongoose.model("Document", documentSchema);

export default Document;
