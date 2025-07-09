const documentSchema = new mongoose.Schema({
  
 user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Document name is required'],
    trim: true,
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL is required'],
  },
  type: {
    type: String,
    enum: ['PDF', 'Image', 'DOC', 'Other'],
    default: 'Other',
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

const Document = mongoose.model("Document", documentSchema);

export default Document;
