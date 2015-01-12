var async = require('async');
var io = require('socket.io')(8080);
var mongoose = require('mongoose').connect('mongodb://127.0.0.1/debates');
var debatesModule = require('./modules/debates/debates');

/*
var EventEmitter = require('events').EventEmitter;
var TopicsChecker = new EventEmitter();

radium.on('radiation', function(ray) {
    console.log(ray);
});
*/

setInterval(function() {
    debatesModule.CheckTopics();
}, 5000);




console.log("Node.js server started at 8080 port.");

io.on('connection', function (socket) {
              
  socket.on('join', function (data) {
        
    socket.join(data.topic_id);
    var arResult = new Object();
    
     async.waterfall([
            function(callback){                
                //console.log("Получаем сообщения обсуждения об обсуждении");
                
                debatesModule.GetMessagesByTopicID( data.topic_id, function(err, doc){
                    if(err){
                        console.log('Error while saving topic message');
                    }
                    callback(null, doc);
                });
                
                callback(null, arResult);
            },
            function(arResult, callback){                
                
                callback(null, arResult);
            }
        ], function (Err, arResult) {
            //Отправляем ответ            
            
            if(!Err){
                socket.emit('messages_list', { 'messages' : arResult });
            }else{
                console.log('Main async error while saving topic message');
            }
        });
    
    
  });
  
  socket.on('message', function (data) {
         
    var arParams = new Object();
    var arResult = new Object();
    
        arParams.topic_id = data.topic_id;
//      arParams.Language = Socket.CookieSession.ParsedSession.InterfaceLanguage;
//      arParams.SocketID = Socket.id;
//      arParams.CookieSessionID = Socket.CookieSessionID;
        arParams.message = data.message;
        
        async.waterfall([
            function(callback){                
                //console.log("Получаем данные об обсуждении");
                callback(null, arResult);
            },
            function(arResult, callback){                
                //console.log("Проверяем, что обсуждение в статусе Processing");
                callback(null, arResult);
            },
            function(arResult, callback){
                //console.log("Сохраняем сообщение");
                debatesModule.SaveMessage( arParams, function(err, doc){
                    if(err){
                        console.log('Error while saving topic message');
                    }
                    callback(null, arParams);
                });
            }
        ], function (Err, arResult) {
            //Отправляем ответ
            if(!Err){
                io.to(arResult.topic_id).emit('message', arParams.message);
            }else{
                console.log('Main async error while saving topic message');
            }
        });        
    
  });

  socket.on('disconnect', function () {
    io.sockets.emit('Disconnected');
  });
});