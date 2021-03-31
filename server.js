const { trim, escape, blacklist } = require('validator')
const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

app.use(express.static('public'))

let players = []
let currentPlayer = null
const treeNames = [
  'Pterocarpus', 'Betula', 'Acacia', 'Jengkol',
  'Ziziphus', 'Carpinus', 'Balanites', 'Aren',
  'Parkia', 'Acer', 'Boscia', 'Cedrela',
  'Rubber', 'Khaya', 'Citrullus', 'Acrocomia',
  'Durian', 'Albizzia', 'Leptadenia', 'Aegiphila',
]
const adjectives = [
  'Lush', 'Green', 'Healthy', 'Leafy',
  'Tall', 'Massive', 'Ancient', 'Wild',
  'Fruitful', 'Budding', 'Blossoming', 'Flowery',
  'Lovely', 'Graceful', 'Wonderful', 'Welcoming',
  'Thirsty', 'Dry', 'Endangered', 'Quiet',
  'Withered', 'Dormant', 'Lonely', 'Bruised',
]
Array.prototype.getRandom = function () {
  return this[Math.floor(Math.random() * this.length)]
}

const badCharList = '<>\\[\\]' // Regex string
const sanitize = msg => {
  return trim(escape(blacklist(msg, badCharList)))
}
const getId = () => {
  return (Math.floor((1+Math.random())*0x10000)).toString(16)
}
const getName = () => {
  let name = ''
  while (!name || players.find(p => p.name === name)) {
    name = `${adjectives.getRandom()} ${treeNames.getRandom()}`
  }
  return name
}

io.on('connection', (socket) => {
  const player = {
    name: getName(),
    id: getId(),
  }
  players.push(player)
  console.log('new user', player.name)
  socket.on('disconnect', () => {
    console.log('Player disconnected', player.name, player.id)
    players = players.filter(p => p.id !== player.id)
    io.emit('player list', players)
  })
  socket.on('player message', (msg = '') => {
    safeMsg = sanitize(String(msg)).toLowerCase()
    io.emit('player message', msg)
  })
  socket.on('next player', () => {
    if (players.length < 2) return
    let nextPlayer = players.getRandom()
    while (nextPlayer === currentPlayer) {
      nextPlayer = players.getRandom()
    }
    console.log('Next player is', nextPlayer)
    currentPlayer = nextPlayer
    io.emit('current player', currentPlayer)
  })
  io.emit('player list', players)
  socket.emit('current player', currentPlayer)
})


http.listen(3000, () => {
  console.log('listening on *:3000')
})