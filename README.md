<div align="center">

# 🛡️ AI Content Moderator

### Intelligent AI-Powered Content Moderation System

*A robust, full-stack application designed to automatically detect and flag harmful content using advanced Large Language Models. Built for precision, security, and scalability.*

[![FastAPI](https://img.shields.io/badge/FastAPI-05998B?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Gemini API](https://img.shields.io/badge/Gemini_API-121212?style=flat-square&logo=google-gemini)](https://ai.google.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-06B6D4?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Database Schema](#-database-schema)
- [Getting Started](#-getting-started)
- [API Endpoints](#-api-endpoints)
- [Screenshots](#-screenshots)
- [Future Enhancements](#-future-enhancements)
- [Author](#-author)

---

## 🌿 Overview

**AI Content Moderator** is a comprehensive solution designed to protect digital platforms by analyzing user-uploaded images for potential safety violations. By integrating the Gemini API, the platform provides real-time, algorithmic content analysis to categorize and flag harmful media before it hits your database.

The application ensures safety through a multi-tiered filtering system, offering administrators full control over moderation policies and confidence thresholds.

The platform is built around three core pillars:

- **Automated Detection** — Gemini-powered vision analysis classifies uploaded images across multiple sensitive content categories.
- **Policy-Driven Enforcement** — Admins configure confidence thresholds and choose between flagging or auto-blocking content.
- **Centralized Review** — A unified dashboard for monitoring submissions, reviewing flagged items, and auditing moderation decisions.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🤖 **AI-Driven Analysis** | Utilizes state-of-the-art Gemini LLM vision capabilities to analyze images across multiple sensitive categories. |
| ⚙️ **Configurable Policies** | Administrators can dynamically adjust confidence thresholds and enforcement behaviors (Flag vs. Auto-Block). |
| 📊 **Unified Dashboard** | An intuitive interface for monitoring, reviewing, and managing flagged content submissions. |
| 🛡️ **Role-Based Security** | Secure JWT-based authentication ensures only authorized personnel can manage moderation policies. |
| 🚀 **High-Performance Pipeline** | Asynchronous image processing with intelligent retry logic and fallback safety mechanisms. |
| 📁 **Submission History** | Persistent storage of past submissions and their moderation outcomes for auditing and trend analysis. |

---

## 🏗️ System Architecture

AI Content Moderator follows a decoupled **Client-Server** architecture optimized for asynchronous AI processing:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Backend       │────▶│   Database      │
│   (React)       │     │   (FastAPI)     │     │   (MongoDB)     │
│                 │◀────│                 │◀────│                 │
│ • Upload UI     │     │ • Auth (JWT)    │     │ • Submissions   │
│ • Dashboard     │     │ • Moderation    │     │ • Policies      │
│ • Policy Config │     │   Pipeline      │     │ • User Roles    │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                        ┌────────▼────────┐
                        │   AI Layer      │
                        │ (Gemini Vision) │
                        │ • Classify      │
                        │ • Confidence    │
                        │ • Fail-Safe     │
                        └─────────────────┘
```

- **Frontend (React):** Handles image uploads, dashboard rendering, and policy configuration via Tailwind CSS.
- **Backend (FastAPI):** Performs request validation, authentication, and orchestrates the moderation pipeline.
- **AI Layer (Gemini API):** Analyzes submitted images against configured categories and returns confidence-scored classifications, with a fail-safe fallback if the service is unreachable.
- **Database (MongoDB):** Stores user accounts, submission records, moderation results, and policy configuration documents.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React, Vite, Tailwind CSS, Axios |
| **Backend** | FastAPI (Python), Uvicorn |
| **Containerization** | Docker, Docker Compose |
| **Database** | MongoDB |
| **AI/ML** | Google Gemini API (Vision) |
| **Authentication** | JWT, Bcrypt |

---

## 🗄️ Database Schema

The application uses a MongoDB document structure managed through Python data models:

```python
# Core Collections Representation

User {
    "_id":       ObjectId,
    "name":      str,
    "email":     str,        # unique
    "password":  str,        # bcrypt hash
    "role":      str,        # "ADMIN" | "MODERATOR"
}

Submission {
    "_id":         ObjectId,
    "imageData":   str,       # Base64 encoded string
    "fileName":    str,
    "status":      str,       # "PENDING" | "FLAGGED" | "BLOCKED" | "APPROVED"
    "categories":  list,      # e.g. ["violence", "nudity"]
    "confidence":  float,     # 0.0 - 1.0
    "submittedBy": ObjectId,  # ref -> User
    "createdAt":   datetime,
}

Policy {
    "_id":          ObjectId,
    "category":     str,      # e.g. "violence"
    "threshold":     float,    # confidence threshold
    "action":        str,      # "FLAG" | "AUTO_BLOCK"
    "updatedBy":     ObjectId, # ref -> User
}
```

---

## 🚀 Getting Started

### Prerequisites

Ensure the following are installed before running the project:

- [Node.js](https://nodejs.org/) (v18+)
- [Python](https://www.python.org/) (v3.10+)
- [MongoDB](https://www.mongodb.com/)

### Installation

**1. Clone the Repository**

```bash
git clone https://github.com/ZainAbbas-dev/ai-content-moderator.git
cd ai-content-moderator
```

**2. Backend Setup**

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file inside the `/backend` directory:

```env
MONGO_URI="mongodb://localhost:27017/ai-content-moderator"
GEMINI_API_KEY="your_gemini_api_key"
JWT_SECRET="your_secret_key"
PORT=8000
```

Run the development server:

```bash
uvicorn main:app --reload --port 8000
```

**3. Frontend Setup**

```bash
cd ../frontend
npm install
npm run dev
```

The application will be live at **http://localhost:5173**.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Creates a new account, hashes the password, and assigns a user role |
| `POST` | `/api/auth/login` | Authenticates a user and returns a JWT with role information |
| `POST` | `/api/moderate` | Submits an image for AI-based moderation and returns the classification result |
| `GET` | `/api/submissions` | Fetches all moderation submissions, with optional status filtering |
| `GET` | `/api/submissions/:id` | Retrieves details of a specific submission |
| `GET` | `/api/policies` | Returns the current set of moderation policies and thresholds |
| `PUT` | `/api/policies/:category` | Updates the confidence threshold and enforcement action for a category |

---

## 📸 Screenshots

| Screen | Preview |
|---|---|
| Sign Up Screen | ![Sign Up Screen](./screenshots/signup.png) |
| Login Screen | ![Login Screen](./screenshots/login.png) |
| Upload & Moderation Result | ![Upload and Result](./screenshots/upload-result.png) |
| Moderation Dashboard | ![Moderation Dashboard](./screenshots/dashboard.png) |
| Policy Configuration | ![Policy Configuration](./screenshots/policy-config.png) |
| Submission History | ![Submission History](./screenshots/submission-history.png) |

---

## 🔮 Future Enhancements

- 📝 **Text Moderation** — Extend the pipeline to analyze user-submitted text alongside images.
- 🎥 **Video Frame Sampling** — Support moderation of video uploads by sampling and analyzing key frames.
- 🔔 **Real-Time Alerts** — WebSocket-based notifications for moderators when high-confidence violations are flagged.
- 📈 **Analytics Dashboard** — Visual trend reporting on flagged content volume, category breakdown, and moderator activity.
- 🌍 **Multi-language Support** — Localization of the moderation dashboard for broader accessibility.

---

## 👨‍💻 Author

**Muhammad Zain Abbas**

> *Computer Science Student · Full Stack Developer & Aspiring Machine Learning Engineer*
>
> Passionate about building robust, practical software solutions that prioritize structural correctness and intelligent algorithmic design.

📧 [iamzainabbass@gmail.com](mailto:iamzainabbass@gmail.com)
🐙 [GitHub](https://github.com/ZainAbbas-dev)

---

<div align="center">

*If you found this project useful, consider giving it a ⭐ on GitHub!*

</div>