import dotenv from "dotenv";
import express from "express";
import { createRoles } from "./libs/roleSetup.js";
import cors from "cors";
import * as path from "path";
import __dirname from "./utils.js";
import { engine } from "express-handlebars";
import router from "./routes/routes.js";
import connectionMongoose from "./connection/mongoose.js";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import initializePassword from "./config/passport.js";

const app = express();

createRoles();

dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());



app.use(cookieParser(process.env.JWT));
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
    cookie: { maxAge: 2000 * 60 * 10 },
  })
);


initializePassword();
app.use(passport.initialize());
app.use(passport.session());

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

app.use("/", express.static(__dirname + "/public"));


app.use("/", router);

export default app;