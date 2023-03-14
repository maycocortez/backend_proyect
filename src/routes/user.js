import { Router } from "express";
import { userModel } from "../models/user.js";

const userRouter = Router()

userRouter.get('/', async (req,res) => {
try {
    const users =  await userModel.find() //devuelve todos los usuarios
    res.send({resultado: 'success' , valores: users})
} catch (error) {
    res.send("Error en consulta a users, mensaje: " , error)
    
}
})


userRouter.post('/', async (req,res) => {
    try {
        const {nombre,apellido,email,edad} = req.body //envio estos valores a la base de datos
        const resultado =  await userModel.create({
            nombre,
            apellido,
            email,
            edad
        }) //envio estos datos con POSTMAN en body/raw y en formato JSON {}
        res.send({resultado: 'success' , resultado:resultado})
    } catch (error) {
        res.send("Error en consulta a users, mensaje: " , error)
        
    }
    })

export default userRouter