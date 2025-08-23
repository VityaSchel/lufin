import { nanoid } from 'nanoid'

export const channels: Map<
  string,
  {
    isEnded:
      | false
      | {
          success: true
          authorToken: string
          expiresAt: number
        }
      | {
          success: false
          error: string
        }
    socket: null | { send: SendFunction; close: (code?: number) => void }
  }
> = new Map()

export function createUpdatesChannel() {
  let channelId = nanoid(16)

  channels.set(channelId, {
    isEnded: false,
    socket: null,
  })

  return channelId
}

type Update =
  | {
      type: 'progress'
      fileField: string
      status: 'SAVED'
    }
  | {
      type: 'upload_errored'
      error: string
    }
  | {
      type: 'upload_success'
      pageId: string
      authorToken: string
      pageExpiresAt: number
    }

export function sendUpdate(channelId: string, update: Update) {
  const channel = channels.get(channelId)
  if (!channel) return
  const ws = channel.socket
  if (ws) {
    switch (update.type) {
      case 'upload_success':
        sendWsUploadSuccess(ws.send, {
          authorToken: update.authorToken,
          expiresAt: update.pageExpiresAt,
        })
        ws.close(1000)
        break
      case 'upload_errored':
        sendWsUploadError(ws.send, update.error)
        ws.close(1000)
        break
      case 'progress':
        ws.send(
          JSON.stringify({
            update_type: 'progress',
            file: update.fileField,
            status: update.status,
          }),
        )
        break
    }
  }
  if (update.type === 'upload_errored') {
    channel.isEnded = {
      success: false,
      error: update.error,
    }
  } else if (update.type === 'upload_success') {
    channel.isEnded = {
      success: true,
      authorToken: update.authorToken,
      expiresAt: update.pageExpiresAt,
    }
  }
  if (update.type === 'upload_errored' || update.type === 'upload_success') {
    setTimeout(() => {
      channels.delete(channelId)
    }, 60 * 1000)
  }
}

type SendFunction = import('elysia/ws').ElysiaWS['send']

export const sendWsUploadSuccess = (
  send: SendFunction,
  { authorToken, expiresAt }: { authorToken: string; expiresAt: number },
) => {
  send(
    JSON.stringify({
      update_type: 'upload_success',
      author_token: authorToken,
      expires_at: expiresAt,
      isClosing: true,
    }),
  )
}

export const sendWsUploadError = (send: SendFunction, error: string) => {
  send(
    JSON.stringify({
      update_type: 'upload_errored',
      error: error,
      isClosing: true,
    }),
  )
}
