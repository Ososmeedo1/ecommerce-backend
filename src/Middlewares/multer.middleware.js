
import multer from "multer"
import { ErrorHandlerClass } from "../Utils/error-class.utils.js";
import { extensions } from "../Utils/file-extensions.utils.js";


export const multerHost = (allowedExtensions = extensions.Images) => {
  
  const storage = multer.diskStorage({});

  const fileFilter = (req, file, cb) => {
    if (allowedExtensions.includes(file.mimetype)) {
      return cb(null, true);
    }

    cb(new ErrorHandlerClass(`Invalid file type, only ${allowedExtensions} images are allowed`, 400), false);
  }

  return multer({fileFilter, storage});

}