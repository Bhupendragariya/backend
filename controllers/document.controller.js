import cloudinary from "../config/cloudinary.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import Document from "../models/document.model.js";
import Employee from "../models/employee.model.js";

//emp->add/update a doc after admin/hr permission
//admin/hr->add docs and update a doc
export const addDocument = catchAsyncErrors(async (req, res, next) => {
  // req.file =>{fieldname,originalname,encoding,minetype,path,size,filename}
  const loggedInUserId = req.user.id
  console.log(loggedInUserId, req.user.role);

  const { empId } = req.params;
  if (!empId) {
    return next(new ErrorHandler("Employee ID is required", 400));
  }

  if (!req.file) {
    return next(new ErrorHandler("Please upload a document", 400));
  }

  const { path, filename, mimetype } = req.file
  if (!path || !filename || !mimetype) {
    return next(new ErrorHandler("Invalid file upload", 400));
  }

  const { type } = req.body;
  if (!type) {
    return next(new ErrorHandler("Please provide a document type", 400));
  }

  //if emp add doc to other emp
  if (req.user.role === "employee" && empId !== loggedInUserId) {
    return next(new ErrorHandler("You are not authorized to add document for this user", 403));
  }

  const document = await Document.create({
    user: empId,
    type,
    fileUrl: path, // cloudinary file url
    publicId: filename, // cloudinary public id
    fileMimeType: mimetype
  })

  if (!document) {
    return next(new ErrorHandler("Failed to upload document", 500));
  }

  await Employee.findByIdAndUpdate(empId, {
    $push: { documents: document._id }
  })

  res.status(201).json({
    success: true,
    message: "Document uploaded successfully",
    document
  })
})

export const updateDocument = catchAsyncErrors(async (req, res, next) => {
  // req.file =>{fieldname,originalname,encoding,minetype,path,size,filename}
  const loggedInUserId = req.user.id
  console.log(loggedInUserId, req.user.role);

  const { empId, docId } = req.params;
  if (!empId || !docId) {
    return next(new ErrorHandler("Employee ID and Document ID both are required", 400));
  }

  if (!req.file) {
    return next(new ErrorHandler("Please upload a document", 400));
  }

  const { path, filename, mimetype } = req.file
  if (!path || !filename || !mimetype) {
    return next(new ErrorHandler("Invalid file upload", 400));
  }

  const { type, reason } = req.body;
  if (!type) {
    return next(new ErrorHandler("Please provide a document type", 400));
  }

  const document = await Document.findById(docId);
  if (!document) {
    return next(new ErrorHandler("Document to update not found", 500));
  }

  //---when emp try to update doc---update status,reason and req field only----
  if (req.user.role === "employee") {
    //if emp update doc of other emp 
    if (empId !== loggedInUserId) {
      return next(new ErrorHandler("You are not authorized to add document for this user", 403))
    }

    if (!reason || reason.trim() === "") {
      return next(new ErrorHandler("Reason for update request is required", 400));
    }

    document.status = "pending-update"
    document.reasonForRequest = reason || ""
    document.requestedChanges = {
      type,
      fileUrl: path,
      publicId: filename,
      fileMimeType: mimetype
    }
    await document.save();
    return res.status(201).json({
      success: true,
      message: "Update request submitted and pending HR/Admin approval",
    })
  }

  //---when hr/admin try to update doc---update whole doc----

  //delete old document from cloudinary
  if (document.publicId) {
    await cloudinary.uploader.destroy(document.publicId)
  }

  document.type = type;
  document.fileUrl = path; // cloudinary file url
  document.publicId = filename; // cloudinary public id
  document.fileMimeType = mimetype;
  document.status = "approved";
  document.requestedChanges = undefined;

  await document.save();

  res.status(201).json({
    success: true,
    message: "Document updated successfully",
    document
  })
})

export const deleteDocument = catchAsyncErrors(async (req, res, next) => {
  const loggedInUserId = req.user.id
  console.log(loggedInUserId, req.user.role);

  const { empId, docId } = req.params;
  if (!empId || !docId) {
    return next(new ErrorHandler("Employee ID and Document ID both are required", 400));
  }

  const document = await Document.findById(docId);
  if (!document) {
    return next(new ErrorHandler("Document to delete not found", 500));
  }

  //---when emp try to delete doc---update status and reason only----
  if (req.user.role === "employee") {
    //if emp delete doc of other emp
    if (empId !== loggedInUserId) {
      return next(new ErrorHandler("You are not authorized to delete document for this user", 403))
    }

    const reason = req.body?.reason;  //req.body may be undefined if no body is sent in delete request
    if (!reason || reason.trim() === "") {
      return next(new ErrorHandler("Reason to delete request is required", 400));
    }

    document.status = "pending-delete"
    document.reasonForRequest = reason || ""
    await document.save();
    return res.status(200).json({
      success: true,
      message: "Delete request submitted and pending HR/Admin approval"
    });
  }

  //---when hr/admin try to delete doc---

  //delete document from cloudinary
  if (document.publicId) {
    await cloudinary.uploader.destroy(document.publicId)
  }

  await document.deleteOne();

  await Employee.findByIdAndUpdate(empId, {
    $pull: { documents: docId }
  });

  res.status(200).json({
    success: true,
    message: "Document deleted successfully",
    document
  })
})

export const approveUpdateRequest = catchAsyncErrors(async (req, res, next) => {
  const { docId } = req.params;

  const document = await Document.findById(docId);
  if (!document || document.status !== 'pending-update') {
    return next(new ErrorHandler("No pending update request found", 404));
  }

  // Delete old Cloudinary file
  if (document.publicId) {
    await cloudinary.uploader.destroy(document.publicId);
  }

  // Apply requested changes
  const requestedChanges = document.requestedChanges;

  document.type = requestedChanges.type;
  document.fileUrl = requestedChanges.fileUrl;
  document.publicId = requestedChanges.publicId;
  document.fileMimeType = requestedChanges.fileMimeType;
  document.status = 'approved';
  document.reasonForRequest = undefined;
  document.requestedChanges = undefined;

  await document.save();

  res.status(200).json({
    success: true,
    message: "Document update approved",
    document
  });
});


export const approveDeleteRequest = catchAsyncErrors(async (req, res, next) => {
  const { docId } = req.params;

  const document = await Document.findById(docId);
  if (!document || document.status !== 'pending-delete') {
    return next(new ErrorHandler("No pending delete request found", 404));
  }

  // Delete doc from Cloudinary
  if (document.publicId) {
    await cloudinary.uploader.destroy(document.publicId);
  }

  // Remove doc from doc data
  await Document.findByIdAndDelete(docId);

  // Remove from employee data
  await Employee.findByIdAndUpdate(document.user, {
    $pull: { documents: docId }
  });

  res.status(200).json({
    success: true,
    message: "Document delete approved"
  });
});

