import { promises as fs } from "fs";

class ProductManager {
  constructor() {
    this.path = './src/dao/FileSystem/json/productos.json'
    this.products = []
  }
  static id = 0

  addProduct = async (title,description,price,thumbnail,code,stock) => {
    ProductManager.id++

      let newProduct = {title,description,price,thumbnail,code,stock,id:ProductManager.id}
      this.products.push(newProduct)

    await fs.writeFile(this.path,JSON.stringify(this.products))
  }

  readProducts = async () => {
    try {
    let resultado = await fs.readFile(this.path,'utf-8')
    if (!resultado) return []
    return JSON.parse(resultado)
    } catch (error) {
    console.error(error)
    return []
    }
  }

  
getProducts = async () => {
    let response = await this.readProducts()
    console.log(response)
    return response;
  }

  getProductsById = async (id) => {
    let responseId = await this.readProducts()
    let product = responseId.find(product => product.id === id)
    return product || null;
  }

   deleteProductById = async (id)=> {

    let deleteById = await this.readProducts()
    let filterById = deleteById.filter(products => products.id !=id)
  
    await fs.writeFile(this.path,JSON.stringify(filterById))

   }

   updateProducts = async ({id, ...producto}) => {
    await this.deleteProductById(id)
    let productUpdate = await this.readProducts()
    let updateProd = [
      {...producto, id},
      ...productUpdate
    ]
    await fs.writeFile(this.path, JSON.stringify(updateProd))
    console.log("Actualizado")
  } }


const productManager = new ProductManager();

export default ProductManager