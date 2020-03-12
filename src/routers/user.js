const express = require('express');
const User = require('../models/user');
const router = new express.Router();
const auth = require('../../middlware/auth.js');

router.post('/user', async (req, res) => {
    const user = new User(req.body);
    try{
        await user.save();
        const token = await user.createNewToken();
        res.status(201).send({ user, token });
    } catch (error) {
        res.status(400);
        res.send(error);
    }
});

router.post('/user/login', async (req, res) => {
    try {
        const user = await User.findByCredantials(req.body.email, req.body.password );
        const token = await user.createNewToken();
        res.send({ user: user, token });

    } catch (error) {
        res.status(400).send(error);
    }
});

router.post('/user/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });
        await req.user.save();
        res.send("You have logged out!")
    } catch (error) {
        res.status(500).send(error)
    } 
})

router.post('/user/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.status(200).send("You have logged out of all devices");
    } catch (error) {
        res.status(500).send(error);
    }
})

router.get('/user/profile', auth, async (req, res) => {
    res.send(req.user);
});

router.get('/users/with/name/:name', async (req, res) => {
    const name = req.params.name;
    try{
        const users = await User.find({ name: name });
        if(!users){
            return res.status(404).send();
        }
        res.send(users);
    } catch(error) {
        res.status(500).send(error);
    }
});

router.get('/users/with/age/:age', async (req, res) => {
    const age = req.params.age;
    try {
        const users = await User.find( { age:age } );
        if(!users){
            return res.status(404).send();
        }
        res.send(users);
    } catch(error) {
        res.status(500).send(error);
    };
});

router.get('/users/with/name/:name/age/:age', async (req, res) => {
    const name = req.params.name;
    const age = req.params.age;

    try{
        const users = await User.find({ name:name, age:age });
        if(!users){
            return res.status(404).send();
        }
        res.send(users);
    }catch(error) {
        res.status(500).send(error);
    };
});

router.patch('/user/profile', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'password', 'email', 'age'];
    const isValidOperation = updates.every(updateItem => allowedUpdates.includes(updateItem));
    
    if(!isValidOperation){
        return res.status(400).send({ error: 'Invalid parameters for update!' })
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update]);
        await req.user.save();
        res.send(req.user);

    } catch (error) {
        res.status(400).send(error);
    }
});

router.delete('/user/profile', auth, async (req, res) => {
    try{
        await req.user.remove();
        res.send(req.user);
    } catch (error) {
        res.status(500).send(error);
    }
});


module.exports = router;