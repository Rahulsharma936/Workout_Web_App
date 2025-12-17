require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const http = require('http')
const cors = require('cors')
const { Server } = require('socket.io')

const workoutRoutes = require('./routes/workouts')
const userRoutes = require('./routes/user')
const roomRoutes = require('./routes/rooms')

const app = express()
const server = http.createServer(app)



const ALLOWED_ORIGINS = [
  'https://workout-web-app7.onrender.com', 
  'http://localhost:3000'                  
]

app.use(cors({
  origin: function (origin, callback) {
    
    if (!origin) return callback(null, true)

    if (ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))


app.options('*', cors())


app.use(express.json())

app.use((req, res, next) => {
  console.log(req.method, req.path)
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
    console.log(`User ${socket.id} joined room ${room}`)
  })

  socket.on('send_message', (data) => {
    socket.to(data.room).emit('receive_message', data)
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})


const PORT = process.env.PORT || 4000

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB')
    server.listen(PORT, () => {
      console.log('Server listening on port', PORT)
    })
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err)
  })
