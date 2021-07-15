const bodyParser = require('body-parser');
var express = require('express');
var app=express();
var session=require('express-session');
const storecontroller = require('./controller/storecontroller');

app.get('/',function(req,res){ //entry point of website
res.render('login',{udata:""});
});

//to setup a template engine
app.set('view engine','ejs');

app.use(session({
    secret : 'nothing',
    resave : true,
    saveUninitialized: true
}));
//to access all static files
app.use(express.static('./public'));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
//app.use(express.static(__dirname + '/public'))
//controller to control routing
storecontroller(app);
//to listen all request on specific port
app.listen(3000,function(){
console.log('House Store Website is listening on port: 3000');
});
