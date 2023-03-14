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
    if (!product) return "Producto no Encontrado";
    return product;
  };

  createProducts = async (newProduct) => {
    if (this.objectKeys(newProduct) === 400)
      return "JSON incompleto. Faltan 1 o mas Datos";
    await productModel.create(newProduct);
    return "Producto Agregado Correctamente";
  };

  updateProducts = async (id, updateProduct) => {
    let product = await this.exist(id);
    if (!product) return "Producto no Encontrado";
    if (this.objectKeys(updateProduct) === 400)
      return "JSON incompleto. Faltan 1 o mas Datos";
    await productModel.findByIdAndUpdate(id, updateProduct);
    return "Producto Modificado Correctamente";
  };

  deleteProductsById = async (id) => {
    let product = await this.exist(id);
    if (!product) return "Producto no Encontrado";
    let result = await productModel.findByIdAndDelete(id);
    return `Producto ${result.title} Eliminado`;
  };
}

export default CrudMongoose;