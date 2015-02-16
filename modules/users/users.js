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

var CheckUserAuthorization = function(CookieID, FuncCallback){
            
    //Выбираем пользователя, у которого время закрытия сессии больше, чем текущее. 
    /*
     *  If found return User object, if not = false     * 
     */
    
    /* Почему закончилась сессия раньше времени ??? в Symfony  */
    
    UserModel.findOne( { lastCookieExpires : { $gte : Math.round(new Date().getTime() / 1000) }, lastCookieId : CookieID } , '_id lastCookieExpires', { lean : true }, function(err, User){
        
        currentTime = Math.round(new Date().getTime() / 1000);
        
        if(User){
            console.log('Current time : ' + currentTime);
            console.log('Users expires times :' + User.lastCookieExpires);
            if(currentTime < User.lastCookieExpires){
                console.log('Current time is < lastCookieExpires');
            }
            FuncCallback(User);                
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