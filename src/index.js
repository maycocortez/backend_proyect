import mongoose from "mongoose";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import * as path from "path";
import __dirname from "./utils.js";
import { engine } from "express-handlebars";
import productRouter from "./routes/productFileSystem.js";
import cartRouter from "./routes/cartsFileSystem.js";
import socketRouter from "./routes/socket.js";
import chatRouter from "./routes/chat.js";
import { Server } from "socket.io";
import { dateShort } from "./utils.js"; 
import connectionMongoose from "./connection/mongoose.js"; 
import productDBRouter from "./routes/productMongoose.js";
import cartsDBRouter from "./routes/cartsMongoose.js";
import cartSocketRouter from "./routes/cartsSocket.js";
import productsRouter from "./routes/productsNew.js";
import { chatModel } from "./dao/Mongoose/models/ChatSchema.js";



dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

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

export const PORT = 8000

const server = app.listen(PORT, () =>
  console.log(`Conexion por express ${server.address().port}`)
);
server.on("error", (err) => {
  console.log(`Error: ${err}`);
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

//Routers
app.use("/api/products", productRouter);
app.use("/api/carts", cartRouter);
app.use("/realTimeProducts", socketRouter);
app.use("/chatSocket", chatRouter);
app.use("/mongoose/products", productDBRouter);
app.use("/mongoose/carts", cartsDBRouter);
app.use("/realTimeCarts", cartSocketRouter);
app.use("/products", productsRouter)

