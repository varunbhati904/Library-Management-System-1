var mongoose = require("mongoose");
var IssueSchema = new mongoose.Schema({
AccNo : {type:String},
username : {type:String},
issud_on:{type:Date,default:Date.now},
Due_on : {type:Date,default:Date.now()+ 30*24*60*60*1000}
});
module.exports = mongoose.model("Issue", IssueSchema);
