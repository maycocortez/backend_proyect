
import {Router} from 'express'
import ProductManager from '../dao/FileSystem/controllers/ProductManager.js'

const routerProd = Router()

const productManager = new ProductManager () //consulto por el txt con los productos


const products = productManager.readProducts()


routerProd.get('/', async (req, res) => { 
    let limit = parseInt(req.query.limit)
    if(!limit) return res.send( await products)
    let allProducts = await products
    let productLimit = allProducts.slice(0,limit)
    res.send(productLimit)
})




routerProd.post('/', async (req, res) => { 
    let title = req.body.title;
    let description = req.body.description;
    let price = req.body.price;
    let thumbnail = req.body.thumbnail;
    let code = req.body.code;
    let stock = req.body.stock;
    let newProduct = await productManager.addProduct(title, description, price, thumbnail, code, stock);
    res.send(newProduct);
});

routerProd.get('/:id', async (req,res) => {
    let id = parseInt(req.params.id)
    let product = await productManager.getProductById(id)
    if (!product) return res.send({error: "PRODUCT NOT FOUND"})
    res.send(product)
  })

  routerProd.delete('/:id', async (req, res) => {
    let mensaje = await productManager.deleteProductById(req.params.id) 
    res.send(mensaje)
})

routerProd.put('/:id', async (req, res) => { 
    let mensaje = await productManager.updateProducts(req.body)
    res.send(mensaje)
  })



export default routerProd