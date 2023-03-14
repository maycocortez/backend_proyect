import { Schema, model } from "mongoose";

const cartCollection = "cart"


const productInCart = new Schema({
  id_product : String,
  quantity: Number,
});

const CartsSchema = new Schema({
  products: {
    type: [productInCart],
    default: [],
  },
});

export const cartsModel = model(cartCollection, CartsSchema);