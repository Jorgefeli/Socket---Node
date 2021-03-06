const { Server } = require('net')

const host = '0.0.0.0'
// terminar conexion
const END = 'END'

//Mapa de conexiones
//127.0.0.1:8000 -> 'Jorge'
//127.0.0.1:9000 -> '4tomik'
const connections = new Map()

//funcion de error
const error = message => {
  console.error(message)
  //salida 1 == error salida 0 == correto
  process.exit(1)
}

const sendMessage = (message, origin) => {
  //mandar a todos menos a origin el message
  for (const socket of connections.keys()) {
    if (socket !== origin) {
      socket.write(message)
    }
  }
}

const listen = port => {
  const server = new Server()

  server.on('connection', socket => {
    //variable
    const remoteSocket = `${socket.remoteAddress}:${socket.remotePort}`
    console.log(`New connection from ${remoteSocket}`)
    socket.setEncoding('utf-8')

    socket.on('data', message => {
      connections.values()
      if (!connections.has(socket)) {
        console.log(`Username ${message} set for connection ${remoteSocket}`)
        connections.set(socket, message)
      } else if (message === END) {
        connections.delete(socket)
        socket.end()
      } else {
        const fullMessage = `[${connections.get(socket)}]: ${message}`
        // Enviar el mensaje al resto de clientes
        console.log(`${remoteSocket} -> ${message}`)
        sendMessage(fullMessage, socket)
      }
    })

    socket.on('error', err => console.error(err))
    // Ambas partes confirman la finalizacion
    socket.on('close', () => {
      console.log(`Connection with ${remoteSocket} closed`)
    })
  })

  server.listen({ port, host }, () => {
    console.log('Listening on port 8000')
  })

  server.on('error', err => error(err.message))
}

//Pone todo a funcionar
const main = () => {
  if (process.argv.length !== 3) {
    error(`Usage: node ${__filename} port`)
  }

  let port = process.argv[2]
  if (isNaN(port)) {
    error(`Invalid port ${port}`)
  }

  port = Number(port)

  listen(port)
}
if (require.main === module) {
  main()
}
