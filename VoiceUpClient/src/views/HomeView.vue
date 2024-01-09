<script setup>
import { socket } from '@/socket'

const requestVideoChat = () => {
  socket.emit('video-request')
}
</script>

<template>
  <main>
    <div>
      <h1>VoiceUp!</h1>
      <button @click="requestVideoChat">
        Request Video Chat
      </button>
    </div>


  </main>
</template>

<style scoped>
main {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color:  #3d348b;
  height: 100vh;
  width: 100vw;
  overflow: hidden;

}

h1 {
  color:  #f7b801;
  font-size: 50px;
  margin-bottom: 25px;

}


button{
  background: #f18701;
  border-radius: 999px;
  box-sizing: border-box;
  color: rgb(230, 232, 230);
  cursor: pointer;
  font-family: Inter,Helvetica,"Apple Color Emoji","Segoe UI Emoji",NotoColorEmoji,"Noto Color Emoji","Segoe UI Symbol","Android Emoji",EmojiSymbols,-apple-system,system-ui,"Segoe UI",Roboto,"Helvetica Neue","Noto Sans",sans-serif;
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
  border: 0;
}
</style>

