const {MongoClient} = require('mongodb'); //destructured

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
    if(err){
        return console.log('mongo connection failed');
    }
    console.log('connected to mongoDB server');

    const db = client.db('TodoApp');    

    // db.collection('Todos').find({
    //     completed: false
    // }).toArray().then((docs) => {
    //     console.log('Todos:');
    //     console.log(JSON.stringify(docs, undefined, 2));
    // }, (err)=>{
    //     console.log('something went wrong', err);
    // });

    
    // db.collection('Todos').find().count().then((count) => {
    //     console.log('Number of Todos: ', count);
    // }, (err)=>{
    //     console.log('something went wrong', err);
    // });

    db.collection('Users').find({
        name: 'Daniel'
    }).toArray().then((docs) => {
        console.log('Users named daniel:');
        console.log(JSON.stringify(docs, undefined, 2));
    }, (err)=>{
        console.log('something went wrong', err);
    });

    client.close();
});