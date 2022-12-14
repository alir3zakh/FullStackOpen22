require('dotenv').config()

const express = require('express')
const app = express()

// const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

app.use(express.static('build'))

app.use(cors())
app.use(express.json())

// morgan middleware is used for logging
// app.use(morgan(function (tokens, req, res) {
//     return [
//         tokens.method(req, res),
//         tokens.url(req, res),
//         tokens.status(req, res),
//         tokens.res(req, res, 'content-length'), '-',
//         tokens['res-time'](req, res), 'ms',
//         tokens.method(req, res) === 'POST'
//             ? JSON.stringify(req.body) : '',
//     ].join(' ')
// }))

const baseURL = '/api/persons/'
const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})


app.get('/info', (req, res) => {
    Person.countDocuments({}, (err, docCount) => {
        const info = `<p>Phonebook has info for ${docCount} people</p>`
        const date = `<p>${new Date()}</p>`
        res.send(info + date)
    })
})


app.get(baseURL, (req, res, next) => {
    Person.find({})
        .then(result => res.json(result))
        .catch(err => next(err))
})


app.get(`${baseURL}:id`, (req, res, next) => {
    Person.findById(req.params.id)
        .then(person => res.json(person))
        .catch(err => next(err))
})


app.delete(`${baseURL}:id`, (req, res, next) => {
    Person.findByIdAndRemove(req.params.id)
        .then(result => res.status(204).end())
        .catch(err => next(err))
})


app.post(baseURL, (req, res, next) => {
    const body = req.body

    const newPerson = new Person({
        name: body.name,
        number: body.number,
    })

    newPerson.save()
        .then(saved_person => res.json(saved_person))
        .catch(err => next(err))
})


app.put(`${baseURL}:id`, (req, res, next) => {
    const { name, number } = req.body

    Person.findByIdAndUpdate(
        req.params.id,
        { name, number },
        { new: true, runValidators: true, context: 'query' })
        .then(updatedPerson => res.json(updatedPerson))
        .catch(err => next(err))
})


// request handler for unknown endpoint
// ** HAS TO BE NEXT TO LAST
app.use((req, res) => {
    res.status(404).send({ error: 'unknown endpoint' })
})

// error handler
// ** HAS TO BE LAST
app.use((err, req, res, next) => {
    console.log(err.message)

    if (err.name === 'CastError') {
        return res.status(400).send({ error: 'malformatted id' })
    } else if (err.name === 'ValidationError') {
        return res.status(400).json({ error: err.message })
    }
    // pass the error to default Express error handler
    next(err)
})
