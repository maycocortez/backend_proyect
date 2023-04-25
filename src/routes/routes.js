import { Router } from "express";
import productRouter from "./productFileSystem.js";
import socketRouter from "./socket.js";
import productDBrouter from "./productMongoose.js"
import cartsMongooseRouter from "./cartsMongoose.js";
import cartSocketRouter from "./cartsSocket.js";
import productsRouter from "./productsNew.js";
import sessionRouter from "./session.js";
import usersRouter from "./user.js";
import githubRouter from "./github.js";
import error404Router from "./error404.js";
const router = Router();

router
  .use("/api/products", productRouter)
  .use("/api/session", sessionRouter)
  .use("/realTimeProducts", socketRouter)
  .use("/mongoose/products", productDBrouter)
  .use("/mongoose/carts", cartsMongooseRouter)
  .use("/realTimeCarts", cartSocketRouter)
  .use("/products", productsRouter)
  .use("/users", usersRouter)
  .use("/session", githubRouter)
  .use("*", error404Router)

export default router;