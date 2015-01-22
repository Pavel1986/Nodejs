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

var CheckTopics = function(){
         
    setInterval(function() {
        
    console.log('\n Запущенна проверка \n');
        
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
                //console.log("Производим проверку для перевода обсуждений из статусов \"waiting\" и \"processing\", в статус \"closed\"");
                //console.log("Текущее время в unix формате: " + new Date().getTime() / 1000);                
                //TopicModel.find( { status_code : "waiting", date_temp_closing : { $lte : new Date().getTime() / 1000 } }, "waiting", {}, function(err, TopicsList){            
                //TopicModel.update( { status_code : "waiting",  date_temp_closing : { $lte : new Date().getTime() / 1000 } }, { status_code : "closed" }, { multi: true }, function(err, TopicsList){
                TopicModel.update( { "$or" : [ { status_code : "waiting" }, { status_code : "processing"} ] ,  date_temp_closing : { $lte : new Date().getTime() / 1000 } }, { status_code : "closed" }, { multi: true }, function(err, TopicsList){
                    if(err){
                        console.log(err);
                        callback(true, err);                   
                    }
                    callback(null, arResult);                   
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
    CheckTopics                  : CheckTopics
}