const express = require('express');

const mongodb=require("mongodb");
const app = express();

let bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(express.static('views'));
app.use(express.static('css'));
app.use(express.static('img'));

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
const MongoClient=mongodb.MongoClient;
// Connection URL

const url="mongodb://localhost:27017/";
//reference to the database (i.e. collection)
let db;
let col1
//Connect to mongoDB server
MongoClient.connect(url,{useNewUrlParser:true},
    function(err,client){
        if (err){
            console.log("Err",err);
        }else{
            console.log("Connect sucessuflly to server");
            db=client.db("fit2095db");   
            coll=db.collection('tasks');
        }
    })



let viewPath = __dirname + "/views/";
app.get('/', function (req, res) {
    let fileName = viewPath + "index.html";
    res.sendFile(fileName);

});
app.get('/addNewTask',function(req,res){
    let fileName=viewPath+'addNewTask.html';
    res.sendFile(fileName);
});
app.post('/newTask', function (req, res) {
    let taskDetails = req.body;
    let taskId=Math.floor(Math.random() * 100000);
    coll.insertOne({taskId:taskId,taskName:taskDetails.taskName,
        assignTo:taskDetails.assignTo,dueDate:taskDetails.dueDate,
        taskStatus:taskDetails.taskStatus,taskDescription:taskDetails.taskDescription});

    res.redirect('listTasks');
    //res.send("you have added a task");
    //
});
//Update a task: 
app.get('/updateatask', function (req, res) {
    res.sendFile(viewPath + 'updateatask.html');
});
app.post('/updateatask', function (req, res) {
    let newStatus = {taskStatus:req.body.taskStatus};
    console.log(newStatus)
    let filter = { taskId: parseInt(req.body.taskId) };
    
    coll.updateOne(filter, {$set: newStatus},{upsert:true},function(err,result){
        res.redirect('listTasks');
    });

    
    
})
//list all tasks
app.get('/listTasks', function (req, res) {
    coll.find({}).toArray(function (err, data) {
        res.render('listTasks', { taskDb: data });
    });
});

//delete a task:
app.get('/deleteatask', function (req, res) {
    res.sendFile(viewPath+'deleteatask.html');
});
//post
app.post('/deleteatask', function (req, res) {
    let deleteDetails = req.body;
    let filter = { taskId: parseInt(deleteDetails.taskId) };
    coll.deleteOne(filter);
    res.redirect('/listTasks');// redirect the client to list users page
});

app.get('/deleteOldcomplete', function (req, res) {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = yyyy+'-'+ mm + '-' + dd;  
    let filter = { $and:[{taskStatus: 'complete'},{dueDate:{ $lt: today }}] };
    coll.deleteMany(filter,function(err,obj){

    });
    res.redirect('/listTasks');
});
app.listen(8085);




