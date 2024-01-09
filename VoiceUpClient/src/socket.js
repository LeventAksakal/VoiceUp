import { reactive } from 'vue'
import { io } from 'socket.io-client'
import router from './router/index.js'

export const state = reactive({
  room: null,
  rtcConnection: new RTCPeerConnection({
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
  })
})

export const socket = io()

state.rtcConnection.onicecandidate = ({ candidate }) => {
  if (candidate && state.room) {
    socket.emit('candidate', candidate, state.room)
    console.log('candidate sent', candidate)
  }
}
state.rtcConnection.ontrack = (event) => {
  console.log('RTCPeerConnection established', event)
}

state.rtcConnection.onnegotiationneeded = () => {
  console.log('Negotiation needed')
}
// Check the offer/answer negotiation
state.rtcConnection.oniceconnectionstatechange = () => {
  console.log('ICE connection state change:', state.rtcConnection.iceConnectionState)
}
// Check the ICE connection state
state.rtcConnection.onconnectionstatechange = () => {
  console.log('Connection state change:', state.rtcConnection.connectionState)
}

socket.on('candidate', (candidate) => {
  state.rtcConnection.addIceCandidate(new RTCIceCandidate(candidate))
})

socket.on('answer', (answer) => {
  state.rtcConnection.setRemoteDescription(answer)
  console.log('answer recieved', answer)
})
socket.on('offer', async (offer) => {
  state.rtcConnection.setRemoteDescription(offer)
  console.log('offer recieved', offer)
  const answer = await state.rtcConnection.createAnswer()
  await state.rtcConnection.setLocalDescription(answer)
  socket.emit('answer', answer, state.room)

  console.log('answer made', answer)
})
socket.on('video-offer', async (room) => {
  state.room = room
  const offer = await state.rtcConnection.createOffer()
  await state.rtcConnection.setLocalDescription(offer)
  socket.emit('offer', offer, state.room)
  console.log('offer made', offer)
  router.push({ name: 'room', params: { room } })
})
socket.on('video-answer', (room) => {
  state.room = room
  router.push({ name: 'room', params: { room } })
})
