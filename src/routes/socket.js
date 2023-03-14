//primero creo el archivo socket.js. lo exporto aca abajo y lo importo en app.js
//creo la ruta con app.use('/',routerSocket)
//hago el render mas abajo , en este caso del archivo index.handlebars


import { Router } from "express";

const routerSocket = Router()

routerSocket.get('/',(req,res) => {
    res.render('index',{})
})


export default routerSocket