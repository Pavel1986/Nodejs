var async = require('async');
var io = require('socket.io')(8080);
var mongoose = require('mongoose').connect('mongodb://127.0.0.1/debates');
var debatesModule = require('./modules/debates/debates');
var usersModule = require('./modules/users/users');
var cookie = require('cookie');

//Js Date object
current_date = new Date(new Date().getTime() / 1000);
//Unix time without milliseconds, like in topics
current_date = new Date().getTime() / 1000;
//console.log(current_date);

//Converting topic unix time to js unix time
topic_time = new Date(1421231881 * 1000);

//console.log(topic_time);
//debatesModule.CheckTopics();

io.on('connection', function (socket) {
    
    console.log(socket.id);
            
    //Если пользователь авторизован, то сохраняем в него последний SocketID
    usersModule.UserModel.findOneAndUpdate({ lastCookieId : cookie.parse(socket.handshake.headers['cookie']).DBSession, lastCookieExpires : { $gte : new Date().getTime() / 1000 } }, { LastSocketId : socket.id }, function(err, arUser){});    
    
    socket.on('joinTopic', function (data) {        
        socket.join(data.topic_id);           
        
        var arResult = new Object();

async.waterfall([
	function(callback){
            //console.log("Получаем сообщения обсуждения об обсуждении");
            debatesModule.GetMessagesByTopicID( data.topic_id, function(err, MessagesList){
                    if(err){
                            console.log('Error while saving topic message');
                    }else{
                            callback(null, MessagesList);
                    }
            });
            },
            function(arResult, callback){
                    callback(null, arResult);
            }], function (Err, arResult) {
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
  
  socket.on('addMember', function (SocketData) {
                
    arResult = new Object();        
    
    arResult.TopicID = SocketData.topic_id;
    arResult.MemberID = SocketData.user_id;
    arResult.CookieID = cookie.parse(socket.handshake.headers['cookie']).DBSession;
    arResult.MemberSocketID = socket.id;        
    
    async.waterfall([
            function(callback){                
                console.log("- Проверка авторизации пользователя. Получаем пользователя и находим его язык");                
                usersModule.GetUser({ _id : arResult.MemberID, lastCookieId : arResult.CookieID, enabled : true, lastCookieExpires : { $gte : new Date().getTime() / 1000 } }, "system_language", { lean : true }, function(arUser){
                    if(arUser){
                        arResult.Language = arUser.system_language;
                        callback(null, arResult);                         
                    }else{
                        callback(true, "User is not authorized");
                    }
                });                                
            },
            function(arResult, callback){                
                console.log("- Проверяем, участвует ли пользователь в других обсуждениях");
                usersModule.isUserAnyTopicMember(arResult.MemberID, false, function(isUserTopicMember){                    
                    if(isUserTopicMember){
                        callback(true, "User is member of active topics.");
                    }else{
                        callback(null, arResult);                    
                    }                    
                })                
            },
            function(arResult, callback){
                console.log("- Проверяем обсуждение по статусу и есть ли в нём место");
                debatesModule.TopicModel.findOne( { _id : arResult.TopicID, status_code : "waiting" }, 'members author_id', { lean : true }, function(err, arTopic){
                    if(arTopic){                        
                        if(arTopic.members.length < 2){
                            arResult.AuthorID = arTopic.author_id;
                            callback(null, arResult);                             
                        }else{                            
                            callback(true, "Topic has already 2 members."); 
                        }                                                                        
                    }else{
                        callback(true, "Not found requested topic."); 
                    }
                });                
            },
            function(arResult, callback){                
                /*console.log("- Обновляем обсуждение (members, status, unix_temp_time)");
                debatesModule.TopicModel.findByIdAndUpdate( arResult.TopicID, { $push: { members : arResult.MemberID }, status_code : "processing", unix_temp_time : new Date().getTime() / 1000 }, function(err, numberAffected ){                   
                    if(err){
                        console.log(err);
                        callback(true, err);                   
                    }else{
                        callback(null, arResult);
                    }                    
                });     */
                callback(null, arResult);
            },
            function(arResult, callback){                
                console.log('Получаем активный сокетID автора обсуждения');
                usersModule.GetUser({ _id : arResult.AuthorID }, "LastSocketId", { lean : true }, function(arUser){
                    if(arUser){
                        arResult.AuthorLastSocketId = arUser.LastSocketId;
                        callback(null, arResult); 
                    }else{
                        callback(true, "Topic author is not found");
                    }
                });                                                 
                
            }
        ], function (Err, arResult) {                                    
            if(Err){
                console.log("Отправляем сокет-сообщение кандидату с сообщением об ошибке");
                console.log(arResult);
            }else{
                console.log("Производим рассылку сокет-сообщений для участников обсуждения, что бы перезагрузить страницу или отобразить информационное сообщение");
                //1. Проверяем есть ли автор в комнате этого обсуждение, если нет, то отправляем ему личное сообщение
                //2. Отправляем всем в обсуждении это сообщение               
                RoomMembers = getAllRoomMembers(arResult.TopicID);
                if (RoomMembers.indexOf(arResult.AuthorLastSocketId) < 0){
                   io.to(arResult.AuthorLastSocketId).emit('TopicStartedAuthor', {});
                }
                io.sockets.to(arResult.TopicID).emit('TopicStarted', {});
            }
        });                    
  });

  socket.on('disconnect', function () {
    io.sockets.emit('Disconnected');
  });
  
  /* For test only  */
  socket.on('getUsersList', function (data){
      //console.log(io.sockets.clients(data.topic_id));
      console.log(io.sockets.adapter.rooms[data.topic_id]);
  });
  
  socket.on('TopicStarted', function (data){
      io.sockets.in(data.topic_id).emit('TopicStarted', {});
       
       RoomMembers = getAllRoomMembers(data.topic_id);
       console.log(RoomMembers);
       console.log(RoomMembers[socket.id]);
      if (typeof RoomMembers[socket.id] !== 'undefined'){
          console.log('Found current user');
      }
      
      console.log('Topic started : ' + data.topic_id + ' Requested  by : '  + socket.id);
  });
  
});

function getAllRoomMembers(room, _nsp) {
    var roomMembers = [];
    var nsp = (typeof _nsp !== 'string') ? '/' : _nsp;

    for( var member in io.nsps[nsp].adapter.rooms[room] ) {
        roomMembers.push(member);
    }

    return roomMembers;
}

console.log("Node.js server started at 8080 port.");