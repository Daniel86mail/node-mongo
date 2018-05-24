const {MongoClient} = require('mongodb'); //destructured

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
    if(err){
        return console.log('mongo connection failed');
    }
    console.log('connected to mongoDB server');

    const db = client.db('TodoApp');    

    //deleteMany
    // db.collection('Todos').deleteMany({text: 'do more stuff'}).then((result) => {
    //     console.log(result);
    // });

    //deleteOne
    // db.collection('Todos').deleteOne({text: 'do more stuff'}).then((result) => {
    //     console.log(result);
    // });

    //findOneAndDelete
    // db.collection('Todos').findOneAndDelete({text: 'do more stuff'}).then((doc) => {
    //     console.log('deleting', doc);
    // });

    db.collection('Users').deleteOne({name: 'Daniel'}).then((result) => {
        console.log(result);
    });

    client.close();
});