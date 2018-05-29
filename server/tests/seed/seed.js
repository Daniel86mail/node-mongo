const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');

var userOneId = new ObjectID();
var userTwoId = new ObjectID();
var secret = process.env.JWT_SECRET;

const  todos = [{
    _id: new ObjectID(),
    text: 'first',
    _creator: userOneId
},{
    _id: new ObjectID(),
    text: 'second',
    completed: true,
    completedAt: 333,
    _creator: userTwoId
}];

const users = [{
    _id: userOneId,
    email: 'daniel@ex.com',
    password: 'user1Pass',
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userOneId, access: 'auth'}, secret).toString()
    }]
}, {
    _id: userTwoId,
    email: 'other@ex.com',
    password: 'user2Pass',
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userTwoId, access: 'auth'}, secret).toString()
    }]
}]

const populateTodos = (done)=>{
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos);
    }).then(() => done());
};

const populateUsers = (done) => {
    User.remove({}).then(()=>{
        var userOne = new User(users[0]).save();
        var userTwo = new User(users[1]).save();

        return Promise.all([userOne, userTwo]);
    }).then(() => {
        done();
    });
}

module.exports = {todos, populateTodos, users, populateUsers};