import { productModel } from "../models/ProductSchema.js";

class CrudMongoose {
  objectKeys(object) {
    if (!object.title ||!object.description ||!object.price || !object.category || !object.code || !object.stock
    )
      return 400;
  }
  exist = async (id) => {
    let products = await productModel.find();
    return products.find((prod) => prod.id === id);
  };

  findProducts = async () => {
    let products = await productModel.find();
    return products;
  };
  findProductsById = async (id) => {
    let product = await this.exist(id);
    if (!product) return "Product not found";
    return product;
  };

  createProducts = async (newProduct) => {
    if (this.objectKeys(newProduct) === 400)
      return "Incomplete JSON";
    await productModel.create(newProduct);
    return "Product added succesfully";
  };

  updateProducts = async (id, updateProduct) => {
    let product = await this.exist(id);
    if (!product) return "Product not found";
    if (this.objectKeys(updateProduct) === 400)
      return "incomplete JSON";
    await productModel.findByIdAndUpdate(id, updateProduct);
    return "Product updated succesfully";
  };

  deleteProductsById = async (id) => {
    let product = await this.exist(id);
    if (!product) return "Product not found";
    let result = await productModel.findByIdAndDelete(id);
    return `Product ${result.title} removed`;
  };
}

export default CrudMongoose;