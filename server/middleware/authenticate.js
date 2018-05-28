var {User} = require('./../models/user');

var authenticate = (req, res, next)=>{
    var token = req.header('x-auth');
    User.findByToken(token).then((user)=>{
        if(!user){
            return Promise.reject(); //this will fire the error case and also cause a 401 (auth error)
        }
        req.user = user;
        req.token = token;
        next();
    }).catch((e)=>{
        res.status(401).send();
    });
};

module.exports = {authenticate};