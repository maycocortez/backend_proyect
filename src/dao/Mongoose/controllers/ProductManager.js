import { productModel } from "../models/ProductSchema.js";
import { PORT } from "../../../index.js";

class CrudMongoose {
  objectKeys(object) {
    if (
      !object.title ||
      !object.description ||
      !object.price ||
      !object.status ||
      !object.category ||
      !object.code ||
      !object.stock
    )
      return 400;
  }
  exist = async (id) => {
    let products = await productModel.find();
    return products.find((prod) => prod.id === id);
  };

  findProducts = async (data) => {
    if (data) {
      let category =
        data.category === undefined ? {} : { category: data.category };
      let limit = parseInt(data.limit, 10) || 4;
      let page = parseInt(data.page, 10) || 1;
      let skip = limit * page - limit;
      let sort = data.sort || "asc";
      const filter = await productModel.paginate(category, {
        limit,
        page,
        skip,
        sort: { price: sort },
      });
      return [
        {
          ...filter,
          prevLink: `http://localhost:${PORT}/products/${page - 1}`,
          nextlink: `http://localhost:${PORT}/products/${page + 1}`,
        },
      ];
    } else {
      let limit = 4;
      let page = 1;
      let productsAll = await productModel.paginate(
        {},
        {
          limit,
          page,
          sort: { price: "asc" }
        }
      );
      return [
        {
          ...productsAll,
          prevLink: `http://localhost:${PORT}/products/${page - 1}`,
          nextlink: `http://localhost:${PORT}/products/${page + 1}`,
        },
      ];
    }
  };
  findProductsById = async (id) => {
    let product = await this.exist(id);
    if (!product) return "No se encontro el producto";
    return product;
  };

  createProducts = async (newProduct) => {
    if (this.objectKeys(newProduct) === 400)
      return "Faltan datos";
    await productModel.create(newProduct);
    return "Producto agregado";
  };

  updateProducts = async (id, updateProduct) => {
    let product = await this.exist(id);
    if (!product) return "No se encontro el producto";
    if (this.objectKeys(updateProduct) === 400)
      return "Faltan datos";
    await productModel.findByIdAndUpdate(id, updateProduct);
    return "Producto modificado ";
  };

  deleteProductsById = async (id) => {
    let product = await this.exist(id);
    if (!product) return "No se encontro el producto";
    let result = await productModel.findByIdAndDelete(id);
    return `Producto ${result.title} Eliminado`;
  };
}

export default CrudMongoose;
