const mongoose = require('mongoose');
const {isEmail} = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const secret = process.env.JWT_SECRET;

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
    var token = jwt.sign({_id: user._id.toHexString(), access}, secret).toString();
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

 UserSchema.methods.removeToken = function(token){
    var user = this;
    return user.update({
        $pull:{ //this removes the entire object from the array
            tokens: {
                token
            }
        }
    });
 }

 UserSchema.statics.findByToken = function(token) {
    var User = this;
    var decoded;

    try{    
        decoded = jwt.verify(token, secret);
    }catch(e){
        return Promise.reject();
    }

    return User.findOne({
        '_id': decoded._id,
        'tokens.token': token, //query underliny properties
        'tokens.access': 'auth'
    });
 };

UserSchema.statics.findByCredentials = function(email, password){
    var User = this;
    return User.findOne({email}).then((user)=>{
        if(!user)
            return Promise.reject();
        return new Promise((resolve, reject)=>{
            bcrypt.compare(password, user.password, (err, res) => {
                if(err){
                    return reject(err);
                }
                if(res)
                    return resolve(user);
                else
                    return reject();
            });
        });
    });
};

 UserSchema.pre('save', function(next){
    var user = this;
    if(user.isModified('password')){
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash)=>{
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }

 });

var User = mongoose.model('User', UserSchema);

 module.exports = {User};