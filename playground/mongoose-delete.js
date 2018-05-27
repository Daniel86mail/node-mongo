const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');


//Todo.remove({}) - like find (no doc returned)
Todo.remove({}).then((result)=>{
    console.log(result); 
});

//Todo.findOneAndRemove({}) - like find (doc is returned), note the query object
//Todo.findByIdAndRemove - like findById (doc is returned)
Todo.findByIdAndRemove('SomeID').then((todo) => {
    console.log(todo);
});