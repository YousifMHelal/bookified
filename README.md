# 📚 Bookified

> A voice-first AI book companion platform that lets you have real-time conversations with your books.

![Next.js](https://img.shields.io/badge/-Next.js_16-000000?style=for-the-badge&logo=Next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=for-the-badge&logo=TypeScript&logoColor=white)
![MongoDB](https://img.shields.io/badge/-MongoDB-47A248?style=for-the-badge&logo=MongoDB&logoColor=white)
![Tailwind](https://img.shields.io/badge/-Tailwind-06B6D4?style=for-the-badge&logo=Tailwind-CSS&logoColor=white)
![Clerk](https://img.shields.io/badge/-Clerk-6C47FF?style=for-the-badge&logo=Clerk&logoColor=white)

---

## 📋 Table of Contents

- [Introduction](#-introduction)
- [Tech Stack](#️-tech-stack)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [Live Demo](#-live-demo)

---

## ✨ Introduction

**Bookified** is an AI-powered platform that transforms your PDF books into interactive conversational entities. Upload any PDF, choose an AI voice persona, and have a natural real-time voice dialogue with your book — ask questions, request summaries, and explore concepts hands-free.

Built with **Next.js 16**, **Vapi** for real-time voice AI, **ElevenLabs** for lifelike voice synthesis, and **MongoDB** for persistent storage. The app features live transcripts, a personal library manager, and a sleek interface powered by Shadcn UI and Tailwind CSS.

---

## ⚙️ Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 16** | Full-stack React framework — handles SSR, API routes, and app logic |
| **TypeScript** | Static typing for maintainable, robust code |
| **Vapi** | Real-time, low-latency voice AI for conversational interactions |
| **ElevenLabs** | Lifelike AI text-to-speech for voice persona previews |
| **MongoDB + Mongoose** | NoSQL database for storing books, metadata, and transcripts |
| **Clerk** | Authentication — email/social login, session management, protected routes |
| **Shadcn UI** | Accessible, reusable component library built on Tailwind + Radix UI |
| **Tailwind CSS** | Utility-first CSS framework for responsive styling |
| **Google Gemini** | Generates high-dimensional text embeddings for context retrieval |
| **Vercel Blob** | Cloud storage for uploaded PDF files |

---

## 🔋 Features

- **📄 PDF Upload & Ingestion** — Upload PDF books with automated text extraction, intelligent chunking, and high-dimensional embeddings for precise context retrieval.

- **🎙️ Voice-First Conversations** — Engage in natural, real-time voice dialogues with your books via Vapi. Ask questions, explore complex concepts, and get answers verbally.

- **🧠 AI Voice Personas** — Select from a variety of distinct AI personalities and preview them in high-fidelity audio powered by ElevenLabs before starting a session.

- **📝 Smart Summaries & Insights** — Request chapter summaries or deep-dive explanations to make long-form content more accessible.

- **📜 Session Transcripts** — Auto-generated text transcripts of every voice interaction so you never lose a key insight.

- **📚 Library Management** — Organize and search your personal uploads or browse the global book collection with a high-performance search interface.

- **🔐 Auth & User Management** — Secure access via Clerk with email and social login options, plus protected routes and session handling.

---

## 📁 Project Structure

```
bookified/
├── app/                    # Next.js App Router — pages and API routes
├── components/             # Reusable UI components (Shadcn-based)
├── database/               # Mongoose models and DB connection logic
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions and third-party integrations
├── public/                 # Static assets
├── types.d.ts              # Global TypeScript type definitions
├── proxy.ts                # Vapi proxy configuration
├── next.config.ts          # Next.js configuration
└── tsconfig.json           # TypeScript configuration
```

---

## 🚀 Quick Start

### Prerequisites

Make sure you have the following installed:

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en) (v18+)
- [npm](https://www.npmjs.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/YousifMHelal/bookified.git
cd bookified
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory and add the following:

```env
NODE_ENV='development'
NEXT_PUBLIC_BASE_URL=

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=

# MongoDB
MONGODB_URI=

# Vapi (Voice AI)
NEXT_PUBLIC_VAPI_API_KEY=
VAPI_SERVER_SECRET=

```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables

| Variable | Where to Get It |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` | [clerk.com](https://clerk.com) |
| `BLOB_READ_WRITE_TOKEN` | [vercel.com](https://vercel.com) — Storage tab |
| `MONGODB_URI` | [mongodb.com](https://www.mongodb.com) — Atlas connection string |
| `NEXT_PUBLIC_VAPI_API_KEY` / `VAPI_SERVER_SECRET` | [vapi.ai](https://vapi.ai) |


---

## 🌐 Live Demo

Check out the live deployment: [spoken-pages.vercel.app](https://bookified-bay.vercel.app/)

---

## 📄 License

This project is open source. Feel free to fork, modify, and build upon it.
