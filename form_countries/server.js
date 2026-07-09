https://github.com/CharbelSalameh/Internship_proj.gitlet 
const express = require('express');
const app = express();

app.set('view engine','ejs');//to use the ejs files in the folder
app.use(express.static(__dirname));//to use the static files in the folder
//get used when the user wants to get something from the server
app.get('/',function(req,res){
    res.sendFile(__dirname + '/index.html');
});

app.get('/countries',function(req,res){
    res.sendFile(__dirname+ '/countries.html');
});
app.get('/profile/:name',function(req,res){
    res.render(__dirname+ '/profile', { personName: req.params.name });
});
app.get('/profile',function(req,res){
    res.render(__dirname+ '/profile', { personName: 'Anonymous' });
});

app.listen(3000);//listen to a port
