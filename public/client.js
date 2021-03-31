const socket = io()
const [
  form,
  input,
  messages,
  users,
  next,
] = [
  'form',
  'input',
  'messages',
  'users',
  'next',
].map(id => document.getElementById(id))
let players = []
let currentPlayer = {}
let localPlayer = {}

const debounce = (func, timeout = 1000) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => { func.apply(this, args) }, timeout)
  }
}

const unlockInput = () => {
  input.value = ''
  input.removeAttribute('disabled')
  input.setAttribute('placeholder', 'Type your order')
}
const lockInput = () => {
  input.value = ''
  input.setAttribute('disabled', true)
  input.setAttribute('placeholder', 'Wait for your turn')
}
const updatePlayers = () => {
  users.innerHTML = ''
  players.forEach(player => {
    var item = document.createElement('li')
    item.textContent = player.name
    item.id = player.id
    users.appendChild(item)
  })

  $localPlayer = document.getElementById(localPlayer.id)
  if ($localPlayer) {
    $localPlayer.classList.add('local')
  }
  
  $currentPlayer = document.querySelector('current')
  if ($currentPlayer) {
    $currentPlayer.classList.remove('current')
  }
  if (currentPlayer && currentPlayer.id) {
    $currentPlayer = document.getElementById(currentPlayer.id)
    if ($currentPlayer) {
      $currentPlayer.classList.add('current')
    }
  }

  if (currentPlayer.id === localPlayer.id) {
    unlockInput()
  } else {
    lockInput()
  }
}

form.addEventListener('submit', e => {
  e.preventDefault()
  if (input.value) {
    socket.emit('player message', input.value)
    lockInput()
  }
})

next.addEventListener('click', debounce(() => {
  socket.emit('next player', input.value)
}))

socket.on('new player', (player) => {
  localPlayer = player
  updatePlayers()
})

socket.on('current player', (player) => {
  if (player && player.id) {
    currentPlayer = player
    $player = document.getElementById(player.id)
    if ($player) {
      
      $player.classList.add('current')
      updatePlayers()
      return
    }
  }

  console.error('Player not found', player);
})

socket.on('player message', (msg) => {
  var item = document.createElement('li')
  item.textContent = msg
  messages.appendChild(item)
  window.scrollTo(0, document.body.scrollHeight)
})

socket.on('player list', (serverPlayers) => {
  players = serverPlayers
  updatePlayers()
})