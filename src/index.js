import app from "./app.js";
import { Server } from "socket.io";
import { dateShort } from "../utils/dateShort.js";
import { chatModel } from "./dao/Mongoose/models/ChatSchema.js";


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
