var Mongoose = require('mongoose');
var async = require('async');

/* Получение схем для mongoose моделей */
var UserModel = require('./usersSchemes').UsersModels.User;

var CheckUserAuthorization = function(arParams, FuncCallback){
    
    arParams.lastCookieExpires = { $gte : new Date().getTime() / 1000 };
    
    console.log("Производим поиск среди пользователей");                
    
    console.log(arParams);

    //Выбираем пользователя, у которого время закрытия сессии больше, чем текущее. 
    UserModel.findOne( arParams, '_id', function(err, User){
        if(User){
            FuncCallback(true);                
        }else{
            FuncCallback(false);
        }
    });
}

module.exports = {
    CheckUserAuthorization : CheckUserAuthorization
}