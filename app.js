var io = require('socket.io')(8080);
console.log("Node.js server started at 8080 port.");

io.on('connection', function (socket) {
    
    console.log('Connected');
    
  io.emit('this', { will: 'be received by everyone'});

  socket.on('private message', function (from, msg) {
    console.log('I received a private message by ', from, ' saying ', msg);
  });

  socket.on('disconnect', function () {
    io.sockets.emit('Disconnected');
  });
});