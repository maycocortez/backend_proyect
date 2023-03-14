import { Schema, model } from "mongoose";

const productsCollection = "products"


const ProductSchema = new Schema({
  title: {
    type: String,
    unique: true,
    require: true,
  },
 
  description: {
    type: String,
    require: true,
  },
  price: {
    type: Number,
    default: 0,
  },
 
  category: {
    type: String,
    require: true,
  },
  thumbnail: String,
  code: {
    type: String,
    unique: true,
    require: true,
  },
  stock: {
    type: Number,
    default: 1,
  },
});

export const productModel = model(productsCollection, ProductSchema)