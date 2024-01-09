<script setup>
import { socket } from '@/socket'

const requestVideoChat = () => {
  socket.emit('video-request')
}
</script>

<template>
  <div class="flex flex-col items-center justify-center h-screen">
    <h1 class="text-4xl font-bold mb-8">VoiceUp</h1>
    <button @click="requestVideoChat" class="px-4 py-2 bg-blue-500 text-white rounded">
      Request Video Chat
    </button>
  </div>
</template>
