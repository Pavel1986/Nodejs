var Mongoose = require('mongoose');
var ObjectId = Mongoose.Schema.Types.ObjectId;
var DebateModels = new Object();

var TopicMessagesSchema = new Mongoose.Schema({

    author_id : { type : String },
    topic_id : { type : String },
    date_created : { type : Number},
    language : { type : String },
    message : { type : String },
    rank : { type : String },
    blocked : {
        datetime : { type : Number},
        code : { type : String },
        reason : { type : String },
        author_id : { type : String }
    }

}, { collection : "TopicMessages" });
DebateModels.TopicMessages = Mongoose.model('TopicMessages', TopicMessagesSchema);

exports.DebateModels = DebateModels;