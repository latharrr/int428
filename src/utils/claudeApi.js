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

export async function transcribeAudio(audioBase64) {
  const response = await axios.post(`${API_BASE}/transcribe`, { audio: audioBase64 })
  return response.data.text
}

export async function getTransactions() {
  const response = await axios.get(`${API_BASE}/transactions`)
  return response.data
}

export async function addTransaction(transaction) {
  const response = await axios.post(`${API_BASE}/transactions`, transaction)
  return response.data
}

// Persist analysis result back to server for a given transaction ID
export async function updateTransactionStatus(id, status, risk) {
  const response = await axios.patch(`${API_BASE}/transactions/${id}`, { status, risk })
  return response.data
}
