import { promises as fs } from "fs";
import ProductManager from "./ProductManager.js";

const products = new ProductManager();

class CartManager {
    constructor() {
        this.path = './src/dao/FileSystem/json/cart.json'
        }

        
        readCarts = async () => {
          try {
            let allCarts = await fs.readFile(this.path, "utf-8");
            return JSON.parse(allCarts);
          } catch (error) {
            console.error(`Error: ${error}`);
            return [];
          }
        };

    writeCarts = async (cart) => {
      await fs.writeFile(this.path, JSON.stringify(cart), (error) => {
        if (error) throw error;
      });
    };

    
    exist = async (id) => {
      let cartsAll = await this.readCarts(this.path);

      return cartsAll.find((cart) => cart.id === id); 
      
    };
    
    deleteCart = async (id) => {
      let carts = await this.readCarts();
      let filterCarts = carts.filter((cart) => cart.id != id);
      await this.writeCarts(filterCarts);
      return filterCarts;
    };


    addCarts = async () => {
      let id = Math.floor(Math.random() * 1000 + 1);
      let cartsOld = await this.readCarts();
      let allCarts = [];
      if (Array.isArray(cartsOld)) {
        allCarts = [...cartsOld, { id: id, productos: [] }];
      } else {
        allCarts = [{ id: id, productos: [] }];
      }
      await this.writeCarts(allCarts);
    };


    getCartById = async (id) => {
      let existCart = await this.exist(id);
      if (!existCart) return 404;
      return existCart.productos;
    };

 
    addProductInCart = async (cartId, prodId) => {
      
    
      let cartById = await this.readCarts(cartId)
      let existCart = cartById.find(cart => cart.id == cartId);
      console.log(existCart)

      
      let productById = await products.readProducts(prodId);
      let existProduct = productById.find(product => product.id == prodId);    

      console.log(existProduct)

   const cartsOld = await this.deleteCart(cartId);
   console.log(cartsOld)


      let existingProductInCart = existCart.productos.find(product => product.id === prodId);

  if (existingProductInCart) {
    existingProductInCart.quantity += 1;
  } else {
    existCart.productos.push({ id: prodId, quantity: 1 });
  }
      
    let allCarts = [...cartsOld, existCart];
    await this.writeCarts(allCarts);
    return `El producto "${existProduct.title}" fue añadido exitosamente agregado al carrito: ${cartId}`;


  };


    };
  

  export default CartManager;