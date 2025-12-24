# AI Video Interviewer

A complete AI-powered video interview application that conducts live interviews using voice interaction. The system analyzes resumes, determines candidate seniority levels, and conducts adaptive interviews with real-time speech-to-text and text-to-speech capabilities.

## 🎯 Features

- **Resume Processing**: Upload PDF/DOCX resumes or manually enter resume information
- **AI-Powered Analysis**: Automatically extracts skills, experience, projects, and determines seniority level
- **Live Video Interview**: Real-time video calling using LiveKit
- **Speech-to-Text**: Converts candidate speech to text using OpenAI Whisper
- **Text-to-Speech**: AI interviewer responds with natural voice using OpenAI TTS
- **Conversation Memory**: Maintains context throughout the interview
- **Adaptive Questions**: Questions adjust based on candidate level and previous answers
- **Screen Sharing**: Support for screen sharing during interviews

## 🏗️ Tech Stack

### Frontend
- React (JavaScript)
- LiveKit Client SDK
- Axios for API calls

### Backend
- Node.js with Express
- MongoDB for data storage
- OpenAI API (GPT-4, Whisper, TTS)
- LiveKit Server SDK
- pdf-parse for PDF parsing
- mammoth for DOCX parsing

## 📋 Prerequisites

- Node.js (v24 or higher)
- MongoDB (local or cloud instance)
- OpenAI API key
- LiveKit server (cloud or self-hosted)

## 🚀 Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# OpenAI API Configuration
OPENAI_API_KEY=sk-your-openai-api-key

# LiveKit Configuration
LIVEKIT_URL=wss://your-livekit-server.com
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=ai_interviewer

# Server Configuration
PORT=5000
NODE_ENV=development
```

Create a `.env` file in the `frontend` directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Set Up MongoDB

Make sure MongoDB is running:

```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env with your Atlas connection string
```

### 4. Set Up LiveKit

**Option A: Use LiveKit Cloud (Recommended)**
1. Sign up at [livekit.io](https://livekit.io)
2. Create a project and get your API key/secret
3. Use the provided WebSocket URL

**Option B: Self-Host LiveKit**
1. Follow [LiveKit deployment guide](https://docs.livekit.io/deploy/)
2. Update `LIVEKIT_URL` in `.env`

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
# or for development with auto-reload
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📁 Project Structure

```
ai-video1/
├── backend/
│   ├── routes/
│   │   ├── resume.js          # Resume upload/manual input routes
│   │   ├── interview.js       # Interview session routes
│   │   └── token.js           # LiveKit token generation
│   ├── services/
│   │   ├── resumeParser.js    # PDF/DOCX parsing
│   │   ├── llm.js             # OpenAI LLM for interview logic
│   │   ├── whisper.js         # Speech-to-text (Whisper API)
│   │   ├── tts.js             # Text-to-speech (OpenAI TTS)
│   │   ├── memory.js          # MongoDB session management
│   │   ├── livekit.js         # LiveKit token generation
│   │   └── interviewService.js # Interview orchestration
│   └── server.js              # Express server
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ResumeUpload.js      # File upload component
│   │   │   ├── ManualResumeInput.js # Manual text input
│   │   │   ├── InterviewUI.js      # Main interview interface
│   │   │   └── VideoRoom.js         # LiveKit video room
│   │   ├── App.js                   # Main app component
│   │   └── index.js                 # React entry point
│   └── public/
└── README.md
```

## 🔄 Application Flow

### 1. Resume Processing Flow

```
User uploads resume (PDF/DOCX) OR enters manual text
    ↓
Backend extracts text (pdf-parse / mammoth)
    ↓
Text sent to OpenAI GPT-4 for analysis
    ↓
Structured data extracted:
  - Skills
  - Years of experience
  - Projects
  - Technologies
  - Seniority level (junior/mid/senior)
    ↓
Data stored in MongoDB with session ID
```

### 2. Interview Flow

```
User starts interview
    ↓
LiveKit token generated
    ↓
User joins video room
    ↓
AI generates first question based on resume
    ↓
Question converted to speech (OpenAI TTS)
    ↓
Audio played in video room
    ↓
User speaks answer
    ↓
Audio recorded and sent to backend
    ↓
Speech-to-text (OpenAI Whisper)
    ↓
Answer analyzed by LLM
    ↓
Next question/feedback generated
    ↓
Response converted to speech
    ↓
