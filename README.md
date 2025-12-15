# DSA Day Planner (Gemini)

A minimal, one-shot daily study planner for Data Structures and Algorithms, powered by Google's Gemini 2.5 Flash Lite.

## 🚀 Overview
This application generates a strict, logic-driven study schedule for a single day based on your available time, topic of interest, and skill level. It uses a secure Next.js API route to interact with the Gemini API, ensuring your API key remains hidden.

## 🛠️ Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Framer Motion
- **AI Model**: Google Gemini 2.5 Flash Lite (`gemini-2.5-flash-lite`)
- **State Management**: React Hooks (`useState`)
- **HTTP Client**: Axios

## 🔑 Setup Instructions

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/noviciusss/Dsa_sprintt.git
    cd Dsa_sprintt
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Variables**:
    Create a `.env.local` file in the root directory and add your Gemini API Key:
    ```env
    GEMINI_API_KEY=your_actual_api_key_here
    GEMINI_MODEL=gemini-2.5-flash-lite
    ```

4.  **Run Locally**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view the app.

## ⚠️ API Key Usage Disclaimer
**IMPORTANT**: This project requires a valid Google Gemini API Key. The key is used securely on the server side via Next.js API Routes and is **never** exposed to the client browser. Do not commit your `.env.local` file to version control.

## ⚡ Caching Strategy
To conserve API quota, generated plans are cached in-memory for **6 hours**. Repeated requests for the same topic, time, and difficulty will return the cached result instantly.
