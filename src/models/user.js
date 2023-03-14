import mongoose from "mongoose";

const userCollection = "users" //nombre de mi coleccion

const userSchema = new mongoose.Schema({ // Esquema de usuario
    nombre: String,
    apellido: String,
    email: {
        type: String,
        unique: true
    },
    edad: Number
})

export const userModel = mongoose.model(userCollection,userSchema)