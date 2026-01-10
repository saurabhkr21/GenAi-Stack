from fastapi import FastAPI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from .database import engine, Base
from .api import workflows, upload, chat
from .auth import router as auth_router
from prometheus_fastapi_instrumentator import Instrumentator
import logging
from pythonjsonlogger import jsonlogger
import sys
import sys

# Configure Structured Logging
logger = logging.getLogger()
logHandler = logging.StreamHandler(sys.stdout)
formatter = jsonlogger.JsonFormatter()
logHandler.setFormatter(formatter)
logger.addHandler(logHandler)
logger.setLevel(logging.INFO)

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Workflow Engine API")

# Instrument Prometheus
Instrumentator().instrument(app).expose(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(workflows.router, prefix="/api")
app.include_router(upload.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(auth_router.router, prefix="/api")

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Workflow Engine Running"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
