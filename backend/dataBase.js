require("dotenv").config();

const { MongoClient } = require("mongodb");

let dbConnection;

const url = process.env.MONGODB_URI;

module.exports={
    connectToDb:(cb)=>{
        MongoClient.connect(url)
        .then((client)=>{
            dbConnection = client.db();
           return cb();
        })
        .catch(err=>{
            console.log(err);
            return cb(err);
        })},

    getDB:()=>dbConnection    

}
