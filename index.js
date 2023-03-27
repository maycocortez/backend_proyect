import 'dotenv/config'
import express from 'express'
import FileStore from 'session-file-store' //guardo datos de la session en la pc del cliente
import session from 'express-session'
import MongoStore from 'connect-mongo'
import cookieParser from 'cookie-parser'
import routerSession from './routes/sessions.js'


const app = express()

const fileStorage = FileStore(session)

app.use(cookieParser(process.env.SIGNED_COOKIE)) // "Firmamos" nuestra cookie con una contraseña para que nadie la pueda modificar
app.use(express.json())
app.use(session({
   // store: new fileStorage({path : './sessions',ttl: 30000,retries: 1}) , //guardo la session en mi app dentro de la carp "sessions". ttl: timetolive(cuanto tiempo se guarda)
   store: MongoStore.create({ //guardo mi session en MongoDB atlas
    mongoUrl: process.env.URL_MONGODB_ATLAS,
    mongoOptions: {useNewUrlParser:true,useUnifiedTopology:true},
    ttl:30 //tiempo en segundos
   }) ,
   secret: process.env.SESSION_SECRET, //MI SESSION VA A SER SECRETA. CREAMOS LA CONTRASEÑA EN .ENV
    resave: true, //no se cierra la session si se recarga la pestaña
    saveUninitialized: true //se guarda la informacion por mas que el usuario no haga nada
}
    
))

function auth (req,res,next) {
    if(req.session?.email === "admin@admin.com") {
        return next()
    }
    return res.send("No tenes acceso a este contenido")
} //validacion para verificar que el email sea el mismo del admin

app.listen(4000, () => console.log("Server on port 4000"))

//rutas cookies
app.get('/setCookie', (req, res) => {
    res.cookie('CookieCookie', 'Esto es una cookie', { maxAge: 30000, signed: true }).send('Cookie')
})

app.get('/getCookie',(req,res) => { //funcion para consultar las cookies creadas
    res.send(req.signedCookies) //solo trabajara con cookies firmadas
})

//rutas session

app.get('/session',(req,res) => {
    if(req.session.counter) {
        req.session.counter++
        res.send(`Has entrado ${req.session.counter} de veces`) //cantidad de veces que inicio sesion el usuario
    } else {
        req.session.counter = 1
        res.send("Hola!")
    }
})


app.get('/admin',auth,(req,res) => {
    res.send("sos el admin")
})

app.get('logout',(req,res)=> {
    req.session.destroy(()=> {
        res.send("Salio!")
    })
})

app.get('/login',(req,res) => { //simulacion de login. HACERLA CON POSTMAN
    const {email,password} = req.body //pido email y password del body
    if(email == "admin@admin.com" && password == "1234") {
        req.session.email = email
        req.session.password = password
        return res.send("Login")
    }
    res.send("Login fallido") //no pongo else porque ya hay un return

})

app.use('/api/session',routerSession)