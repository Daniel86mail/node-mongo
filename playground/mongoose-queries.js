const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');


var todoid = '5b06cc205d7132346c700f3b11';
var userId = '5b06b9c4c53a6046b87eb3ce';
// Todo.find({
//     _id: id
// }).then((todos)=>{
//     console.log('todos', todos);
// });

// Todo.findOne({
//     _id: id
// }).then((todo)=>{
//     console.log('todo', todo);
// });

// if(ObjectID.isValid(id)){
//     Todo.findById(id).then((todo)=>{
//         if(!todo)
//             return console.log('id not found');
//         console.log('todo by id', todo);
//     }).catch((e)=>{
//         console.log(e);
//     });
// }else{
//     console.log('id not valid');
// }

if(ObjectID.isValid(userId)){
        User.findById(userId).then((user)=>{
            if(!user)
                return console.log('user not found');
            console.log('user by id', userId);
        }).catch((e)=>{
            console.log(e);
        });
    }else{
        console.log('user id not valid');
    }

