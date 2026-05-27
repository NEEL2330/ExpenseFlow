import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base

# Create all tables automatically on startup (since we removed Alembic)
Base.metadata.create_all(bind=engine)
app = FastAPI(
    title="ExpenseFlow API",
    description="AI-powered conversational expense tracker",
    version="0.1.0",
)

# Parse frontend URLs from the environment variable (defaulting to localhost if not set)
frontend_urls = os.getenv("FRONTEND_URLS", "http://localhost:5173,http://localhost:3000")
origins = [url.strip() for url in frontend_urls.split(",") if url.strip()]

# CORS middleware — allow the React frontend to talk to the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Welcome to ExpenseFlow API 🚀"}


@app.get("/health")
def health_check():
    return {"status": "healthy", "version": "0.1.0"}

@app.get("/test-db")
def test_db_connection():
    try:
        # We create a new connection to test it
        with engine.connect() as connection:
            # We don't need to do anything complex, just connecting is enough
            # But let's execute a simple query for good measure
            from sqlalchemy import text
            result = connection.execute(text("SELECT 1"))
            return {"status": "success", "message": "Successfully connected to the MySQL database!"}
    except Exception as e:
        return {"status": "error", "message": f"Failed to connect to database: {str(e)}"}
