const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const port = process.env.PORT || 3000;
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')


const app = express();
const server = http.createServer(app);
const io = socketio(server);

const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));
io.on('connection', (socket) => {
    console.log('New WebSocket Connection');

    socket.on('join', ({ username, room }, callback) => {
        const { error, user} = addUser({id: socket.id, username, room})

        if(error) {
            return callback(error)
        }
        socket.join(user.room)

        socket.emit('message', generateMessage('Admin', 'welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`))
        callback()
    })

    
    // io.emit('message', msg)
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback('delivered!');
    })
    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('message', generateMessage(message))
        socket.broadcast.emit('locationMessage', generateLocationMessage(user.username,`https://google.com/maps?g=${coords.latitude}${coords.longitude}`))
        callback();
    })
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if(user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left`))
        }
    })
    
})

server.listen(port, () => {
    console.log(`app is running on port ${port}`);
})