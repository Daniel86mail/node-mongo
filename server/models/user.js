const mongoose = require('mongoose');
const {isEmail} = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        unique: true,
        validate: {
            validator: (value) => isEmail(value),
            message : 'that is not a valid email'
        }
    } ,
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
 });

 UserSchema.methods.toJSON = function(){ //override the default toJSON method
    var user = this;
    var userObject = user.toObject();

    return _.pick(userObject, ['_id', 'email']);
 };

 UserSchema.methods.generateAuthToken = function(){ //we are not using an arrow function because we are using this
    var user = this;
    var access = 'auth';
    var token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString();
    user.tokens = user.tokens.concat([{
      access,
      token  
    }]);
    return user.save().then(()=>{
        return token;
    }).catch((e) => {
        console.log('could not save user', e);
        throw new Error(e);
    });
 }

var User = mongoose.model('User', UserSchema);

 module.exports = {User};