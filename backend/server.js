require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const http = require('http')
const { Server } = require('socket.io')

const workoutRoutes = require('./routes/workouts')
const userRoutes = require('./routes/user')
const roomRoutes = require('./routes/rooms')

const app = express()
const server = http.createServer(app)



const ALLOWED_ORIGINS = [
  'https://workout-web-app7.onrender.com'
]

app.use((req, res, next) => {
  const origin = req.headers.origin

  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }

  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  )
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  )
  res.setHeader('Access-Control-Allow-Credentials', 'true')

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }

  next()
})



app.use(express.json())

app.use((req, res, next) => {
  console.log(req.path, req.method)
  next()
})



app.use('/api/workouts', workoutRoutes)
app.use('/api/user', userRoutes)
app.use('/api/rooms', roomRoutes)



const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST'],
    credentials: true
  }
})

io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  socket.on('join_room', (room) => {
    socket.join(room)
  })

  socket.on('send_message', (data) => {
    socket.to(data.room).emit('receive_message', data)
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})



mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB')
    server.listen(process.env.PORT, () => {
      console.log('Server listening on port', process.env.PORT)
    })
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err)
  })
