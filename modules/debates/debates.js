var Mongoose = require('mongoose');
var async = require('async');

/* Получение схем для mongoose моделей */
var TopicModel = require('./debatesSchemes').DebateModels.Topic;
var TopicMessagesModel = require('./debatesSchemes').DebateModels.TopicMessages;

var CheckingTopics = false;

var GetMessagesByTopicID = function(TopicID, callback){

    TopicMessagesModel.find({ topic_id : TopicID }, null, { lean : true, sort : { date_created : 1 } }, function(err, TopicMessages){
                
        callback(null, TopicMessages);

    })

};

var SaveMessage = function(arParams, callback){

    var NewMessage = TopicMessagesModel();
    //NewMessage.UserID =
    NewMessage.topic_id = arParams.topic_id;
    NewMessage.date_created = new Date().getTime();
//    NewMessage.language = arParams.Language;  //Изменить
    NewMessage.message = arParams.message;
    NewMessage.rank = 0;
    NewMessage.save();

    callback();

}

var CheckTopics = function(io){        
         
    setInterval(function() {
        
    console.log("Запущена проверка обсуждений на закрытие");    
    arResult = new Object();
        
    async.waterfall([
            function(callback){                
                //console.log("Не происходит ли в данный момент проверка обсуждений");
                if(CheckingTopics){
                  //  console.log('! Проверка уже запущена !');
                    callback(true, arResult);
                }else{
                    CheckingTopics = true;
                    callback(null, arResult);
                }                
            },
            function(arResult, callback){                
                
                //надо найти обсуждения, у которых заканчивается время за 5 минут до конца и сделать сокет-рассыку участникам, что они могут продлить время обсуждения
                callback(null, arResult);                    
              
            },
            function(arResult, callback){                
                //console.log("Производим проверку для перевода обсуждений из статусов \"waiting\" и \"processing\", в статус \"closed\"");
                //TopicModel.find( { status_code : "waiting", date_temp_closing : { $lte : new Date().getTime() / 1000 } }, "waiting", {}, function(err, TopicsList){            
                //TopicModel.update( { status_code : "waiting",  date_temp_closing : { $lte : new Date().getTime() / 1000 } }, { status_code : "closed" }, { multi: true }, function(err, TopicsList){
                //TopicModel.update( { "$or" : [ { status_code : "waiting" }, { status_code : "processing"} ] ,  date_temp_closing : { $lte : new Date().getTime() / 1000 } }, { status_code : "closed" }, { multi: true }, function(err, numberAffected, rawResponse){
               
               TopicModel.find({ "$or" : [ { status_code : "waiting" }, { status_code : "processing"} ] ,  date_temp_closing : { $lte : new Date().getTime() / 1000 } }, "id", { lean : true}, function(err, topics){                   
                   if(err){
                       callback(true, err);
                   }else{
                       //console.log("Найдены обсуждения : " + topics.length);                       
                       async.each(topics, function(topic, EachCallback) {
                        //console.log("Обрабатываем обсуждения");
                        TopicModel.findByIdAndUpdate(topic._id, { status_code : "closed" }, function(err, FoundTopic){                                    
                            if(err){
                                EachCallback(true, '[ CheckTopics ] Error while updating topic: ' + topic._id);
                            }else{
                                io.sockets.in(topic._id).emit('TopicClosed', { topic_id : topic._id});
                                EachCallback(null);
                            }                                    
                        });
                      }, function(err){
                          if( err ) {
                            console.log(err);
                          }
                      });
                   }                                      
               });
            }
        ], function (Err, arResult) {
            if(!Err){
                //console.log("Проверка закончена. Разрешаем дальнейшую проверку обсуждений.");
                CheckingTopics = false;
            }
        });   
        
    }, 5000);
}

module.exports = {
    GetMessagesByTopicID         : GetMessagesByTopicID,
    SaveMessage                  : SaveMessage,
    CheckTopics                  : CheckTopics,
    TopicModel                   : TopicModel
}