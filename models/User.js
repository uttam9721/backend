const mongoose = require('mongoose');

const userSchema= new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
        },
        name:{
            type:String,
            required:true,
            },
            cartItems:{
                type:Array,
                default:[
                   {
                     type:mongoose.Schema.Types.objectId,
                    ref:'food',
                },
                ],
            },
            otp:{
                type:Number,
                default:0,

            },

});
const User = mongoose.model('User', userSchema);
module.exports= User;