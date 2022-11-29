const socket = io()
// 

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessaStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessaStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible Height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container

    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        console.log('Height', newMessageHeight)
        $messages.scrollTop = $messages.scrollHeight
    }

}

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')
    const message = e.target.elements.message.value
    
    socket.emit('sendMessage', message, (error) => {
        if (error) {
            return console.log(error)
        }
        console.log('Message Delivered!')
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

    })
    
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

socket.on('locationMessage', (message) => {
    console.log(message)
    const html = Mustache.render(locationTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
});


// socket.on('message', (message) => {
    
//     console.log(message)
// })
socket.on('countUpdated', (count) => {
    console.log('The count has been updated', count)
});

$sendLocationButton.addEventListener('click', () => {
    
    $sendLocationButton.setAttribute('disabled', 'disabled')
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendPosition', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (error) => {
            if (error) {
                return console.log(error)
            }
            console.log('Location shared!')
            $sendLocationButton.removeAttribute('disabled')
        })
    })
})

// document.querySelector('#increment').addEventListener('click', () => {
//     socket.emit('increment')
// })

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})