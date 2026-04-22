import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { sendChatMessage } from '../utils/claudeApi.js'

// Helper to create a past timestamp (minutes ago)
function minsAgo(n) {
  return new Date(Date.now() - n * 60 * 1000)
}

// Pre-seeded conversation shown when chatbot first opens
const PREFEED_MESSAGES = [
  {
    role: 'user',
    content: 'Hey, who are you?',
    time: minsAgo(14),
  },
  {
    role: 'assistant',
    content: `Hi Deepanshu! I'm the **FraudGuard AI Assistant**, powered by Groq.

I specialize in:
🔍 Real-time transaction fraud analysis
Suspicious activity detection
Account safety recommendations

How can I help protect you today?`,
    time: minsAgo(13),
  },
  {
    role: 'user',
    content: 'I got a suspicious SMS last night at 2:30 AM saying my account was accessed from a new device in Moscow. Should I be worried?',
    time: minsAgo(10),
  },
  {
    role: 'assistant',
    content: `**Yes, Deepanshu — this is a serious red flag. Act immediately.**

Here's why this is high-risk:
• **2:30 AM access** — fraudsters target off-hours when you're less likely to notice
• **Moscow, Russia** — one of our top fraud-origin locations globally
• **New device login** — common first step before draining funds

**Immediate steps:**
1. Change your banking password RIGHT NOW
2. Call your bank's fraud hotline to freeze the account
3. Enable 2-Factor Authentication if not already active
4. Review the last 48 hours of transactions

Don't click any links in that SMS — it may also be a phishing attempt.`,
    time: minsAgo(9),
  },
  {
    role: 'user',
    content: 'Oh no... I just checked and ₹10,00,000 (10 lakhs) has been debited from my account at 3:15 AM! The merchant shows as "INTL WIRE XFR". What do I do??',
    time: minsAgo(5),
  },
  {
    role: 'assistant',
    content: `**CRITICAL FRAUD DETECTED — Risk Score: 97%**

"INTL WIRE XFR" at 3:15 AM for ₹10,00,000 is a **confirmed fraud pattern** in our system.

**Do this RIGHT NOW — every minute matters:**

1. **Call your bank IMMEDIATELY** → Report unauthorized wire transfer
2. **Freeze your account** → Request a complete account freeze via your banking app or helpline
3. **File a cybercrime complaint** → Report at [cybercrime.gov.in](https://cybercrime.gov.in) within 24 hours
4. **Email evidence** → Send the SMS + transaction screenshot to your bank's fraud email
5. **Visit the branch** → For ₹10L+, in-person reporting speeds up reversal

International wire recalls are possible within **24–48 hours** if reported quickly. The faster you act, the higher the recovery chance.

Shall I help you draft the fraud complaint letter?`,
    time: minsAgo(4),
  },
]

