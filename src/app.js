const express = require('express')
const morgan = require('morgan')
const {Server} = require('socket.io')
const http = require('http')
const os = require('os')

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
    cors:{
        origin:'*'
    }
})

require('dotenv').config()
var cors = require('cors')
const path = require('path');
const { horaFormat } = require('./helpers/horaFormat');
const { createZip, uploadBackup } = require('./controllers/backup');
const port = process.env.PORT

app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

// let interval = setInterval(()=>{
//     let day = new Date().getDay()
//     if(process.env.DAY == day){
//         console.log('Dia de BACKUP');
//     // let hora = horaFormat()
//     console.log(hora);
//     if(process.env.HOUR == hora){
//             console.log('Hora de BACKUP');
//             createZip(startInterval,stopInterval)
//     }
// }
// },1000)


// //comienzo intervalo
// const startInterval = ()=>{
//     let interval = setInterval(()=>{
//         let day = new Date().getDay()
//         if(process.env.DAY == day){
//             console.log('Dia de BACKUP');
//         // let hora = horaFormat()
//         console.log(hora);
//         if(process.env.HOUR == hora){
//                 console.log('Hora de BACKUP');
//                 createZip(startInterval,stopInterval)
//         }
//     }
//     },60000)
// }


// // detengo intervalo
// function stopInterval() {

//     clearInterval(interval);

// }


io.on('connection',(socket)=>{
    console.log('usuario conectado ',socket.id);

setInterval(() => {
    socket.emit('message',{
        name:'Local',
        ram:os.freemem()
    })
}, 1000);
    
})
server.listen(port,()=>{
    console.log(`http://localhost:${port} iniciado: ${new Date().toLocaleString()}`);
})
