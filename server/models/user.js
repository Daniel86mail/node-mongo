const mongoose = require('mongoose');

var User = mongoose.model('User', {
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
    } 
 });
 
 var newUser = new User({
     email: 'a@b.com '
 });

 module.exports = {User};