import type { FastifyRequest } from 'fastify'
import type { WebSocket } from 'ws'
import crypto from 'crypto'

const channels: {
  [channelID: string]: {
    isEnded: false | {
      success: true
      authorToken: string
    } | {
      success: false
      error: string
    },
    socket: null | WebSocket
  }
} = {}

export function createUpdatesChannel() {
  let channelID = ''
  for (let i = 0; i < 16; i++) {
    const randomByte = crypto.randomBytes(1)[0]
    const hexValue = randomByte.toString(16).toLowerCase()
    channelID += hexValue
  }

  channels[channelID] = {
    isEnded: false,
    socket: null
  }
  return channelID
}

export function sendUpdate(channelID: string, updateType: 'progress', data: { fileField: string, status: 'SAVED' })
export function sendUpdate(channelID: string, updateType: 'upload_errored', data: { error: string })
export function sendUpdate(channelID: string, updateType: 'upload_success', data: { pageID: string, authorToken: string })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sendUpdate(channelID: string, updateType: 'progress' | 'upload_errored' | 'upload_success', data: any) {
  const ws = channels[channelID].socket
  if(ws !== null) {
    switch(updateType) {
      case 'upload_success':
        sendWsUploadSuccess(ws, data.authorToken)
        ws.close(1000)
        break
      case 'upload_errored':
        sendWsUploadError(ws, data.error)
        ws.close(1000)
        break
      case 'progress':
        ws.send(JSON.stringify({ update_type: 'progress', file: data.fileField, status: data.status }))
        break
    }
  }
  if(updateType === 'upload_errored') {
    channels[channelID].isEnded = {
      success: false,
      error: data.error
    }
  } else if(updateType === 'upload_success') {
    channels[channelID].isEnded = {
      success: true,
      authorToken: data.authorToken
    }
  }
  if(updateType === 'upload_errored' || updateType === 'upload_success') {
    setTimeout(() => {
      delete channels[channelID]
    }, 60*1000)
  }
}

export function WebsocketHandler(socket: import('ws').WebSocket, request:  FastifyRequest<{ Params: { channelID: unknown } }>) {
  const channelID = request.params.channelID

  if(typeof channelID !== 'string') {
    socket.send(JSON.stringify({ update_type: 'errored', reason: 'CHANNEL_ID_INVALID', isClosing: true }))
    socket.close(1000)
    return  
  }
  if(!Object.hasOwn(channels, channelID)) {
    socket.send(JSON.stringify({ update_type: 'errored', reason: 'CHANNEL_ID_NOT_FOUND', isClosing: true }))
    socket.close(1000)
    return
  }
  const isEnded = channels[channelID].isEnded
  if(isEnded) {
    if(isEnded.success) {
      sendWsUploadSuccess(socket, isEnded.authorToken)
    } else {
      sendWsUploadError(socket, isEnded.error)
    }
    socket.close(1000)
    return
  }
  if(channels[channelID].socket !== null) {
    socket.send(JSON.stringify({ update_type: 'errored', reason: 'CHANNEL_OCCUPIED', isClosing: true }))
    socket.close(1000)
    return
  }
  
  socket.on('close', () => {
    if(channels[channelID]) {
      channels[channelID].socket = null
    }
  })
  channels[channelID].socket = socket
}

const sendWsUploadSuccess = (ws: WebSocket, authorToken: string) => {
  ws.send(JSON.stringify({ update_type: 'upload_success', author_token: authorToken, isClosing: true }))
}

const sendWsUploadError = (ws: WebSocket, error: string) => {
  ws.send(JSON.stringify({ update_type: 'upload_errored', error: error, isClosing: true }))
}