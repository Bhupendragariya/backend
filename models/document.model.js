const documentSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  name: String,
  fileUrl: String,
  uploadedAt: { type: Date, default: Date.now }
});


const Document = mongoose.model("Document", documentSchema);

export default Document;