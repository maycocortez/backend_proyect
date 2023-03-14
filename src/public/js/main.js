//para usar esto primero tengo que guardar el cdnjs en mi archivo main.handlebars

//cliente/frontEnd

//socket.emit y socket.on tienen que tener la misma clave , por ejemplo : socket.emit('mensaje) - socket.on(mensaje)

const socket = io()

const chatBox = document.getElementById('chatBox')

const messageLogs = document.getElementById('messageLogs')

let user

Swal.fire({
    title: "inicia sesion",
    input: "text",
    text: "Por favor inicie sesion para continuar",
    inputValidator : (valor) => {
        return !valor && "ingrese un valor valido"
    },
    allowOutsideClick: false
}).then(resultado => {
    user = resultado.value
    console.log(user)
}) 


chatBox.addEventListener('keyup', (e) => {
    if(e.key === "Enter")  { //si el usuario aprieta enter en el input 
        if(chatBox.value.trim().length > 0) { //si el valor que ingresa el usuario es mayor a 0 caracteres (trim es para remover espacios en vacios)
            socket.emit('mensaje' , {usuario : user , info: chatBox.value}) //consulto el input y le envio a mi app el siguiente usuario en formato objeto
            chatBox.value = '' //cuando lo envio borro el valor anterior
        }
    }
})

socket.on('mensajesLogs', info => { //cuando me llegue esta info (QUE ME ENVIA EL BACKEND)

    messageLogs.innerHTML = '' //borro la informacion previa
    info.forEach(mensaje => { //todos los mensajes
        messageLogs.innerHTML += `<p> ${mensaje.usuario} dice: ${mensaje.info} </p>` //que usuario envio y cual fue el mensaje
        
    });
})

//hacemos el .then porque puede demorar. lo que ingrese se guarda en user


/*
socket.emit('mensaje',"hola me estoy conectando") //recibo informacion del cliente

socket.on('evento-admin',datos => {
    console.log(datos)
})


socket.on('evento-general',datos => {
    console.log(datos)
})

*/