const STARTERS = [
  'Help me draft a fraud complaint letter',
  'How do I dispute an unauthorized transaction?',
  'What security steps should I take now?',
]

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function ChatBot({ inline = false }) {
  const [open, setOpen] = useState(inline ? true : false)
  const [isListening, setIsListening] = useState(false)
  // Initialize with the pre-seeded fraud scenario conversation
  const [messages, setMessages] = useState(PREFEED_MESSAGES)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Scroll to bottom whenever chat is opened
  useEffect(() => {
    if (open) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }
  }, [open])

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: 'Conversation history cleared. How can I assist you?',
      time: new Date(),
    }])
  }

  const send = async (text) => {
    if (!text.trim() || loading) return
    const userMsg = { role: 'user', content: text, time: new Date() }
    const history = [...messages, userMsg]
    setMessages(history)
    setInput('')
    setLoading(true)

    try {
      // Send clean conversation history — system prompt is injected server-side
      const apiMessages = history.map(m => ({ role: m.role, content: m.content }))
      const reply = await sendChatMessage(apiMessages)
      setMessages(prev => [...prev, { role: 'assistant', content: reply, time: new Date() }])
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Unknown error'
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ Error: ${msg}`,
        time: new Date(),
      }])
    } finally {
      setLoading(false)
    }
  }

  const toggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      toast.error('Voice commands not supported. Try Chrome/Edge.')
      return
    }

    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => setIsListening(true)
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      setInput(transcript)
      setTimeout(() => send(transcript), 500)
    }
    recognition.onerror = (e) => {
      setIsListening(false)
      if (e.error === 'not-allowed') toast.error('Microphone access denied.')
      else if (e.error !== 'no-speech') toast.error(`Mic error: ${e.error}`)
    }
    recognition.onend = () => setIsListening(false)

    try {
      recognition.start()
    } catch (err) {
      toast.error('Could not start microphone')
      setIsListening(false)
    }
  }

  return (
    <>
      {/* Floating button - only show if NOT inline */}
      {!inline && (
        <motion.button
          id="chatbot-toggle"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setOpen(o => !o)}
          style={{
            position: 'fixed', bottom: 28, right: 28, zIndex: 1000,
            width: 56, height: 56, borderRadius: '50%',
            background: 'var(--color-primary)',
            border: 'none', cursor: 'pointer', fontSize: 24,
            boxShadow: '0 0 25px rgba(212, 175, 55,0.4), 0 0 50px rgba(124,58,237,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {open ? '✕' : '💬'}
        </motion.button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={inline ? false : { opacity: 0, y: 40, scale: 0.95 }}
            animate={inline ? false : { opacity: 1, y: 0, scale: 1 }}
            exit={inline ? false : { opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="chat-window"
            style={inline ? {
              width: '100%', height: 500,
              display: 'flex', flexDirection: 'column',
              background: 'transparent',
              boxShadow: 'none',
              border: 'none',
            } : {
              position: 'fixed', bottom: 100, right: 28, zIndex: 999,
              width: 400, height: 500,
              display: 'flex', flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(212, 175, 55,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: 'var(--color-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18,
                }}></div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#e2e8f0' }}>FraudGuard Assistant</div>
                  <div style={{ fontSize: 11, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                    Online • Groq-powered
                  </div>
                </div>
              </div>
              <button
                onClick={clearChat}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#a3a3a3',
                  fontSize: 11,
                  padding: '4px 10px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                Clear
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>

              {/* Date divider for pre-fed history */}
              <div style={{ textAlign: 'center', margin: '4px 0 8px' }}>
                <span style={{
                  fontSize: 10, color: '#374151', background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20,
                  padding: '3px 12px', letterSpacing: '0.05em',
                }}>Earlier today</span>
              </div>

              {messages.map((msg, i) => {
                const isUser = msg.role === 'user'
                const isLastBot = !isUser && i === messages.length - 1

                // Render **bold** markdown in bot messages
                const renderContent = (text) => {
                  const parts = text.split(/\*\*(.*?)\*\*/g)
                  return parts.map((p, j) =>
                    j % 2 === 1
                      ? <strong key={j} style={{ color: '#e2e8f0', fontWeight: 700 }}>{p}</strong>
                      : <span key={j}>{p}</span>
                  )
                }

                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: isUser ? 'flex-end' : 'flex-start' }}>
                    {/* Avatar for bot */}
                    {!isUser && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}></div>
                        <span style={{ fontSize: 10, color: '#4b5563', fontWeight: 600 }}>FraudGuard AI</span>
                      </div>
                    )}
                    <div
                      className={isUser ? 'chat-bubble-user' : 'chat-bubble-bot'}
                      style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}
                    >
                      {isUser ? msg.content : renderContent(msg.content)}
                    </div>
                    <span style={{ fontSize: 10, color: '#374151', paddingInline: 4 }}>{formatTime(msg.time)}</span>

                    {/* Follow-up suggestions after last bot message */}
                    {isLastBot && !loading && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8, width: '100%' }}>
                        <div style={{ fontSize: 10, color: '#4b5563', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', paddingLeft: 4 }}>Suggested next steps</div>
                        {STARTERS.map(q => (
                          <button
                            key={q}
                            onClick={() => send(q)}
                            style={{
                              background: 'rgba(212, 175, 55,0.05)',
                              border: '1px solid rgba(212, 175, 55,0.15)',
                              borderRadius: 10, padding: '8px 12px',
                              color: 'var(--color-primary)', fontSize: 12, cursor: 'pointer',
                              fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(212, 175, 55,0.1)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(212, 175, 55,0.05)'}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}

              {loading && (
                <div style={{ display: 'flex', gap: 4, padding: '8px 12px', alignItems: 'center' }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} className="typing-dot" style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: 'var(--color-primary)', display: 'inline-block',
                    }} />
                  ))}
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{
              padding: '12px 16px',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              display: 'flex', gap: 8,
            }}>
              <input
                className="input-field"
                placeholder="Ask about fraud patterns..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send(input)}
                style={{ flex: 1, padding: '10px 14px', fontSize: 13 }}
              />
              <button
                onClick={toggleVoice}
                style={{
                  background: isListening ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)',
                  border: isListening ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10, width: 42, cursor: 'pointer', fontSize: 18,
                  transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                title="Voice Command"
              >
                {isListening ? '🔴' : '🎤'}
              </button>
              <button
                onClick={() => send(input)}
                disabled={loading}
                style={{
                  background: 'var(--color-primary)',
                  border: 'none', borderRadius: 10,
                  width: 42, cursor: 'pointer', fontSize: 18,
                  opacity: loading ? 0.5 : 1,
                  transition: 'all 0.2s',
                }}
              >
                ↑
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
