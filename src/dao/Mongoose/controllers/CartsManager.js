import { cartsModel } from "../models/CartsSchema.js";
import { productModel } from "../models/ProductSchema.js";

class CartMongooseManager {
  existCarts = async (id) => {
    let cartsAll = await cartsModel.find();
    return cartsAll.find((cart) => cart.id === id);
  };
  existProduct = async (id) => {
    let productsAll = await productModel.find();
    return productsAll.find((product) => product.id === id);
  };

  findCarts = async () => {
    let carts = await cartsModel.find();
    return carts;
  };
  findCartsById = async (id) => {
    let cart = await this.existCarts(id);
    if (!cart) return "No se encontro el carrito";
    return await cartsModel.findById(id).populate("products._id");
  };

  createCarts = async () => {
    await cartsModel.create({ products: [] });
    return "Creado satisfactoriamente";
  };

  addProductToCart = async (id_cart, id_product) => {
    let cart = await this.existCarts(id_cart);
    if (!cart) return "No se encontro el carrito";

    let product = await this.existProduct(id_product);
    if (!product) return "No se encontro el producto";

    let productInCart = cart.products.some(
      (product) => product.id === id_product
    );
    if (!productInCart) {
      let addProduct = [{ _id: product.id, quantity: 1 }, ...cart.products];
      await cartsModel.findByIdAndUpdate(id_cart, { products: addProduct });
      return `Producto " ${product.title} " agregado al carrito satisfactoriamente. Cantidad: 1`;
    } else {
      let indexProduct = cart.products.findIndex(
        (product) => product.id === id_product
      );
      cart.products[indexProduct].quantity++;
      let quantityProductInCart = cart.products[indexProduct].quantity;
      await cartsModel.findByIdAndUpdate(id_cart, { products: cart.products });
      return `Producto " ${product.title} " agregado al carrito starisfactoriamente. Cantidad: ${quantityProductInCart}`;
    }
  };

  updateProductToCart = async (id_cart, id_product, newQuantity) => {
    let cart = await this.existCarts(id_cart);
    if (!cart) return "No se encontro el carrito";

    let productInCart = cart.products.some(
      (product) => product.id === id_product
    );
    if (!productInCart) {
      return "No se encontro el producto";
    } else {
      let indexProduct = cart.products.findIndex(
        (product) => product.id === id_product
      );
      cart.products[indexProduct].quantity = newQuantity;
      await cartsModel.findByIdAndUpdate(id_cart, { products: cart.products });
      return `Producto actualizado. Cantidad: ${newQuantity}`;
    }
  };

  deleteCarts = async (id) => {
    let cart = await this.existCarts(id);
    if (!cart) return "No se encontro el carrito";
    await cartsModel.findByIdAndDelete(id);
    return "Eliminado satisfactoriamente";
  };
  deleteProductToCart = async (id_cart, id_product) => {
    let cart = await this.existCarts(id_cart);
    if (!cart) return "No se encontro el carrito";

    let productInCart = cart.products.some(
      (product) => product.id === id_product
    );
    if (!productInCart) {
      return "No se encontro el producto";
    } else {
      let productsUpdate = cart.products.filter(
        (product) => product.id != id_product
      );
      await cartsModel.findByIdAndUpdate(id_cart, { products: productsUpdate });
      return `Se elimino el producto del carrito`;
    }
  };
}

export default CartMongooseManager;
