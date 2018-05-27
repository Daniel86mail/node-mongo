const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const todos = [{
    _id: new ObjectID(),
    text: 'first'
},{
    _id: new ObjectID(),
    text: 'second',
    completed: true,
    completedAt: 333
}];

beforeEach((done)=>{
    Todo.remove({}).then(() => {
        Todo.insertMany(todos);
    }).then(() => done());
});

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
});