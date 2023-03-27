import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import moment from "moment";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();


//__filename && __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default __dirname;

//Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __dirname + "/public/img");
  },
  filename: (req, file, cb) => {
    cb(null, __filename.originalname);
  },
});

export const uploader = multer({ storage });

//time
export const dateShort = () => {
  let date = moment().format("HH:mm");
  return date;
};

//bcrypt
export const createHash = (password) => 
  bcrypt.hashSync(password, bcrypt.genSaltSync(12));
;

export const validatePassword = (passwordSend, passwordDB) => 
  bcrypt.compareSync(passwordSend, passwordDB)
;