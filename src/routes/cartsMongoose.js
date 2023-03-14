import { Router } from "express";
import CartMongooseManager from "../dao/Mongoose/controllers/CartsManager.js";

const cartsDBRouter = Router();
const cartsDB = new CartMongooseManager();

cartsDBRouter.get("/", async (req, res) => {
    try {
      res.status(200).send(await cartsDB.findCarts());
    } catch (err) {
      res.status(404).send("Error en la consulta", err);
    }
  });
  cartsDBRouter.get("/:id", async (req, res) => {
    try {
      res.status(200).send(await cartsDB.findCartsById(req.params.id));
    } catch (err) {
      res.status(404).send("Error en la consulta", err);
    }
  });
  cartsDBRouter.post("/", async (req, res) => {
    try {
      res.status(200).send(await cartsDB.createCarts());
    } catch (err) {
      res.status(404).send("Error al crear", err);
    }
  });
  cartsDBRouter.post("/:idc/product/:idp", async (req, res) => {
    try {
      res.status(200).send(await cartsDB.addProductToCart(req.params.idc, req.params.idp));
    } catch (err) {
      res.status(404).send("Error al agregar", err);
    }
  });
  cartsDBRouter.delete("/:id", async (req, res) => {
    try {
      res.status(200).send(await cartsDB.deleteCarts(req.params.id));
    } catch (err) {
      res.status(404).send("Error al eliminar", err);
    }
  });

export default cartsDBRouter