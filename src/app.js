//BACKEND
import "dotenv/config"

import express from 'express'
import routerProd from './routes/product.js'
import routerCart from "./routes/cart.js"
import routerSocket from './routes/socket.js'
import {__dirname} from './path.js'
import {engine}  from 'express-handlebars'
import * as path from 'path' 
import {Server} from 'socket.io' 
import userRouter from './routes/user.js'
import cartsDBRouter from "./routes/cartsMongoose.js"
import productDBRouter from "./routes/productMongoose.js"








const app = express()
app.set("port", process.env.PORT || 5000)


const server = app.listen(app.get("port"), () => console.log(`Server on port ${app.get("port")}`))

const io = new Server(server) //guardo mi server en socket



//Middlewares
app.use(express.urlencoded({extended:true}))
app.use(express.json()) 
app.engine("handlebars",engine()) 
app.set("view engine","handlebars") 
app.set('views',path.resolve(__dirname , './views')) 



//routes
app.use('/',express.static(__dirname + '/public')) 

app.use('/api/products',routerProd) 

app.use('/api/carts',routerCart)

app.use('/',routerSocket)
app.use('/users',userRouter)
app.use("/mongoose/products", productDBRouter);
app.use("/mongoose/carts", cartsDBRouter);

const mensajes = []
io.on('connection', (socket) => {  //CUANDO ALGUIEN SE CONECTE
    console.log("usuario conectado")
    socket.on('mensaje', info => { //recibo la informacion del que generamos (socket.emit - "mensaje") en main.js con socket.on , mas precisamente la del input que esta en main.handlebars
        mensajes.push(info) //mando la informacion que recibimos a un array vacio
        io.emit('mensajesLogs',mensajes) //lo imprimo en la etiqueta "p" de mi html
    })
}) 






