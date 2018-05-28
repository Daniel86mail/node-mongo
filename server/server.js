require('./config/config');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const _ = require('lodash');

const mongoose = require('./db/mongoose');
const {autenticate} = require('./middleware/autenticate');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

var app = express();
const port = process.env.PORT;

app.use(bodyParser.json())

app.post('/todos', (req, res)=>{
    var todo = new Todo({
        text: req.body.text
    });

    todo.save().then((doc)=>{
        res.send(doc);
    }, (e) =>{
        res.status(400).send(e);
    });
});

app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.send({
            todos
        });
    }, (e) => res.status(400).send(e));
});

app.get('/todos/:id', (req, res) => {
    var id = req.params.id;
    if(ObjectID.isValid(id)){
        Todo.findById(id).then((todo)=> {
            if(todo)
                res.send(todo);
            else
                res.status(404).send();
        }, (e) => res.status(400).send());
    }else{
        res.status(404).send();
    }
});

app.delete('/todos/:id', (req, res) => {
    var id = req.params.id;
    if(ObjectID.isValid(id)){
        Todo.findByIdAndRemove(id).then((todo)=> {
            if(todo)
                res.status(200).send(todo);
            else
                res.status(404).send();
        }, (e) => res.status(400).send());
    }else{
        res.status(404).send();
    }
});

app.patch('/todos/:id', (req, res) => {
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

    Todo.findByIdAndUpdate(id, {
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

app.post('/users', (req, res)=>{
    var body = _.pick(req.body, ['email', 'password']);
    var newUser = new User(body);
    newUser.save().then(()=>{
        return newUser.generateAuthToken();
    }).then((token)=>{
        res.header('x-auth', token).send(newUser);  //add custon auth header
    }).catch((e) =>{
        res.status(400).send(e);
    });
});

app.get('/users/me', autenticate, (req, res)=>{
    res.send(req.user);
});

app.listen(port, () => {
    console.log(`Started on port ${port}`);
});

module.exports = {app};