Cycle continues...
```

### 3. Speech → Text → AI → Text → Speech Pipeline

```
User Audio (WebM)
    ↓
Base64 encoding
    ↓
POST /api/interview/audio
    ↓
OpenAI Whisper API (speech-to-text)
    ↓
Transcribed text
    ↓
OpenAI GPT-4 (process answer, generate response)
    ↓
AI response text
    ↓
OpenAI TTS API (text-to-speech)
    ↓
Audio buffer (MP3)
    ↓
Base64 encoding
    ↓
Sent to frontend
    ↓
Played in browser
```

## 🔧 API Endpoints

### Resume Routes

- `POST /api/resume/upload` - Upload and parse resume file
  - Body: `FormData` with `resume` file (PDF/DOCX)
  - Returns: `{ success, sessionId, resumeData }`

- `POST /api/resume/manual` - Process manually entered resume
  - Body: `{ resumeText: string }`
  - Returns: `{ success, sessionId, resumeData }`

### Interview Routes

- `POST /api/interview/start` - Start interview session
  - Body: `{ sessionId: string }`
  - Returns: `{ success, interviewSession }`

- `POST /api/interview/audio` - Process audio chunk
  - Body: `{ sessionId, audioBase64, audioFormat }`
  - Returns: `{ success, transcribedText, response, audioBase64 }`

- `GET /api/interview/session/:sessionId` - Get session data
  - Returns: `{ success, session }`

### Token Routes

- `POST /api/token/generate` - Generate LiveKit token
  - Body: `{ roomName, participantName, sessionId }`
  - Returns: `{ success, token, url }`

## 🎨 Key Components

### ResumeUpload.js
- Handles file selection and validation
- Uploads PDF/DOCX to backend
- Displays processing status

### ManualResumeInput.js
- Textarea for manual resume entry
- Sends text to backend for processing

### InterviewUI.js
- Main interview interface
- Manages audio recording
- Displays questions and transcriptions
- Coordinates with VideoRoom component

### VideoRoom.js
- LiveKit room connection
- Video/audio streaming
- Screen sharing support
- AI response audio playback

## 🧠 AI Interview Logic

The AI interviewer uses GPT-4 to:
1. **Analyze Resume**: Extract structured information
2. **Generate Questions**: Based on seniority level and skills
3. **Process Answers**: Understand candidate responses
4. **Adapt Difficulty**: Adjust questions based on performance
5. **Maintain Context**: Remember previous answers throughout interview

### Question Generation Strategy

- **Junior Level**: Focus on fundamentals, basic concepts
- **Mid Level**: Technical depth, problem-solving
- **Senior Level**: Architecture, leadership, complex scenarios

## 🔐 Security Notes

- Never expose API keys in frontend code
- All API keys stored in backend `.env`
- LiveKit tokens generated server-side
- File uploads validated and size-limited

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- Verify network connectivity

### LiveKit Connection Issues
- Verify `LIVEKIT_URL`, `LIVEKIT_API_KEY`, and `LIVEKIT_API_SECRET`
- Check LiveKit server status
- Ensure WebSocket connections are allowed

### OpenAI API Issues
- Verify `OPENAI_API_KEY` is valid
- Check API quota/limits
- Ensure sufficient credits

### Audio Recording Issues
- Grant microphone permissions in browser
- Check browser compatibility (Chrome/Firefox recommended)
- Verify MediaRecorder API support

## 📝 Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for GPT, Whisper, TTS | Yes |
| `LIVEKIT_URL` | LiveKit WebSocket URL | Yes |
| `LIVEKIT_API_KEY` | LiveKit API key | Yes |
| `LIVEKIT_API_SECRET` | LiveKit API secret | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `MONGODB_DB_NAME` | MongoDB database name | No (default: ai_interviewer) |
| `PORT` | Backend server port | No (default: 5000) |
| `REACT_APP_API_URL` | Frontend API base URL | Yes (frontend) |

## 🚧 Future Enhancements

- Real-time transcription display
- Interview recording and playback
- Interview feedback and scoring
- Multiple interview modes (technical, behavioral, etc.)
- AI interviewer avatar with lip-sync
- Multi-language support
- Interview analytics dashboard

## 📄 License

This project is provided as-is for educational and development purposes.

## 🤝 Contributing

Contributions are welcome! Please ensure code follows the existing style and includes appropriate comments.

---

**Built with ❤️ using React, Node.js, OpenAI, and LiveKit**

