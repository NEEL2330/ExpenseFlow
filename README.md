📝 ExpenseFlow

A modern, AI-powered personal finance assistant that automatically records, categorizes, and analyzes your expenses directly from WhatsApp and Telegram messages. No more spreadsheets or manual data entry—just chat naturally with ExpenseFlow.

**FastAPI • React • Tailwind CSS • SQLAlchemy • Groq AI**

## ✨ Features

- **🚀 AI-Powered Extraction**: Automatically extracts amount, category, payment method, date, and time from natural language messages.
- **💬 Chat Integration**: Works seamlessly with Telegram and WhatsApp bots.
- **📊 Visual Dashboard**: Beautiful, responsive dashboard with interactive charts and analytics using Recharts.
- **⚡ Fast Performance**: Vite-powered React frontend and high-performance FastAPI backend.
- **🗄️ Persistent Storage**: Relational database integration (MySQL/PostgreSQL) with SQLAlchemy ORM.
- **🛡️ Security**: Robust JWT Authentication (python-jose & passlib) and secure API endpoints.
- **🐳 Docker Ready**: Containerized deployment options for the backend.

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- Python (3.10 or higher)
- MySQL or PostgreSQL database
- Groq API Key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ExpenseFlow.git
   cd ExpenseFlow
   ```

2. **Backend Setup**
   ```bash
   cd backend
   
   # Create and activate virtual environment
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   # source venv/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Set up environment variables
   cp .env.example .env
   # Edit .env and add your DATABASE_URL, GROQ_API_KEY, etc.
   
   # Start the FastAPI development server
   uvicorn app.main:app --reload
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   
   # Install all dependencies
   npm install
   
   # Set up environment variables
   cp .env.example .env
   # Edit .env and set your backend API URL if needed
   
   # Start the Vite development server
   npm run dev
   ```


## 📁 Project Structure

```text
ExpenseFlow/
├── 📁 backend/                 # FastAPI server
│   ├── 📁 app/
│   │   ├── 📁 routers/         # API endpoints (webhook, ask_ai, etc.)
│   │   ├── 📄 database.py      # Database connection & config
│   │   ├── 📄 models.py        # SQLAlchemy schemas
│   │   ├── 📄 ai_tools.py      # Groq AI extraction logic
│   │   └── 📄 main.py          # Main FastAPI application
│   ├── 📄 Dockerfile           # Backend container config
│   └── 📄 requirements.txt     # Python dependencies
├── 📁 frontend/                # React application
│   ├── 📁 src/
│   │   ├── 📁 components/      # Reusable UI components (Sidebar, TopBar, LandingPage)
│   │   ├── 📁 context/         # React Context (AuthContext)
│   │   └── 📄 App.jsx          # Main application routing
│   ├── 📄 package.json         # Frontend dependencies & scripts
│   └── 📄 vite.config.js       # Vite bundler configuration
└── 📄 n8n-workflow.json        # n8n automation workflow
```

## 🔌 API Endpoints (Examples)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ask_ai` | Process natural language expense queries |
| POST | `/api/webhook/telegram` | Receive and process Telegram messages |
| POST | `/api/login` | Authenticate user and return JWT |
| GET | `/api/expenses` | Retrieve user's expense history |

## 🛠️ Tech Stack

**Frontend**
- **React 19** - Modern UI library
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Composable charting library
- **Axios** - HTTP client
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icons

**Backend**
- **FastAPI** - Modern, fast web framework for APIs
- **SQLAlchemy** - Python SQL toolkit and ORM
- **PyMySQL / Psycopg2** - Database drivers
- **Groq API** - Ultra-fast AI inference
- **python-jose & passlib** - JWT and password hashing
- **Uvicorn** - ASGI web server implementation

## 🐳 Docker Deployment

You can run the backend easily using Docker:

```bash
cd backend
docker build -t expenseflow-backend .
docker run -p 8000:8000 --env-file .env expenseflow-backend
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Groq** - For providing incredibly fast AI inference.
- **FastAPI** & **React** - The awesome frameworks used.
- **Tailwind CSS** - For the beautiful utility classes.

---
Made with ❤️ using FastAPI and React