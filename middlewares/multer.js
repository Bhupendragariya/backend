import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import ErrorHandler from "./errorMiddlewares.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    // file => {fieldname:'empDocument',originalname:abc.jpg,encoding,mimetype:image/jpeg}
    if (file.fieldname === 'empDocument' || file.filename === 'empIdProof' || file.filename === 'emp10PassCert' || file.filename === 'emp12PassCert' || file.filename === 'empGradCert' || file.filename === 'empExpCert') {
      return {
        folder: 'NovaNectar-HRMS/EmployeeDocuments',
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
      }
    }
    else if (file.fieldname === 'empPhoto') {
      return {
        folder: 'NovaNectar-HRMS/EmployeePhotos',
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
      }
    }
    else if (file.fieldname === 'cmpPhoto') {
      return {
        folder: 'NovaNectar-HRMS/CompanyPhoto',
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
      }
    }
    return {
      folder: 'NovaNectar-HRMS/Others',
    }
  }
})

const upload = multer({
  storage,
  // limits: { fileSize: 5 * 1024 * 1024 },// 5mb in bytes
  // fileFilter: (req, file, cb) => {
  //   const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];

  //   if (allowedMimeTypes.includes(file.mimetype)) {
  //     cb(null, true);
  //   }
  //   else {
  //     cb(new ErrorHandler("Only PDF, JPG, and PNG files are allowed", 400));
  //   }
  // },
})

export default upload;

