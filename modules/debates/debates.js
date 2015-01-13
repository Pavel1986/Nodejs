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

var sleep = function (time, callback) {
    var stop = new Date().getTime();
    while(new Date().getTime() < stop + time) {
        ;
    }
    callback();
}

var CheckTopics = function(){
      
    /*
    setInterval(function() {
        
        console.log('Starting to check topics.');
        
        sleep(12000, function(){
            console.log('Waked up!');
        });
        
        
    }, 5000);
    */
    
    
    setInterval(function() {
        
    console.log('\n Запущенна проверка \n');
        
    arResult = new Object();
    
    async.waterfall([
            function(callback){                
                console.log("Не происходит ли в данный момент проверка обсуждений");
                if(CheckingTopics){
                    console.log('! Проверка уже запущенна !');
                    callback(true, arResult);
                }else{
                    CheckingTopics = true;
                    callback(null, arResult);
                }                
            },
            function(arResult, callback){                
                console.log("Производим проверку для перевода обсуждений из статуса \"waiting\" в статус \"processing\"");
                
                TopicModel.find( { status_code : "waiting" }, "waiting", {}, function(err, TopicsList){            
                    if(err){
                        console.log(err);
                    }

                    console.log(TopicsList);
                });
            },
            function(arResult, callback){
                console.log("Производим проверку для перевода обсуждений из статуса \"processing\" в статус \"closed\"");
                sleep(12000, function(){
                    console.log('Waked up!');
                    callback(null, arResult);
                });                        
            }
        ], function (Err, arResult) {
            if(!Err){
                console.log("Проверка закончена. Разрешаем дальнейшую проверку обсуждений.");
                CheckingTopics = false;
            }
        });   
        
    }, 5000);

    /*
       
    TopicModel.find( { status_code : "waiting" }, "waiting", { lean : true }, function(err, TopicsList){            
        if(err){
            console.log(err);
        }
        
        console.log(TopicsList);
    });*/
}

module.exports = {
    GetMessagesByTopicID         : GetMessagesByTopicID,
    SaveMessage                  : SaveMessage,
    CheckTopics                  : CheckTopics
}