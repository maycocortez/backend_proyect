import { Router } from "express";
import productRouter from "./productFileSystem.js";
import cartsRouter from "./cartsFileSystem.js";
import socketRouter from "./socket.js";
import chatRouter from "./chat.js";
import productDBrouter from "./productMongoose.js"
import cartsMongooseRouter from "./cartsMongoose.js";
import cartSocketRouter from "./cartsSocket.js";
import productsRouter from "./productsNew.js";
import sessionRouter from "./session.js";
import usersRouter from "./user.js";
const router = Router();

router
  .use("/api/products", productRouter)
  .use("/api/carts", cartsRouter)
  .use("/api/session", sessionRouter)
  .use("/realTimeProducts", socketRouter)
  .use("/chatSocket", chatRouter)
  .use("/mongoose/products", productDBrouter)
  .use("/mongoose/carts", cartsMongooseRouter)
  .use("/realTimeCarts", cartSocketRouter)
  .use("/products", productsRouter)
  .use("/users", usersRouter);

export default router;