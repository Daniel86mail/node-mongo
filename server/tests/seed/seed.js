const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');

const  todos = [{
    _id: new ObjectID(),
    text: 'first'
},{
    _id: new ObjectID(),
    text: 'second',
    completed: true,
    completedAt: 333
}];

var userOneId = new ObjectID();
var userTwoId = new ObjectID();
const users = [{
    _id: userOneId,
    email: 'daniel@ex.com',
    password: 'user1Pass',
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userOneId, access: 'auth'}, 'abc123').toString()
    }]
}, {
    _id: userTwoId,
    email: 'other@ex.com',
    password: 'user2Pass',
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