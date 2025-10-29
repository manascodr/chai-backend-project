import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // set the destination folder for uploaded files
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

export const upload = multer({ // multer middleware to handle file uploads
  storage: storage,
});