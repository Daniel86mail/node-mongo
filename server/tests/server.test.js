const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');

beforeEach(populateTodos);
beforeEach(populateUsers);

describe('Server', () => {
    describe('POST /todos', () => {
        it('should create a new todo', (done)=>{
            var text = 'test todo';
            request(app)
            .post('/todos')
            .send({
                text
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res)=>{
                if(err)
                    return done(err);
                Todo.find({text}).then((todos) => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch((e) => done(e));
            });
        });
        it('should not create todo with invalid', (done)=>{
            request(app)
            .post('/todos')
            .send({
            })
            .expect(400)
            .end((err, res)=>{
                if(err)
                    return done(err);
                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2);
                    done();
                }).catch((e) => done(e));
            });
        });
    });
    describe('GET /todos', ()=>{
        it('should fetch todos if any', (done)=>{
            request(app)
            .get('/todos')
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(2);
            })
            .end(done);
        });
    });
    describe('GET /todos/:id', ()=>{
        it('should fetch todo when id is valid', (done)=>{
            request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(todos[0].text);
            })
            .end(done);
        });
        it('should return 404 when id is not valid', (done)=>{
            request(app)
            .get(`/todos/${todos[0]._id.toHexString()+1}`)
            .expect(404)
            .end(done);
        });
        it('should return 404 when id is not found', (done)=>{
            request(app)
            .get(`/todos/${new ObjectID().toHexString()}`)
            .expect(404)
            .end(done);
        });
    });
    describe('Delete /todos/:id', () => {
        it('should remove todo', (done) => {
            request(app)
            .delete(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res)=>{
                expect(res.body.text).toBe(todos[0].text);
            })
            .end((err, res) => {
                if(err) {
                    return done(err);
                }
                Todo.findById(todos[0]._id.toHexString()).then((todo) => {
                    expect(todo).toNotExist();
                    done();
                }).catch((e) => done(e));
            });
        });
        it('should return 404 if id not found', (done) => {
            request(app)
            .delete(`/todos/${todos[0]._id.toHexString()+1}`)
            .expect(404)
            .end(done);
        });
        it('should return 404 if id is invalid', (done) => {
            request(app)
            .delete(`/todos/123456`)
            .expect(404)
            .end(done);
        });
    });
    describe('PATCH /todos/:id', () => {
        it('should updated the todo', (done) => {
            var hexId = todos[0]._id.toHexString();
            var updatedData = {
                text: 'Updated from test',
                completed: true
            };
            request(app)
            .patch(`/todos/${hexId}`)
            .send(updatedData)
            .expect(200)
            .expect((res)=>{
                expect(res.body.todo.text).toBe(updatedData.text);
                expect(res.body.todo.completed).toBeTruthy();
                expect(res.body.todo.completedAt).toExist().toBeA('number');
            })
            .end(done);
        });
        it('should clear completedAt when todo is not completed', (done)=>{
            var hexId = todos[1]._id.toHexString();
            var updatedData = {
                text: 'Updated from test',
                completed: false
            };
            request(app)
            .patch(`/todos/${hexId}`)
            .send(updatedData)
            .expect(200)
            .expect((res)=>{
                expect(res.body.todo.text).toBe(updatedData.text);
                expect(res.body.todo.completed).toBeFalsy();
                expect(res.body.todo.completedAt).toNotExist();
            })
            .end(done);
        });
    });
    describe('GET /users/me', () => {
        it('should return user when autenticated', (done) =>{
            request(app)
            .get('/users/me')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.email).toBe(users[0].email);
            })
            .end(done);
        });
        it('should return a 401 when not authenticated', (done)=>{
            request(app)
            .get('/users/me')
            .set('x-auth', 'asdasdasdascasdasd')
            .expect(401)
            .expect((res)=>{
                expect(res.body).toEqual({});
            })
            .end(done);
        });
    });
    describe('POST /users', () => {
        it('should create a user', (done)=>{
            var newUser = {email: 'newemail@mail.com', password: '123456ABC'};
            request(app)
            .post('/users')
            .send(newUser)
            .expect(200)
            .expect((res)=>{
                expect(res.body.email).toBe(newUser.email);
                expect(res.body._id).toExist();
                expect(res.header['x-auth']).toExist();
            })
            .end((err)=>{
                if(err){
                    return done(err);
                }
                User.findOne({email: newUser.email}).then((user)=>{
                    expect(user).toExist();
                    done();
                });
            });


        });
        it('should return validation error when input is invalid', (done)=>{
            var newUser = {email: 'newemail', password: '123'};
            request(app)
            .post('/users')
            .send(newUser)
            .expect(400)
            .expect((res)=>{
                expect(res.body.errors.email.message).toBe('that is not a valid email');
            })
            .end(done);



        });
        it('should not create user when email in use', (done)=>{
            var newUser = {email: users[0].email, password: '123456ABC'};
            request(app)
            .post('/users')
            .send(newUser)
            .expect(400)
            .end(done);
        });
    });
    describe('POST /users/login', ()=>{
        it('should login user and return auth token', (done)=>{
            request(app)
            .post('/users/login')
            .send({
                email: users[1].email,
                password: users[1].password
            })
            .expect(200)
            .expect((res)=>{
                expect(res.headers['x-auth']).toExist();
            })
            .end((err, res)=>{
                if(err)
                    done(err);
                else{
                    User.findById(users[1]._id).then((user)=>{
                        expect(user.tokens[0]).toInclude({
                            access: 'auth',
                            token: res.headers['x-auth']
                        });
                        done();
                    }).catch((e)=>{
                        done(e);
                    });
                }
            });
        });
        it('should reject invalid login', (done)=>{
            request(app)
            .post('/users/login')
            .send({
                email: users[1].email,
                password: users[1].password+123
            })
            .expect(400)
            .expect((res)=>{
                expect(res.headers['x-auth']).toNotExist();
            })
            .end((err, res)=>{
                if(err)
                    done(err);
                else{
                    User.findById(users[1]._id).then((user)=>{
                        expect(user.tokens.length).toBe(0);
                        done();
                    }).catch((e)=>{
                        done(e);
                    });
                }
            });
        });
    });
});