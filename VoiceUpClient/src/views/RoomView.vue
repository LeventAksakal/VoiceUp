<template>
  <div class="header">
    <h1>VoiceUp!</h1>
  </div>
  <main>
    <div class="video-container">
      <div>
        <video ref="localVideo" autoplay muted playsinline></video>
      </div>
      <div>
        <video ref="remoteVideo" autoplay playsinline></video>
      </div>
    </div>

    <div class="button-container">
      <div>
        <button class="func-button" @click="toggleMute">{{ isMuted ? 'Unmute' : 'Mute' }}</button>
        <button class="func-button" @click="toggleCamera">
          {{ isCameraOn ? 'Turn Camera Off' : 'Turn Camera On' }}
        </button>
      </div>
      <div>
        <button class="red-button" @click="skip">Skip</button>
        <button class="red-button" @click="leave">Leave</button>
      </div>
    </div>
  </main>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { socket, state } from '../socket.js'
import router from '@/router'

const isMuted = ref(false)
const isCameraOn = ref(true)
const localVideo = ref(null)
const remoteVideo = ref(null)
let stream = null

const toggleMute = async () => {
  isMuted.value = !isMuted.value
  updateStream()
}

const toggleCamera = async () => {
  isCameraOn.value = !isCameraOn.value
  updateStream()
}

const updateStream = async () => {
  if (localVideo.value.srcObject) {
    localVideo.value.srcObject.getTracks().forEach((track) => track.stop())
  }

  if (!isCameraOn.value && isMuted.value) {
    localVideo.value.srcObject = null
    return
  }

  stream = await navigator.mediaDevices.getUserMedia({
    video: isCameraOn.value,
    audio: !isMuted.value
  })

  state.rtcConnection.getSenders().forEach((sender) => state.rtcConnection.removeTrack(sender))
  stream.getTracks().forEach((track) => state.rtcConnection.addTrack(track, stream))
  localVideo.value.srcObject = stream

  const offer = await state.rtcConnection.createOffer()
  await state.rtcConnection.setLocalDescription(offer)
  socket.emit('offer', offer, state.room)
}

const skip = () => {
  socket.emit('skip', state.room)
}

const leave = () => {
  router.push('/')
}
onMounted(async () => {
  localVideo.value.focus()
  remoteVideo.value.focus()
  updateStream()
  state.rtcConnection.ontrack = (event) => {
    remoteVideo.value.srcObject = event.streams[0]

    event.streams[0].getVideoTracks()[0].onunmute = () => {
      placeholder.value.classList.add('hidden')
      remoteVideo.value.classList.remove('hidden')
    }
    event.streams[0].getVideoTracks()[0].onmute = () => {
      placeholder.value.classList.remove('hidden')
      remoteVideo.value.classList.add('hidden')
    }
  }
})
onUnmounted(() => {
  state.rtcConnection.close()
  socket.emit('leave', state.room)
  state.rtcConnection = null
  state.room = null
  if (stream) {
    stream.getTracks().forEach((track) => track.stop())
  }
})
</script>

<style scoped>
main {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background-color: #3d348b;
  height: 90vh;
  width: 100vw;
  overflow: hidden;
}

h1 {
  color: #f7b801;
  margin-left: 55px;
  font-weight: bold;
}

.header {
  height: 10vh;
  width: 100vw;
  display: flex;
  align-items: left;
  justify-content: center;
  flex-direction: column;
  background-color: #7678ed;
}

.video-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  /* Adjust column sizes as needed */
  grid-gap: 10px;
}

video {
  width: auto;
  min-width: 350px;
  min-height: 350px;
  border: 5px solid #f18701;
  border-radius: 2%;
  background-image: url('../assets/camera-icon.jpg');
  background-position: center;
  transform: scaleX(-1);
}

.button-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 400px;
}

.func-button {
  margin-left: 10px;
  background: #7678ed;
  border-radius: 999px;
  box-sizing: border-box;
  color: rgb(0, 0, 0);
  cursor: pointer;
  font-family:
    Inter,
    Helvetica,
    'Apple Color Emoji',
    'Segoe UI Emoji',
    NotoColorEmoji,
    'Noto Color Emoji',
    'Segoe UI Symbol',
    'Android Emoji',
    EmojiSymbols,
    -apple-system,
    system-ui,
    'Segoe UI',
    Roboto,
    'Helvetica Neue',
    'Noto Sans',
    sans-serif;
  font-size: 16px;
  font-weight: 700;
  line-height: 24px;
  opacity: 1;
  outline: 0 solid transparent;
  padding: 8px 18px;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  width: fit-content;
  word-break: break-word;
  border: 3px solid rgb(230, 232, 230);
}

.red-button {
  margin-left: 10px;
  background: #f7b801;
  border-radius: 999px;
  box-sizing: border-box;
  color: rgb(0, 0, 0);
  cursor: pointer;
  font-family:
    Inter,
    Helvetica,
    'Apple Color Emoji',
    'Segoe UI Emoji',
    NotoColorEmoji,
    'Noto Color Emoji',
    'Segoe UI Symbol',
    'Android Emoji',
    EmojiSymbols,
    -apple-system,
    system-ui,
    'Segoe UI',
    Roboto,
    'Helvetica Neue',
    'Noto Sans',
    sans-serif;
  font-size: 16px;
  font-weight: 700;
  line-height: 24px;
  opacity: 1;
  outline: 0 solid transparent;
  padding: 8px 18px;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  width: fit-content;
  word-break: break-word;
  border: 3px solid rgb(230, 232, 230);
}
</style>
