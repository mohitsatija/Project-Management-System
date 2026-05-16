const mongoose = require('mongoose');

const userSchema= new mongoose.Schema({
    name:{type:String, required:true},
    email:{type:String, required:true, unique:true},
    password:{type:String, required:true},
    profileImageUrl:{type:String, default:"https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp"},
    role:{type:String, default:"member", enum:["member", "manager","supervisor"]},
},
{timestamps:true}
);

module.exports = mongoose.model('User', userSchema);