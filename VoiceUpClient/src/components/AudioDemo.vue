<script setup>
import { onMounted } from 'vue'
import { socket, state } from '../socket.js'

const constraints = {
  video: false,
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

onMounted(() => {
  video = document.getElementById('camera')
})
</script>

<template></template>

<style scoped></style>
