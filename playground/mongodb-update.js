const {MongoClient} = require('mongodb'); //destructured

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
    if(err){
        return console.log('mongo connection failed');
    }
    console.log('connected to mongoDB server');

    const db = client.db('TodoApp');    

    // db.collection('Todos').findOneAndUpdate({
    //     text: 'something to do'
    // }, {$set: {
    //     text: 'something else to do',
    //     completed: true
    // }}, {
    //     returnOriginal: false
    // }).then((result)=>{
    //     console.log(result);
    // });

    db.collection('Users').findOneAndUpdate({
        name: 'Moosh'
    }, { $set: {
        name: 'Daniel'
    }, $inc: {
        age: 1
    }}, {
        returnOriginal: false
    }).then((result)=>{
        console.log(result);
    });

    client.close();
});