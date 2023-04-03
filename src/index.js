import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import * as path from "path";
import __dirname from "./utils.js";
import { engine } from "express-handlebars";
import router from "./routes/routes.js";
import { Server } from "socket.io";
import { dateShort } from "./utils.js";
import connectionMongoose from "./connection/mongoose.js";
import { chatModel } from "./dao/Mongoose/models/ChatSchema.js";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import session from "express-session";
import flash from "connect-flash";
import MongoStore from "connect-mongo";
import passport from "passport";
import initializePassword from "./config/passport.js";

//Creando Server Express
const app = express();
dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(flash());

const skipLog = (req, res) => {
  let url = req.url;
  if (url.indexOf("?") > 0) url = url.substr(0, url.indexOf("?"));
  if (url.match(/(js|jpg|png|ico|css|woff|woff2|eot)$/gi)) {
    return true;
  }
  return false;
};
app.use(morgan("dev", { skip: skipLog }));
app.use(cookieParser());
app.use(
  session({
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URL,
      mongoOption: { useNewUrlParser: true, useUnifiedTopology: true },
      ttl: 600,
    }),
    secret: process.env.sessionSecret || "1234567890",
    resave: true,
    rolling: true,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 10 },
  })
);

//Passport
initializePassword();
app.use(passport.initialize());
app.use(passport.session());




//Handlebars
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

//Routers
app.use("/", router);

//Creando localhost 
export const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () =>
  console.log(`Conectado al  host ${server.address().port}`)
);
server.on("error", (err) => {
  console.log(`Algo salio mal: ${err}`);
});
export const io = new Server(server);


let time = dateShort();

export let usersChat = [];


const greeting = {
  user: "Admin",
  messaje: "Bienvenido!",
  time,
  idUser: "123456543210",
};


const addChatMongoose = async (messaje) => {
  await chatModel.create(messaje);
};
io.on("connection", (socket) => {
  console.log(socket.id, "Conectado");
  socket.on("disconnect", () => {
    console.log(socket.id, "Desconectado");
    let user = usersChat.find((user) => user.idUser === socket.id);
    if (user != undefined) {
      
      addChatMongoose({
        user: user.user,
        messaje: "usuario desconectado",
        time: dateShort(),
        idUser: socket.id,
        idConnection: "disConnection",
      });
      let userUpload = usersChat.filter((user) => user.idUser != socket.id);
      usersChat = [...userUpload];
      let findChatMongoose = async () => {
        if (usersChat.length === 0) await chatModel.deleteMany({});
        //
        let allMessajeMongoose = await chatModel.find();
        io.sockets.emit("userChat", usersChat, allMessajeMongoose);
      };
      findChatMongoose();
    }
  });
  socket.on("userChat", (data) => {
    usersChat.push({
      user: data.user,
      idUser: data.id,
    });
  
    let userConecction = {
      user: data.user,
      messaje: data.messaje,
      time: dateShort(),
      idUser: data.id,
      idConnection: "Connection",
    };
    //Subimos el Mensaje a MongoDB
    let chat = async () => {
      let chats = await chatModel.find();
      if (chats.length === 0) {
        
        await chatModel.create([greeting, userConecction]);
      } else {
        await chatModel.create(userConecction);
      }
      let allMessajeMongoose = await chatModel.find();
      io.sockets.emit("userChat", usersChat, allMessajeMongoose);
    };
    chat();
  });

  socket.on("messajeChat", (data) => {
    //Subimos Mensaje a MongoDB
    addChatMongoose(data);
    let findChatMongoose = async () => {
      let allMessajeMongoose = await chatModel.find();
      io.sockets.emit("messajeLogs", allMessajeMongoose);
    };
    findChatMongoose();
  });
  socket.on("typing", (data) => {
    socket.broadcast.emit("typing", data);
  });
});
