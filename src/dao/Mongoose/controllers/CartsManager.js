import { findProducts } from '../../../services/product.js'
import * as cartService from '../../../services/cart.js'

class CartMongooseManager {
  existCarts = async id => {
    const cartsAll = await cartService.findCarts()
    return cartsAll.find(cart => cart.id === id)
  }

  existProduct = async id => {
    const productsAll = await findProducts()
    return productsAll.find(product => product.id === id)
  }

  findCarts = async () => {
    const carts = await cartService.findCarts()
    return carts
  }

  findCartsById = async id => {
    const cart = await this.existCarts(id)
    if (!cart) return 'No se encontro el carrito'
    return await cartService.findCartsById(id)
  }

  createCarts = async () => {
    await cartService.createCart()
    return 'Carrito Creado Correctamente'
  }

  addProductToCart = async (idCart, idProduct) => {
    const cart = await this.existCarts(idCart)
    if (!cart) return 'No se encontro el carrito'

    const product = await this.existProduct(idProduct)
    if (!product) return 'No se encontro el producto'

    const productInCart = cart.products.some(
      product => product.id === idProduct
    )
    if (!productInCart) {
      const addProduct = [{ _id: product.id, quantity: 1 }, ...cart.products]
      await cartService.findCartByIdAndUpdate(idCart, { products: addProduct })
      return `Producto ${product.title} agregado . Cantidad: 1`
    } else {
      const indexProduct = cart.products.findIndex(
        product => product.id === idProduct
      )
      cart.products[indexProduct].quantity++
      const quantityProductInCart = cart.products[indexProduct].quantity
      await cartService.findCartByIdAndUpdate(idCart, {
        products: cart.products
      })
      return `Producto ${product.title} agregado. Cantidad: ${quantityProductInCart}`
    }
  }

  updateProductToCart = async (idCart, idProduct, newQuantity) => {
    const cart = await this.existCarts(idCart)
    if (!cart) return 'No se encontro el carrito'

    const productInCart = cart.products.some(
      product => product.id === idProduct
    )
    if (!productInCart) {
      return 'No se encontro el producto'
    } else {
      const indexProduct = cart.products.findIndex(
        product => product.id === idProduct
      )
      cart.products[indexProduct].quantity = newQuantity
      await cartService.findCartByIdAndUpdate(idCart, {
        products: cart.products
      })
      return `Producto actualizado. Cantidad: ${newQuantity}`
    }
  }

  deleteCarts = async id => {
    const cart = await this.existCarts(id)
    if (!cart) return 'No se encontro el carrito'
    await cartService.findCartByIdAndDelete(id)
    return 'Se elimino el carrito'
  }

  deleteProductToCart = async (idCart, idProduct) => {
    const cart = await this.existCarts(idCart)
    if (!cart) return 'No se encontro el carrito'

    const productInCart = cart.products.some(
      product => product.id === idProduct
    )
    if (!productInCart) {
      return 'No se encontro el producto'
    } else {
      const productsUpdate = cart.products.filter(
        product => product.id !== idProduct
      )
      await cartService.findCartByIdAndUpdate(idCart, {
        products: productsUpdate
      })
      return 'Producto eliminado.'
    }
  }

  emptycart = async id => {
    const cart = await this.existCarts(id)
    if (!cart) return 'No se encontro el carrito'
    await cartService.findCartByIdAndUpdate(id, { products: [] })
    return 'Carrito vaciado'
  }
}

export default CartMongooseManager


