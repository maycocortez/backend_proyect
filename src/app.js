import dotenv from "dotenv";
import express from "express";
import { createRoles } from "./libs/roleSetup.js";
import cors from "cors";
import * as path from "path";
import __dirname from "./utils.js";
import { engine } from "express-handlebars";
import router from "./routes/routes.js";
import connectionMongoose from "./connection/mongoose.js";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import session from "express-session";
import flash from "connect-flash";
import MongoStore from "connect-mongo";
import passport from "passport";
import initializePassword from "./config/passport.js";

const app = express();

createRoles();

dotenv.config();

//Configuracion APP
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const skipLog = (req, res) => {
  let url = req.url;
  if (url.indexOf("?") > 0) url = url.substr(0, url.indexOf("?"));
  if (url.match(/(js|jpg|png|ico|css|woff|woff2|eot)$/gi)) {
    return true;
  }
  return false;
};
app.use(morgan("dev", { skip: skipLog }));

//Configuracion Cookies & Session
app.use(cookieParser(process.env.JWT_PRIVATE_KEY));
app.use(
  session({
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URL,
      mongoOption: { useNewUrlParser: true, useUnifiedTopology: true },
      ttl: 600,
    }),
    secret: process.env.sessionSecret,
    resave: true,
    rolling: true,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 10 },
  })
);

app.use(flash());

//Configuracion Passport
initializePassword();
app.use(passport.initialize());
app.use(passport.session());

//Configuracion Handlebars
app.engine(
  "handlebars",
  engine({
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowedProtoMethodsByDefault: true,
    },
  })
);
app.set("view engine", "handlebars");
app.set("views", path.resolve(__dirname + "/views"));

//Archivos Staticos
app.use("/", express.static(__dirname + "/public"));

//Routers
app.use("/", router);

export default app;