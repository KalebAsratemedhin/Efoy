from fastapi import FastAPI
from app.api.v1.endpoints import (
    user,
    booking,
    auth,
    doctor,
    comment,
    rating,
    dashboard,
    video,
    prescription,
    payment,
    notification,
    doctor_board,
    doctor_qa,
    reaction,
)
from app.db.session import initiate_database
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.core.bootstrap import ensure_admin_user
from fastapi.openapi.utils import get_openapi
from app.core.rate_limiter import rate_limit_middleware
from app.core.exceptions import setup_exception_handlers

settings = get_settings()

app = FastAPI(title="Efoy Hospital Appointment Manager API")

# Setup exception handlers
setup_exception_handlers(app)

# Single CORS middleware that handles both HTTP and WebSocket
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.CLIENT_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def on_startup():
    await initiate_database()
    await ensure_admin_user()

@app.get("/")
async def root():
    return {"message": "Efoy Hospital Appointment Manager API", "status": "running"}

app.include_router(user.router, prefix="/api/v1/user", tags=["User"])
app.include_router(booking.router, prefix="/api/v1/booking", tags=["Booking"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(doctor.router, prefix="/api/v1/doctor", tags=["Doctor"])
app.include_router(comment.router, prefix="/api/v1/comment", tags=["Comment"])
app.include_router(rating.router, prefix="/api/v1/rating", tags=["Rating"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["Dashboard"])
app.include_router(video.router, prefix="/api/v1/video", tags=["Video"])
app.include_router(prescription.router, prefix="/api/v1/prescription", tags=["Prescription"])
app.include_router(payment.router, prefix="/api/v1/payment", tags=["Payment"])
app.include_router(notification.router, prefix="/api/v1/notification", tags=["Notification"])
app.include_router(doctor_board.router, prefix="/api/v1/doctor-board", tags=["Doctor Board"])
app.include_router(doctor_qa.router, prefix="/api/v1/doctor-qa", tags=["Doctor Q&A"])
app.include_router(reaction.router, prefix="/api/v1/reactions", tags=["Reactions"])

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title=app.title,
        version="1.0.0",
        description="Efoy Hospital Appointment Manager API",
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }
    for path in openapi_schema["paths"].values():
        for method in path.values():
            method.setdefault("security", []).append({"BearerAuth": []})
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi 

