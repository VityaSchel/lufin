import Elysia, { t } from 'elysia'
import { channels, sendWsUploadError, sendWsUploadSuccess } from 'src/ws'

export const updatesWebsocketRoute = new Elysia().ws('/updates/:channelId', {
  params: t.Object({
    channelId: t.String({
      minLength: 1,
    }),
  }),
  open: async ({
    data: {
      params: { channelId },
    },
    send,
    close,
  }) => {
    const channel = channels.get(channelId)
    if (!channel) {
      send(
        JSON.stringify({
          update_type: 'errored',
          reason: 'CHANNEL_ID_NOT_FOUND',
          isClosing: true,
        }),
      )
      close(1000)
      return
    }

    if (channel.isEnded) {
      if (channel.isEnded.success) {
        sendWsUploadSuccess(send, channel.isEnded.authorToken)
      } else {
        sendWsUploadError(send, channel.isEnded.error)
      }
      close(1000)
      return
    }
    if (channel.socket !== null) {
      channel.socket.send(
        JSON.stringify({
          update_type: 'errored',
          reason: 'CHANNEL_OCCUPIED',
          isClosing: true,
        }),
      )
      channel.socket.close(1000)
      return
    }
    channel.socket = {
      send,
      close,
    }
  },
  close: ({
    data: {
      params: { channelId },
    },
  }) => {
    const channel = channels.get(channelId)
    if (channel) {
      channel.socket = null
    }
  },
})
