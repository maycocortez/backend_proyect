import {Router} from 'express'
import { chatModel } from '../dao/Mongoose/models/ChatSchema.js'
import { dateShort } from '../utils/path.js';
import { usersChat } from '../app.js';

const chatRouter = Router();

chatRouter
  .get("/", (req, res) => {
    let time = dateShort();
    res.render("chat", {
      title: "Chat Websocket",
      messages: {
        user: "Administrador",
        messaje: "Bienvenido!",
        time,
      },
      users: usersChat,
    });
  })
  .get("/messaje", async (req, res) => {
    res.send(await chatModel.find());
  });

export default chatRouter;
