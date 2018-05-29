require('./config/config');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const _ = require('lodash');

const mongoose = require('./db/mongoose');
const {authenticate} = require('./middleware/authenticate');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

var app = express();
const port = process.env.PORT;

app.use(bodyParser.json())

app.post('/todos', authenticate, async (req, res)=>{
    var todo = new Todo({
        text: req.body.text,
        _creator: req.user._id
    });

    try{
        const doc = await todo.save();
        res.send(doc);
    } catch(e){
        res.status(400).send(e);
    }
});

app.get('/todos', authenticate, async (req, res) => {
    try{
        var todos = await Todo.find({
            _creator: req.user._id
        });
        res.send({ todos });        
    } catch(e){
        res.status(400).send(e);
    }
});

app.get('/todos/:id', authenticate, async (req, res) => {
    var id = req.params.id;
    if(ObjectID.isValid(id)){
        try{
            const todo = await Todo.findOne({
                _id: id,
                _creator: req.user.id
            });
            if(todo)
                res.send(todo);
            else
                res.status(404).send();
        } catch(e){
            res.status(400).send();
        }
    }
    else
        res.status(404).send();
});

app.delete('/todos/:id', authenticate, async (req, res) => {
    const id = req.params.id;
    if(ObjectID.isValid(id)){
        try{
            const todo = await Todo.findOneAndRemove({
                _id: id,
                _creator: req.user._id
            });
            if(todo)
                res.status(200).send(todo);
            else
                res.status(404).send();
        } catch(e){
            res.status(404).send();
        }
    } else{
        res.status(404).send();
    }
});

app.patch('/todos/:id', authenticate, (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['text', 'completed']);
    if(!ObjectID.isValid(id))
        return res.status(404).send();
        
    if(_.isBoolean(body.completed) && body.completed){
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    Todo.findOneAndUpdate({
        _id: id, 
        _creator: req.user._id
    }, {
        $set: body
    }, {
        new: true
    }).then((todo)=>{
        if(!todo){
            return res.status(404).send();
        }
        res.send({todo});
    }).catch((err)=> {
        res.status(400).send();
    });
});

app.post('/users', async (req, res)=>{
    var body = _.pick(req.body, ['email', 'password']);
    var newUser = new User(body);
    try{
        await newUser.save()
        var token = await newUser.generateAuthToken();
        res.header('x-auth', token).send(newUser);  //add custon auth header
    } catch(e){
        res.status(400).send(e);
    }
});

app.get('/users/me', authenticate, (req, res)=>{
    res.send(req.user);
});

app.post('/users/login', async (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    try{
        var user = await User.findByCredentials(body.email, body.password);
        if(user){
            var token = await user.generateAuthToken();
            res.header('x-auth', token).send(user);  //add custon auth header
        }
    } catch(err){
        res.status(400).send('email/password combo does not exist');
    };
});

app.delete('/users/me/token', authenticate, async (req, res) =>{
    try{
        await req.user.removeToken(req.token);
        res.send('User logged out');
    } catch(e){
        res.status(400).send();
    }
});

app.listen(port, () => {
    console.log(`Started on port ${port}`);
});

module.exports = {app};