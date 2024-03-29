import { Router } from "express";
import { io } from "../index.js";
import CartMongooseManager from "../dao/Mongoose/controllers/CartsManager.js";

const cartSocketRouter = Router();
const cartsByMongoose = new CartMongooseManager();

cartSocketRouter.get("/", async (req, res) => {
  io.on("connection", (socket) => {
    socket.on("messaje", (data) => {
      console.log(data);
      io.sockets.emit("estado", "Conexion por websockets");
    });

    
    socket.on("getCart", async (data) => {
      let byIdCart = await cartsByMongoose.findCartsById(data);
      if (data === "") {
        io.sockets.emit("getCart", {
          messaje: "Se consultaron todos los Carritos",
          cart: true,
          carts: await cartsByMongoose.findCarts(),
          itemId: "Id Carrito",
          itemQuantity: "Productos",
        });
      } else if (byIdCart === "Carrito no Encontrado") {
        io.sockets.emit("getCart", {
          messaje: byIdCart,
          cart: true,
          carts: [],
          itemId: "Id Carrito",
          itemQuantity: "Productos",
        });
      } else {
        let producsInCart = [];
        for (let i = 0; i < byIdCart.products.length; i++) {
          let product = {
            id: byIdCart.products[i]._id._id,
            title: byIdCart.products[i]._id.title,
            quantity: byIdCart.products[i].quantity,
          };
          producsInCart.push(product);
        }
        io.sockets.emit("getCart", {
          messaje: "Consulta Exitosa",
          cart: false,
          products: producsInCart,
          itemId: "Producto",
          itemQuantity: "Cantidad",
        });
      }
    });
    //Agregar cart
    socket.on("addCart", async () => {
      let addCart = await cartsByMongoose.createCarts();
      io.sockets.emit("addCart", {
        messaje: addCart,
        cart: true,
        carts: await cartsByMongoose.findCarts(),
        itemId: "Id Carrito",
        itemQuantity: "Productos",
      });
    });
    //Agregar producto en el  cart
    socket.on("productInCart", async (data) => {
      let addProduct = await cartsByMongoose.addProductToCart(
        data.idCart,
        data.idProduct
      );
      io.sockets.emit("productInCart", {
        messaje: addProduct,
        cart: true,
        carts: await cartsByMongoose.findCarts(),
        itemId: "Id Carrito",
        itemQuantity: "Productos",
      });
    });
    //Eliminar Carrito
    socket.on("deleteCart", async (data) => {
      let deleteCart = await cartsByMongoose.deleteCarts(data);
      io.sockets.emit("deleteCart", {
        messaje: deleteCart,
        cart: true,
        carts: await cartsByMongoose.findCarts(),
        itemId: "Id Carrito",
        itemQuantity: "Productos",
      });
    });
  });

  res.render("realTimeCarts", {
    title: "MnogoDB | Websockets",
  });
});

export default cartSocketRouter;
