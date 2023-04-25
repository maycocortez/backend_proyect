import { PORT } from '../../../index.js'
import * as productService from '../../../services/product.js'

class CrudMongoose {
  objectKeys (object) {
    if (
      !object.title ||
      !object.author ||
      !object.description ||
      !object.price ||
      !object.status ||
      !object.category ||
      !object.code ||
      !object.stock
    ) {
      return 400
    }
  }

  exist = async id => {
    const products = await productService.findProducts()
    return products.find(prod => prod.id === id)
  }

  category = async () => {
    const categorys = await productService.findProducts({})
    const selectCategory = []
    for (const prodCategory of categorys) {
      selectCategory.push(prodCategory.category)
    }
    const single = new Set(selectCategory)
    const categorySingle = [...single].sort()
    return categorySingle
  }

  findProducts = async data => {
    const category = await this.category()
    if (data) {
      const category =
        data.category === undefined ? {} : { category: data.category }
      const limit = parseInt(data.limit, 10) || 4
      const page = parseInt(data.page, 10) || 1
      const skip = limit * page - limit
      const sort = data.sort || 'asc'
      const filter = await productService.findPaginateProducts(category, {
        limit,
        page,
        skip,
        sort: { price: sort }
      })
      return [
        {
          ...filter,
          prevLink: `http://localhost:${PORT}/products/${page - 1}`,
          nextlink: `http://localhost:${PORT}/products/${page + 1}`,
          category
        }
      ]
    } else {
      const limit = 4
      const page = 1
      const productsAll = await productService.findPaginateProducts(
        {},
        {
          limit,
          page,
          sort: { price: 'asc' }
        }
      )
      return [
        {
          ...productsAll,
          prevLink: `http://localhost:${PORT}/products/${page - 1}`,
          nextlink: `http://localhost:${PORT}/products/${page + 1}`,
          category
        }
      ]
    }
  }

  findProductsById = async id => {
    const product = await this.exist(id)
    if (!product) return 'No se encontro el producto'
    return product
  }

  createProducts = async newProduct => {
    if (this.objectKeys(newProduct) === 400) {
      return 'Faltan datos'
    }
    await productService.createProduct(newProduct)
    return 'Producto agregado'
  }

  updateProducts = async (id, updateProduct) => {
    const product = await this.exist(id)
    if (!product) return 'No se encontro el producto'
    if (this.objectKeys(updateProduct) === 400) {
      return 'Faltan datos'
    }
    await productService.findByIdAndUpdate(id, updateProduct)
    return 'Producto Modificado Correctamente'
  }

  deleteProductsById = async id => {
    const product = await this.exist(id)
    if (!product) return 'No se encontro el producto'
    const result = await productService.findByIdAndDelete(id)
    return `Producto ${result.title} eliminado`
  }
}

export default CrudMongoose