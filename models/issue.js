var mongoose = require("mongoose");
var IssueSchema = new mongoose.Schema({
AccNo : {type:String},
username : {type:String},
});
module.exports = mongoose.model("Issue", IssueSchema);
