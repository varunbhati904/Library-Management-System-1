var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var BookSchema = new mongoose.Schema({
name :{type:String},
author :{type:String},
ISBN : {type:Number},
ShelfNo : {type:String},
AccNo : {type:String},
publisher : {type:String},
category : {type:String}
});
BookSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("Book", BookSchema);