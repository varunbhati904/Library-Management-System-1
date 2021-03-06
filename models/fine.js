var mongoose = require("mongoose");
var FineSchema = new mongoose.Schema({
fine : {type:Number},
days : {type:Number},
});
module.exports = mongoose.model("Fine", FineSchema);
