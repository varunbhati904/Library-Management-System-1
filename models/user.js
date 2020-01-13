var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var UserSchema = new mongoose.Schema({
name :{type:String},
rollno :{type:String},
DOB : {type:Date},
Fine : {type:Number},
email : {type:String},
username : {type:String},
});
UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", UserSchema);