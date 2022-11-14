const mongoose = require('mongoose');
const mongoURI = "mongodb+srv://aayush376:GanduGoogle@inotebook.iru2xqe.mongodb.net/?retryWrites=true&w=majority"


const connectToMongo =()=> {
    mongoose.connect(mongoURI, ()=>
    {
        console.log("connected to mongose")
    })
}

module.exports = connectToMongo;