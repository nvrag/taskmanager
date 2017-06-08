const express = require('express');
const router = express.Router();

// Bring in Task Model
let Task = require('../models/task');
// Bring in User Model
let User = require('../models/user');

//Tasks Route
router.get('/', ensureAuthenticated, function (req, res) {
    Task.find({}, function (err, tasks) {
        if(err){
            console.log(err);
        }else{
            res.render('tasks', {
                title: 'Tasks',
                tasks: tasks
            });
        }
    });
});

//Add Route
router.get('/add', ensureAuthenticated, function (req, res) {
    res.render('add-task');
});

// Add Submit POST Route
router.post('/add', ensureAuthenticated, function (req, res) {
    req.checkBody('title', 'Title can\'t be empty ').notEmpty();
    req.checkBody('body', 'Body can\'t be empty ').notEmpty();

    // errors
    let errors = req.validationErrors();

    if (errors) {
        res.render('add-task', {
            errors:errors
        });
    }else {
        let task = new Task();
        task.title = req.body.title;
        task.author = req.user._id;
        task.body = req.body.body;
        task.for = req.body.for;

        task.save(function (err) {
            if (err) {
                console.log(err);
                return;
            } else {
                req.flash('success', 'New task added');
                res.redirect('/');
            }
        });
    }
});

// Edit Task
router.get('/edit/:id', ensureAuthenticated, function (req, res) {
    Task.findById(req.params.id, function (err, task) {
        if(task.author != req.user._id){
            req.flash('danger', 'Not Authorized');
            res.redirect('/');
        }
        res.render('edit-task', {
            task:task
        });
    });
});

// Update Task
router.post('/edit/:id', ensureAuthenticated, function (req, res) {
    let task = {};
    task.title = req.body.title;
    // task.author = req.user._id;
    task.body = req.body.body;
    task.for = req.body.for;

    let query = {_id:req.params.id}

    Task.update(query, task, function (err) {
        if (err) {
            console.log(err);
            return;
        } else {
            req.flash('success', 'Task updated');
            res.redirect('/tasks');
        }
    });
});

// Delete Task
router.delete('/:id', function (req, res) {
    if(!req.user._id){
      res.status(500).send();
    }

    let query = {_id:req.params.id}

    Task.findById(req.params.id, function(err, task){
      if(task.author != req.user._id){
        res.status(500).send();
      } else {
        Task.remove(query, function (err) {
            if(err){
                console.log(err);
            }
            res.send('Success');
        });
      }
    });
  });

// Get Single Article
router.get('/:id', ensureAuthenticated, function(req, res){
  Task.findById(req.params.id, function(err, task){
    User.findById(task.author, function(err, user){
      res.render('task', {
        task:task,
        author: user.name
      });
    });
  });
});

// Access Control
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()){
        return next();
    } else {
        req.flash('danger', 'Please login');
        res.redirect('/users/login');
    }
}

module.exports = router;
