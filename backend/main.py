from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# Import routers will be added here later

app = FastAPI()

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    from database import verify_conn
    await verify_conn()

@app.get("/")
async def root():
    return {"message": "FastAPI Backend is running"}

# Include Routers
from routers import livelaw, ichr, general, alerts

app.include_router(livelaw.router)
app.include_router(ichr.router)
app.include_router(general.router)
app.include_router(alerts.router)
