const express = require('express')
const cors = require('cors')
const app = express()

// Middleware que definimos nosotros
const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// Middleware creado por otros
app.use(express.json())
app.use(cors()) // permitimos solicitudes de todos los orígenes
app.use(express.static('build')) // para servir contenido estático (ante petición GET busta en el directorio 'build')

// Middleware propio
app.use(requestLogger)

let notes = [
  {
    id: 1,
    content: "HTML is easy",
    date: "2019-05-30T17:30:31.098Z",
    important: true
  },
  {
    id: 2,
    content: "Browser can execute only Javascript",
    date: "2019-05-30T18:39:34.091Z",
    important: false
  },
  {
    id: 3,
    content: "GET and POST are the most important methods of HTTP protocol",
    date: "2019-05-30T19:20:14.298Z",
    important: true
  }
]

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})
  
app.get('/api/notes', (request, response) => {
    response.json(notes)
})

const generateId = () => {
    const maxId = notes.length > 0
      ? Math.max(...notes.map(n => n.id))
      : 0
    return maxId + 1
  }

app.post('/api/notes', (request, response) => {
    const body = request.body
  
    if (!body.content) {
      return response.status(400).json({ 
        error: 'content missing' 
      })
    }
  
    const note = {
      content: body.content,
      important: body.important || false,
      date: new Date(),
      id: generateId(),
    }
  
    notes = notes.concat(note)
  
    response.json(note)
})

app.get('/api/notes/:id', (request, response) => {
    const id = Number(request.params.id)
    const note = notes.find(note => note.id === id)
    if (note) {
       response.json(note)
    } else {
        response.status(404).end()
    }

})

app.put('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id)
  const newNote = request.body
  notes = notes.map(note => note.id === id ? newNote : note)
  const note = notes.find(note => note.id === id)
  if (note) {
     response.json(note)
  } else {
      response.status(404).end()
  }

})

app.delete('/api/notes/:id', (request, response) => {
    const id = Number(request.params.id)
    notes = notes.filter(note => note.id !== id)
  
    response.status(204).end()
})

// Middleware propio
app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})