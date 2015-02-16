var Mongoose = require('mongoose');
var ObjectId = Mongoose.Schema.Types.ObjectId;
var UsersModels = new Object();

//Схема пользователей
var UsersSchema = new Mongoose.Schema({
    _id : { type: ObjectId  },
    lastCookieId      : { type : String },
    lastCookieExpires : { type : Number },
    LastSocketId      : { type : String }
}, { collection : "User" });
UsersModels.User = Mongoose.model('User', UsersSchema);

exports.UsersModels = UsersModels;