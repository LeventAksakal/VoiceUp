<template>
  <div class="flex justify-center items-center h-screen">
    <div class="w-1/2 h-1/2 border border-gray-300 m-2 relative">
      <video
        ref="localVideo"
        autoplay
        playsinline
        muted
        class="absolute top-0 left-0 w-full h-full object-cover transform scale-y-1"
      ></video>
    </div>
    <div class="w-1/2 h-1/2 border border-gray-300 m-2 relative">
      <video
        ref="remoteVideo"
        autoplay
        playsinline
        class="absolute top-0 left-0 w-full h-full object-cover"
      ></video>
    </div>
  </div>

  <div class="flex justify-between mt-5 px-10">
    <div>
      <button class="mx-2" @click="toggleMute">{{ isMuted ? 'Unmute' : 'Mute' }}</button>
      <button class="mx-2" @click="toggleCamera">
        {{ isCameraOn ? 'Turn Camera Off' : 'Turn Camera On' }}
      </button>
    </div>
    <div>
      <button class="mx-2" @click="skip">Skip</button>
      <button class="mx-2" @click="leave">Leave</button>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { socket, state } from '../socket.js'

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
  socket.emit('leave', state.room)
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
  if (stream) {
    stream.getTracks().forEach((track) => track.stop())
  }
})
</script>
