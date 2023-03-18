//BACKEND
import "dotenv/config"

import express from 'express'
import routerProd from './routes/product.js'
import routerCart from "./routes/cart.js"
import routerSocket from './routes/socket.js'
import {__dirname} from './path.js'
import {engine}  from 'express-handlebars'
import * as path from 'path' 
import {Server} from 'socket.io' 
import userRouter from './routes/user.js'
import cartsDBRouter from "./routes/cartsMongoose.js"
import productDBRouter from "./routes/productMongoose.js"
import chatRouter from "./routes/chatMongoose.js"
import { dateShort } from "./utils/path.js"
import { chatModel } from "./dao/Mongoose/models/ChatSchema.js"
import mongoose from "mongoose"

const uri = process.env.MONGODB_URI

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conectado a la base de datos'))
  .catch(err => console.error(err));









const app = express()
app.set("port", process.env.PORT || 5000)


const server = app.listen(app.get("port"), () => console.log(`Server on port ${app.get("port")}`))

export const io = new Server(server) //guardo mi server en socket

app.engine(
  "handlebars",
  engine({
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowedProtoMethodsByDefault: true,
    },
  })
);

//Middlewares
app.use(express.urlencoded({extended:true}))
app.use(express.json()) 
app.engine("handlebars",engine()) 
app.set("view engine","handlebars") 
app.set('views',path.resolve(__dirname , './views')) 



//routes
app.use('/',express.static(__dirname + '/public')) 

app.use('/api/products',routerProd) 

app.use('/api/carts',routerCart)

app.use('/',routerSocket)
app.use('/users',userRouter)
app.use("/mongoose/products", productDBRouter);
app.use("/mongoose/carts", cartsDBRouter);
app.use("/chatSocket", chatRouter);




let time = dateShort();
//Usuarios Conectados
export let usersChat = [];
//Mensaje de Bienvenida
const greeting = {
  user: "Administrador",
  messaje: "Bienvenido al Chat 👋",
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
        messaje: "se ha desconecto",
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





