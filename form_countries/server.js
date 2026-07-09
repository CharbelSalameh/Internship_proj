const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.set('views',__dirname);//to use the ejs files in the folder

app.use(express.static(__dirname));//to use the static files in the folder
//get used when the user wants to get something from the server

app.get('/',function(req,res){
    res.sendFile(__dirname + '/index.html');
});

app.get('/countries',function(req,res){
    res.sendFile(__dirname+ '/countries.html');
});
app.get('/profile/:name',function(req,res){
    res.render('profile', { personName: req.params.name });
});
app.get('/profile',function(req,res){
    res.render('profile', { personName: 'Anonymous' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, function() {
    console.log("Server running on port " + PORT);
});
