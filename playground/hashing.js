const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

var password = '123456ABC';

bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash)=>{
        console.log(hash);
    });
});

var hasedPassword = '$2a$10$voM/W2R5cxlCmlQ6DiPdSOgBGiRjlFLmdWl9.zLDte9IWQlSzg9Ua';

bcrypt.compare(password, hasedPassword, (err, res) => {
    console.log(res);
});


// var data = {
//     id: 10
// };


// var token = jwt.sign(data, '123abc');
// console.log(token);

// var decoded = jwt.verify(token, '123abc');
// console.log(decoded);
// var message = 'I am user number 3';
// var hash = SHA256(message).toString();

// console.log(`message ${message}`);
// console.log(`hash ${hash}`);

// var data = {
//     id: 4 
// };

// var token = {
//     data,
//     hash: SHA256(JSON.stringify(data) + 'somesecret').toString() //we add somesecret to salt that hash
// };

// var resultHash = SHA256(JSON.stringify(token.data) + 'somesecret').toString();

// token.data.id = 5;
// token.hash = SHA256(JSON.stringify(token.data)).toString(); //no salt

// if(resultHash === token.hash) {
//     console.log('Data was not changed');
// } else {
//     console.log('Data was Changed');
// }
