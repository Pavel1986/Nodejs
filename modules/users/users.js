var Mongoose = require('mongoose');
var async = require('async');

/* Получение схем для mongoose моделей */
var UserModel = require('./usersSchemes').UsersModels.User;
var TopicModel = require('./../debates/debatesSchemes').DebateModels.Topic;

var GetUser = function(Params, Fields, Options, FuncCallback){    

    //Выбираем пользователя, у которого время закрытия сессии больше, чем текущее. 
    UserModel.findOne( Params, Fields, Options, function(err, User){
        if(User){
            FuncCallback(User);                
        }else{
            FuncCallback(false);
        }
    });
}

var CheckUserAuthorization = function(arParams, FuncCallback){
    
    arParams.lastCookieExpires = { $gte : new Date().getTime() / 1000 };
    
    console.log("Производим поиск среди пользователей");                
    
    console.log(arParams);

    //Выбираем пользователя, у которого время закрытия сессии больше, чем текущее. 
    UserModel.findOne( arParams, '_id', { lean : true }, function(err, User){
        if(User){
            FuncCallback(true);                
        }else{
            FuncCallback(false);
        }
    });
}

var isUserAnyTopicMember = function(UserID, ExceptTopicID, FuncCallback){
    
    TopicModel.findOne( { members : UserID, "$or" : [ { status_code : "waiting" }, { status_code : "processing"} ] }, '_id', { lean : true }, function(err, arTopic){
        if(arTopic){
            FuncCallback(true);                
        }else{
            FuncCallback(false);
        }
    });
    
}

module.exports = {
    CheckUserAuthorization : CheckUserAuthorization,
    GetUser                : GetUser,
    isUserAnyTopicMember   : isUserAnyTopicMember,
    UserModel              : UserModel
}