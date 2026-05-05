import { Server as HttpServer } from 'http'
import { Server as SocketServer } from 'socket.io'
import jwt from 'jsonwebtoken'
import { env } from './env'
import type { JwtPayload } from '@/middlewares/auth'

let io: SocketServer

export function initSocket(server: HttpServer) {
  io = new SocketServer(server, {
    cors: {
      origin: env.FRONTEND_URL,
      credentials: true
    }
  })

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined
    if (!token) {
      return next(new Error('Authentication error'))
    }
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload
      socket.data.userId = decoded.userId
      next()
    } catch {
      next(new Error('Authentication error'))
    }
  })

  io.on('connection', socket => {
    const userId = socket.data.userId as string
    socket.join(userId)
    console.log(`[Socket] User ${userId} connected (socket ${socket.id})`)

    socket.on('disconnect', () => {
      console.log(`[Socket] User ${userId} disconnected (socket ${socket.id})`)
    })
  })
}

export function emitToUser(userId: string, event: string, data: object) {
  if (!io) return
  const room = io.sockets.adapter.rooms.get(userId)
  if (room && room.size > 0) {
    io.to(userId).emit(event, data)
  }
}
