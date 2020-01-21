const express = require('express');
const Task = require('../models/task');
const auth = require('../../middlware/auth');
const router = new express.Router();

router.post('/task', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    });
    try{
        await task.save();
        res.status(201).send(task);    
    } catch(error) {
        res.status(400);
        res.send(error.message);
    };
});

// GET: /tasks?completed=true
// GET: /tasks?limit=2&skip=1
// GET: /tasks?sortBy=createdAt:desc or :desc
router.get('/tasks', auth, async (req, res) => {

    const match = {};
    const sort = {};

    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
     }
    try{
        await req.user.populate({ 
            path: 'tasks',
            match, 
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        const tasks = req.user.tasks;
        
        if(!tasks){
            res.status(404).send();
        }
        res.send(tasks);
    }catch(error) {
        res.status(500).send(error.message);
    }
});

router.get('/task/:id', auth, async (req, res) => {
    const _id = req.params.id;
    try{
        const task = await Task.findOne({ _id, owner: req.user._id })

        if(!task){
            res.status(404).send();
        }
        res.send(task);
    } catch(error) {
        res.status(500).send(error.message);
    }
});

router.patch('/task/:id', auth, async (req, res) => {
    console.log(req);
    const newBody = req.body;
    const updates = Object.keys(newBody);
    const allowedUpdates = ['description', 'completed'];
    const isValidOperation = updates.every(updateItem => allowedUpdates.includes(updateItem));

    if(!isValidOperation){
        return res.status(400).send({ error: 'Invalid parameters for update' });
    }
    try{
        
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id } );
        
        if(!task){
            return res.status(404).send();
        }

        updates.forEach((update) => task[update] = req.body[update]);
        await task.save();
        
        res.send(task);
    } catch(error) {
        res.status(400).send(error.message);
    }
});

router.delete('/task/:id', auth, async (req, res) => {
    try{    
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
        if(!task){
            res.status(404).send();
        }
        res.send(task);
    } catch(error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;