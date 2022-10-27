// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for examples
const Charac = require('../models/character')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { example: { title: '', text: 'foo' } } -> { example: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// Index
// /pets
router.get('/characs', requireToken, (req, res, next) => {
    Charac.find()
        .then(characs => {
            return characs.map(charac => charac)
        })
        .then(characs =>  {
            res.status(200).json({ characs: characs })
        })
        .catch(next)
})

//Show
// /pets/:id
router.get('/characs/:id', requireToken, (req, res, next) => {
    Charac.findById(req.params.id)
    .then(handle404)
    .then(charac => {
        res.status(200).json({ charac: charac })
    })
    .catch(next)

})

// Create
// /pets
router.post('/characs', requireToken, (req, res, next) => {
    req.body.charac.owner = req.user.id

    // one the front end I HAVE TO SEND a pet as the top level key
    // pet: {name: '', type: ''}
    Charac.create(req.body.charac)
    .then(charac => {
        res.status(201).json({ charac: charac })
    })
    .catch(next)
    // .catch(error => next(error))

})

// Update
// /pets/:id
router.patch('/characs/:id', requireToken, removeBlanks, (req, res, next) => {
    delete req.body.charac.owner

    Charac.findById(req.params.id)
    .then(handle404)
    .then(charac => {
        // requireOwnership(req, charac)

        return charac.updateOne(req.body.charac)
    })
    .then(() => res.sendStatus(204))
    .catch(next)

})

router.delete('/characs/:id', requireToken, removeBlanks, (req, res, next) => {

    Charac.findByIdAndDelete(req.params.id, function (err, docs) {
        if (err){
            console.log(err)
        }
        else{
            console.log("Deleted : ", docs);
            res.status(201).json({})
        }
    });

})






module.exports = router