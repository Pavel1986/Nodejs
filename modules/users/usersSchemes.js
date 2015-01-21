var Mongoose = require('mongoose');
var ObjectId = Mongoose.Schema.Types.ObjectId;
var UsersModels = new Object();

//Схема пользователей
var UsersSchema = new Mongoose.Schema({
    lastCookieId       : { type : String },
    lastCookieExpires : { type : Number }    
}, { collection : "User" });
UsersModels.User = Mongoose.model('User', UsersSchema);

exports.UsersModels = UsersModels;