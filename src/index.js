const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const port = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));
io.on('connection', (socket) => {
    console.log('New WebSocket Connection');

    socket.emit('message', generateMessage('welcome!'))

    socket.broadcast.emit('message', generateMessage('New user joined!'))
    // io.emit('message', msg)
    socket.on('sendMessage', (message, callback) => {
        io.emit('message', generateMessage(message))
        callback('delivered!');
    })
    socket.on('sendLocation', (coords, callback) => {
        socket.broadcast.emit('locationMessage', generateLocationMessage(`https://google.com/maps?g=${coords.latitude}${coords.longitude}`))
        callback();
    })
    socket.on('disconnect', () => {
        io.emit('message', generateMessage('one user left!'))
    })
    
})

server.listen(port, () => {
    console.log(`app is running on port ${port}`);
})