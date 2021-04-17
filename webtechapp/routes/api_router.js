const express = require("express");
const dbHandler = require("../database/quizDB_handler");
var bodyParser = require("body-parser");
const apiError = require("../error/api_error");
var session = require('express-session');
var sqlsession = require('session-file-store')(session);
const { 
    v1: uuidv1,
    v4: uuidv4,
  } = require('uuid');

var options = {
    store: new sqlsession(),
    genid: function(req){
        return uuidv4();
    },
    cookie: {
        path: "/",
        httpOnly: true,
        maxAge: 60*60*24*365
    },
    name: "webtechG31.sid",
    secret: "my secret"
};

var router = express.Router();
router.use(bodyParser.json());

router.use(session(options));
var currentSession;

router.get("/" , function (req, res, next){
    currentSession = req.session;
    if(currentSession.id) 
    {
       console.log(currentSession);
    }
    else 
    {
       console.log("no sessions");
    }

    next();
});

router.get("/gettopics.js", function (req, res, next){
    res.contentType('application/json');
    var sql = "SELECT TopicID as tid, Title FROM Topic";

    dbHandler.getQuizData(sql, [], next, function(data){
        console.log("send data...", data);
        res.status(200).json({dbData:  data});
    });
});

router.get("/getQuiz.js", function (req, res, next){
    res.contentType('application/json');
    let topicID = req.query.topicID;
    var sql =  "SELECT * FROM quiz WHERE topicID=?";

    dbHandler.getQuizData(sql, [topicID], next, function(data){
        console.log("send data...", data);
        res.status(200).json({dbData:  data});
    });
});

router.get("/getQuestion.js", function (req, res, next){
    res.contentType('application/json');
    let quizID = req.query.quizID;
    var sql = "SELECT * FROM Question WHERE quizID=?";

    dbHandler.getQuizData(sql, [quizID], next, function(data){
        console.log("send data...", data);
        res.status(200).json({dbData:  data});
    });
   
});

router.get("/getOptions.js", function (req, res, next){
    res.contentType('application/json');
    let questionID = req.query.questionID;
    var sql = "SELECT * FROM Option WHERE QuestionID=?";

    dbHandler.getQuizData(sql, [questionID], next, function(data){
        console.log("send data...", data);
        res.status(200).json({dbData:  data});
    });
   
});

router.get("/getAnswer.js", function (req, res, next){
    res.contentType('application/json');
    let questionID = req.query.questionID;
    var sql =  ("SELECT * FROM Option WHERE Is_correct = true AND QuestionID=?");

    dbHandler.getQuizData(sql, [questionID], next, function(data){
        console.log("send data...", data);
        res.status(200).json({dbData:  data});
    });
   
});

router.get("/checkUserAnswered.js", function (req, res, next){
    res.contentType('application/json');
    let questionID = req.query.questionID;
    let userID = req.query.userID;
    console.log(questionID, userID);
    var sql =  "SELECT EXISTS (SELECT * FROM UserAnswer WHERE QuestionID =? AND UserID =?) AS bool";
    
    dbHandler.getQuizData(sql, [questionID, userID], next, function(data){
        console.log("send data...", data);
        res.status(200).json({dbData:  data});
    });
   
});

router.get("/getUserAnswer.js", function (req, res, next){
    var values = [req.query.userID, req.query.questionID];
    var sql = "SELECT OptionID, Is_correct FROM Option WHERE OptionID IN (SELECT OptionID FROM UserAnswer WHERE UserID =? AND QuestionID =?)";
    
    dbHandler.getQuizData(sql, values, next, function(data){
        console.log("send data...", data);
        res.status(200).json({dbData:  data});
    })
});

router.get("/getFillUserAnswer.js", function (req, res, next){
    var values = [req.query.userID, req.query.questionID];
    console.log(values);
    var sql = "SELECT OptionID, Option FROM UserAnswer WHERE UserID=? AND QuestionID=?";
    
    dbHandler.getQuizData(sql, values, next, function(data){
        console.log("send data...", data);
        res.status(200).json({dbData:  data});
    })
});

router.get("/getQuizResults", function (req, res, next){
    var values = [req.query.userID, req.query.quizID];
    console.log("values..", values)
    var sql = "SELECT OptionID, Is_correct FROM Option WHERE OptionID IN (SELECT OptionID FROM UserAnswer WHERE UserID =? AND QuestionID IN (SELECT QuestionID FROM Question WHERE QuizID =?))";
    
    dbHandler.getQuizData(sql, values, next, function(data){
        console.log("send data...", data);
        res.status(200).json({dbData:  data});
    })
});

router.post("/storeUserAnswer.js", function (req, res, next){
    currentSession = req.session;

    console.log("store answer:", req.body);
    var values = [req.body.QuestionID, req.body.optionID, req.body.userID, req.body.option];
    var sql = "INSERT INTO UserAnswer (QuestionID, OptionID, UserID, Option) VALUES (?, ?, ?, ?)";
    
    dbHandler.storeQuizData(sql, values, next, function(){
        res.send(200, "answer stored");
    })
});

router.put('/', function (req, res) {
    res.send(200, 'Got a PUT request at /user')
});

router.delete('/', function (req, res) {
    res.send('Got a DELETE request at /user')
});

module.exports = router;