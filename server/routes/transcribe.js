const router = require('express').Router()
const Groq = require('groq-sdk')
const fs = require('fs')
const path = require('path')
const os = require('os')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

router.post('/', async (req, res) => {
  try {
    const { audio } = req.body
    if (!audio) return res.status(400).json({ error: 'audio base64 required' })

    // Strip out the data URL prefix if present (e.g., "data:audio/webm;codecs=opus;base64,")
    const base64Data = audio.replace(/^data:audio\/\w+(?:;\w+=[^;]+)*;base64,/, "")
    const buffer = Buffer.from(base64Data, 'base64')
    
    // Create a temporary file path
    const tmpFile = path.join(os.tmpdir(), `audio-${Date.now()}-${Math.random().toString(36).substring(7)}.webm`)
    
    fs.writeFileSync(tmpFile, buffer)

    // Call Groq Whisper API
    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(tmpFile),
      model: 'whisper-large-v3', // Reliable and fast model on Groq
      response_format: 'json',
      language: 'en'
    })

    // Clean up temporary file
    fs.unlinkSync(tmpFile)

    res.json({ text: transcription.text })
  } catch (err) {
    console.error('Transcription error:', err)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
