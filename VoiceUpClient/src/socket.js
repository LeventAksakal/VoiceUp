import { reactive } from 'vue'
import { io } from 'socket.io-client'
import router from './router/index.js'

const iceConfig = {
  iceServers: [
    {
      urls: 'stun:stun.relay.metered.ca:80'
    },
    {
      urls: 'turn:standard.relay.metered.ca:80',
      username: '5e27ef5e230616aa82817fdc',
      credential: 'OS+odB9aIJreFq1k'
    },
    {
      urls: 'turn:standard.relay.metered.ca:80?transport=tcp',
      username: '5e27ef5e230616aa82817fdc',
      credential: 'OS+odB9aIJreFq1k'
    },
    {
      urls: 'turn:standard.relay.metered.ca:443',
      username: '5e27ef5e230616aa82817fdc',
      credential: 'OS+odB9aIJreFq1k'
    },
    {
      urls: 'turn:standard.relay.metered.ca:443?transport=tcp',
      username: '5e27ef5e230616aa82817fdc',
      credential: 'OS+odB9aIJreFq1k'
    }
  ]
}

export const state = reactive({
  room: null,
  rtcConnection: new RTCPeerConnection(iceConfig),
  userCount: 0
})

export const socket = io()

state.rtcConnection.onicecandidate = ({ candidate }) => {
  if (candidate && state.room) {
    socket.emit('candidate', candidate, state.room)
  }
}

socket.on('candidate', (candidate) => {
  state.rtcConnection.addIceCandidate(new RTCIceCandidate(candidate))
})

socket.on('answer', (answer) => {
  state.rtcConnection.setRemoteDescription(answer)
})

socket.on('offer', async (offer) => {
  state.rtcConnection.setRemoteDescription(offer)
  const answer = await state.rtcConnection.createAnswer()
  await state.rtcConnection.setLocalDescription(answer)
  socket.emit('answer', answer, state.room)
})

socket.on('video-offer', async (room) => {
  // state.rtcConnection = new RTCPeerConnection(iceConfig)
  state.room = room
  const offer = await state.rtcConnection.createOffer()
  await state.rtcConnection.setLocalDescription(offer)
  socket.emit('offer', offer, state.room)
  router.push({ name: 'room', params: { room } })
})

socket.on('video-answer', (room) => {
  // state.rtcConnection = new RTCPeerConnection(iceConfig)
  state.room = room
  router.push({ name: 'room', params: { room } })
})

socket.on('skip', () => {
  state.rtcConnection.close()
  state.room = null
  state.rtcConnection = new RTCPeerConnection(iceConfig)
  socket.emit('video-request')
  router.push({ name: 'home' })
})

socket.on('refresh-rtc', () => {
  state.rtcConnection.close()
  state.rtcConnection = new RTCPeerConnection(iceConfig)
})

socket.on('user-count', (userCount) => {
  state.userCount = userCount
})
