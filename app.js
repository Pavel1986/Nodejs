var io = require('socket.io')(8080);
console.log("Node.js server started at 8080 port.");

io.on('connection', function (socket) {
    
  console.log('Connected');
          
  socket.on('join', function (data) {
        
    socket.join(data.topic);
    
  });
  
  socket.on('message', function (data) {
        
    console.log('Reiceved message: ' + data.message);
    io.to(data.topic).emit('message', data.message);
    
  });

  socket.on('disconnect', function () {
    io.sockets.emit('Disconnected');
  });
});