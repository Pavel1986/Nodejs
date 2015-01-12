var Mongoose = require('mongoose');
var async = require('async');

/* Получение схем для mongoose моделей */
var TopicMessagesModel = require('./debatesSchemes').DebateModels.TopicMessages;

var GetMessagesByTopicID = function(TopicID, callback){

    TopicMessagesModel.find({ topic_id : TopicID }, null, { lean : true, sort : { date_created : 1 } }, function(err, TopicMessages){
                
        callback(null, TopicMessages);

    })

};

var SaveMessage = function (arParams, callback){

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

module.exports = {
    GetMessagesByTopicID         : GetMessagesByTopicID,
    SaveMessage                  : SaveMessage
}