var date = new Date();
var mongoose = require("mongoose");
var IssueSchema = new mongoose.Schema({
AccNo : {type:String},
username : {type:String},
issud_on:{type:Date,default:date},
Due_on : {type:Date,default:date.setDate(date.getDate()+ 30)}
});
module.exports = mongoose.model("Issue", IssueSchema);
