import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import Document from "../models/document.model.js";

//emp->add/update a doc
//admin/hr->add docs and update a doc
export const addDocument = catchAsyncErrors(async (req, res, next) => {
  // req.file =>{fieldname,originalname,encoding,minetype,path,size,filename}
  // const loggedInUserId = req.user._id

  if (!req.file) {
    return next(new ErrorHandler("Please upload a document", 400));
  }

  const { path, filename, mimetype } = req.file
  if (!path || !filename || !mimetype) {
    return next(new ErrorHandler("Invalid file upload", 400));
  }

  const { name } = req.body;
  if (!name) {
    return next(new ErrorHandler("Please provide a document name", 400));
  }

  const document = await Document.create({
    // user:loggedInUserId,
    name,
    fileUrl: path, // cloudinary file url
    publicId: filename, // cloudinary public id
    type: mimetype
  })

  if (!document) {
    return next(new ErrorHandler("Failed to upload document", 500));
  }

  res.status(201).json({
    success: true,
    message: "Document uploaded successfully",
    document
  })
})

export const updateDocument = catchAsyncErrors(async (req, res, next) => {
  // req.file =>{fieldname,originalname,encoding,minetype,path,size,filename}
  // const loggedInUserId = req.user._id

  if (!req.file) {
    return next(new ErrorHandler("Please upload a document", 400));
  }

  const { path, filename, mimetype } = req.file
  if (!path || !filename || !mimetype) {
    return next(new ErrorHandler("Invalid file upload", 400));
  }

  const { name } = req.body;
  if (!name) {
    return next(new ErrorHandler("Please provide a document name", 400));
  }

  const document = await Document.create({
    // user:userId,
    name,
    fileUrl: path, // cloudinary file url
    publicId: filename, // cloudinary public id
    type: mimetype
  })

  if (!document) {
    return next(new ErrorHandler("Failed to upload document", 500));
  }

  res.status(201).json({
    success: true,
    message: "Document uploaded successfully",
    document
  })
})

export const deleteDocument = catchAsyncErrors(async (req, res, next) => { })