const {MongoClient, ObjectID} = require('mongodb'); //destructured

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
    if(err){
        return console.log('mongo connection failed');
    }
    console.log('connected to mongoDB server');

    const db = client.db('TodoApp');

    // db.collection('Todos').insertOne({
    //     text: 'something to do',
    //     completed: false
    // }, (err, result) => {
    //     if(err){
    //         return console.log('unalbe to inser todo', err);
    //     }

    //     console.log(JSON.stringify(result.ops, undefined, 2));
    // });

    db.collection('Users').insertOne({
        name: 'Daniel',
        age: 31,
        location: 'Israel'
    }, (err, result) => {
        if(err){
            return console.log('unalbe to inser todo', err);
        }

        console.log(JSON.stringify(result.ops[0], undefined, 2));
        console.log(result.ops[0]._id.getTimestamp());
    });

    client.close();
});