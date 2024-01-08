import { reactive } from 'vue'
import { io } from 'socket.io-client'

export const state = reactive({})

const url = 'http://localhost:3000'

export const socket = io(url)
