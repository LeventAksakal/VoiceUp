<script setup>
import { onMounted, reactive, ref } from 'vue'
import { socket, state } from '../socket.js'

let video = null
let videoStream = null
let toggle = ref(true)

function playVideo() {
  toggle.value = !toggle.value
  const constraints = {
    video: true,
    audio: true
  }
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then((stream) => {
      video.srcObject = stream
      video.play()
    })
    .catch((error) => {
      console.error('Error accessing media devices.', error)
    })
}
function stopVideo() {
  toggle.value = !toggle.value
  if (video.srcObject) {
    const tracks = video.srcObject.getTracks()
    tracks.forEach((track) => track.stop())
    video.pause()
  }
}
onMounted(() => {
  video = document.getElementById('camera')
})
</script>

<template>
  <div class="greetings">
    <h1 class="green"></h1>
    <h3>
      <video id="camera"></video>

      <button v-if="toggle" @click="playVideo">play</button>
      <button v-else @click="stopVideo">stop</button>
    </h3>
  </div>
</template>

<style scoped>
#camera {
  transform: scaleX(-1);
}
body {
  background-color: rgb(188, 188, 60);
}
</style>
