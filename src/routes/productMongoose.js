import { Router } from "express";
import CrudMongoose from "../dao/Mongoose/controllers/ProductManager.js";


const productDBRouter = Router();
const productDB = new CrudMongoose();

productDBRouter.get("/", async (req, res) => {
  try {
    res.status(200).send(await productDB.findProducts());
  } catch (err) {
    res.status(404).send("Error en la consulta", err);

  }
});
productDBRouter.get("/:id", async (req, res) => {
  try {
    res
      .status(200)
      .send(await productDB.findProductsById(req.params.id));
  } catch (error) {
    res.status(404).send("Not found", error);
  }
});
productDBRouter.post("/", async (req, res) => {
  try {
    res.status(200).send(await productDB.createProducts(req.body));
  } catch (error) {
    res.status(400).send("Error", error);
  }
});
productDBRouter.put("/:id", async (req, res) => {
  try {
    res
      .status(200)
      .send(await productDB.updateProducts(req.params.id, req.body));
  } catch (error) {
    res.status(400).send("Error", error);
  }
});
productDBRouter.delete("/:id", async (req, res) => {
  console.log(req.params.id);
  try {
    res
      .status(200)
      .send(await productDB.deleteProductsById(req.params.id));
  } catch (err) {
    res.status(400).send("Error de sintaxis", err);
  }
});

export default productDBRouter;

