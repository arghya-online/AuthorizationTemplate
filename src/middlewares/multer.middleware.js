import multer from "multer";
import fs from "fs";
import path from "path";

const uploadDir = path.resolve("public/uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

//multer configuration
//it is used to store the uploaded files in the "public/uploads" directory and the filename will be the original name of the file

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

export const upload = multer({ storage: storage });
