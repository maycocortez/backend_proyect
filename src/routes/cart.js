import {Router} from 'express'
import CartManager from "../dao/FileSystem/controllers/CartManager.js";

const routerCart = Router();
const carts = new CartManager();

//Agrego carritos con id aleatorios

routerCart.post("/", async (req, res) => {
  await carts.addCarts();
  res.send({ message: "Carrito agregado correctamente" });
  });



//Consulto carrito
routerCart.get("/:id", async (req, res) => {

  let id = parseInt(req.params.id)
  let cart = await carts.getCartById(id)
  if (!cart) return res.send("not found")
  res.send(cart)
});


//Añado producto a su carrito por id
routerCart.post("/:cid/products/:pid", async (req, res) => {
  let productInCart = await carts.addProductInCart(
    req.params.cid,
    req.params.pid
  );

  return res.send(productInCart);
});


export default routerCart




