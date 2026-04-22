import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

export async function sendChatMessage(messages) {
  const response = await axios.post(`${API_BASE}/chat`, { messages })
  return response.data.content
}

export async function analyzeTransaction(transaction) {
  const response = await axios.post(`${API_BASE}/analyze`, { transaction })
  return response.data
}
