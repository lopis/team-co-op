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
let currentPlayer = null

const debounce = (func, timeout = 1000) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => { func.apply(this, args) }, timeout)
  }
}

form.addEventListener('submit', e => {
  e.preventDefault()
  if (input.value) {
    socket.emit('player message', input.value)
    input.value = ''
  }
})

next.addEventListener('click', debounce(() => {
  socket.emit('next player', input.value)
}))

socket.on('current player', (player = {}) => {
  console.log('current player', player);
  if (currentPlayer) {
    document.getElementById(currentPlayer.id).classList.remove('current')
  }
  $player = document.getElementById(player.id)
  if ($player) {
    currentPlayer = player
    $player.classList.add('current')
  } else {
    console.error('Player not found', player);
  }
})

socket.on('player message', (msg) => {
  var item = document.createElement('li')
  item.textContent = msg
  messages.appendChild(item)
  window.scrollTo(0, document.body.scrollHeight)
})

socket.on('player list', (players = []) => {
  console.log('player list', players)
  users.innerHTML = ''
  players.forEach(player => {
    var item = document.createElement('li')
    item.textContent = player.name
    item.id = player.id
    users.appendChild(item)
  })
})