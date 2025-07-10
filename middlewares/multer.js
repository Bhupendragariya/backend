import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    // file => {fieldname:'empDocument',originalname:abc.jpg,encoding,mimetype:image/jpeg}
    if (file.fieldname === 'empDocument') {
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

const upload = multer({ storage })

export default upload;

