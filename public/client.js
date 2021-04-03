const socket = io()
const [
  form,
  input,
  messages,
  users,
  next,
  submit,
  theme,
] = [
  'form',
  'input',
  'messages',
  'users',
  'next',
  'submit',
  'theme',
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
  submit.removeAttribute('disabled')
  next.setAttribute('disabled', true)
  input.value = ''
  input.removeAttribute('disabled')
  input.setAttribute('placeholder', 'Type your order')
}
const lockInput = () => {
  submit.setAttribute('disabled', true)
  next.removeAttribute('disabled')
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

const createMove = (msg) => {
  var item = document.createElement('li')
  item.textContent = msg
  messages.appendChild(item)
  messages.scrollTo(0, messages.scrollHeight)
}

form.addEventListener('submit', e => {
  e.preventDefault()
  if (input.value) {
    socket.emit('player message', input.value)
    lockInput()
  }
})

next.addEventListener('click', () => {
  next.setAttribute('disabled', true)
  setTimeout(() => socket.emit('next player'), 100)
})

theme.addEventListener('click', () => {
  document.body.classList.toggle('dark-theme')
  document.body.classList.toggle('light-theme')
})

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
})

socket.on('player message', createMove)

socket.on('player list', (serverPlayers) => {
  players = serverPlayers
  updatePlayers()
})

// let i = 0
// while (i < 50) {
//   const msg = `Move #${i}`
//   setTimeout(() => createMove(msg), 50 * i)
//   i++
// }

