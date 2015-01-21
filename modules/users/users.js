var Mongoose = require('mongoose');
var async = require('async');

/* Получение схем для mongoose моделей */
var UserModel = require('./usersSchemes').UsersModels.User;

var CheckUserAuthorizationByCookieID = function(CookieID, FuncCallback){
    
    var arResult = new Object();
    arResult.CookieID = CookieID;   
            
    async.waterfall([
            function(callback){                
                console.log("Получаем данные");                
                    callback(null, arResult);
            },
            function(arResult, callback){                
                console.log("Производим поиск среди пользователей");                
                //console.log(arResult.CookieID);
                console.log("Текущее время: " + new Date().getTime() / 1000);
                console.log("Expires время: 1421858631");
                
                
                //TopicModel.update( { "$or" : [ { status_code : "waiting" }, { status_code : "processing"} ] ,  date_temp_closing : { $lte : new Date().getTime() / 1000 } }, { status_code : "closed" }, { multi: true }, function(err, TopicsList){
                //UserModel.find( { lastCookieId : arResult.CookieID ,  date_temp_closing : { $lte : new Date().getTime() / 1000 } }, { status_code : "closed" }, { multi: true }, function(err, TopicsList){
                //Выбираем пользователя, у которого время закрытия сессии больше, чем текущее. 
                UserModel.findOne( { lastCookieId : arResult.CookieID, lastCookieExpires : { $gte : new Date().getTime() / 1000 }  }, '_id', function(err, User){
                    if(err){
                        console.log(err);
                        callback(true, err);                   
                    }
                    
                    console.log(User);
                    
                    callback(null, arResult);                   
                });
            }
        ], function (Err, arResult) {
            if(!Err){
                
                var result = 'Проверка авторизации пользователя завершена';                
                
            }
            
            FuncCallback(result);
            
        });           
}

module.exports = {
    CheckUserAuthorizationByCookieID : CheckUserAuthorizationByCookieID
}