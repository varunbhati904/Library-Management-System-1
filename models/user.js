var mongoose = require("mongoose");
var date = new Date();
var defdate = new Date("01/01/1970");
var ndate = new Date();
var passportLocalMongoose = require("passport-local-mongoose");
var UserSchema = new mongoose.Schema({
name :{type:String},
rollno :{type:String},
DOB : {type:Date, default:defdate},
Fine : {type:Number,default:0},
email : {type:String, required:true},
username : {type:String},
role: {type:String},
confirmed: {type:Boolean, default:true},
create: {type:Date,default: ndate},
expiry: {type:Date,default: date.setDate(date.getYear() + 4)}
});
UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", UserSchema);
