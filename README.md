# FraudGuard AI 🛡️

FraudGuard AI is an advanced, AI-powered fraud detection and analytics platform designed to protect financial transactions in real-time. By leveraging Groq's high-speed inference and sophisticated risk-scoring algorithms, FraudGuard AI identifies suspicious patterns, alerts users instantly, and provides actionable steps to mitigate financial loss.

## ✨ Features

- **Real-Time Transaction Analysis:** Instantly analyze transactions for fraud indicators using Groq AI.
- **Risk Scoring:** Generate dynamic risk scores based on merchant reputation, location, time of day, and historical patterns.
- **AI Voice Assistant:** A voice-enabled chatbot powered by Groq to help users understand fraud patterns and take immediate action during a crisis.
- **Interactive Dashboard:** Visualize 7-day fraud trends, top risk locations, and transaction breakdowns with dynamic charts.
- **Premium UI:** A modern, dark-themed, glassmorphism UI designed for maximum readability and visual impact.

## 🚀 Tech Stack

- **Frontend:** React, Vite, Framer Motion, Recharts
- **Backend:** Node.js, Express
- **AI Engine:** Groq API (Llama 3 / Mixtral)
- **Styling:** Vanilla CSS (Design System)

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/fraudguard-ai.git
   cd fraudguard-ai
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Install backend dependencies:**
   ```bash
   cd server
   npm install
   ```

4. **Environment Variables:**
   Create a `.env` file in the `server` directory and add your API keys:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   PORT=5000
   ```

5. **Run the Application:**
   Start both the frontend and backend servers.
   ```bash
   # In the root directory (Frontend)
   npm run dev

   # In the server directory (Backend)
   npm run dev
   ```

## 🛡️ Use Cases

- **Banking & Fintech:** Seamlessly integrate fraud detection into banking portals.
- **E-commerce:** Verify high-value transactions before processing.
- **Personal Security:** Empower individuals to check suspicious SMS alerts and unexpected debits.

## 📄 License

This project is licensed under the MIT License.
