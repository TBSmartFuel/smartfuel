from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .core.config import get_settings
from .routers import users, questions, meal_plans, admin
from .middleware.error_handler import error_handler_middleware
from .seeds.run_seeds import run_all_seeds
from .database import SessionLocal

settings = get_settings()

# Run seeds based on environment
print(f"Environment: {'Development' if settings.DEBUG else 'Production'}")
if settings.DEBUG:
    try:
        print("Development mode: Running database seeds...")
        run_all_seeds()
    except Exception as e:
        print(f"Warning: Database seeding failed: {str(e)}")
        print("Application will continue with existing database state")

app = FastAPI(
    title="Meal Plan Generator",
    description="API for generating personalized meal plans using AI",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add global error handler middleware
app.middleware("http")(error_handler_middleware)

# Include routers with proper prefixes
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(questions.router, prefix="/api/questions", tags=["questions"])
app.include_router(meal_plans.router, prefix="/api/meal-plans", tags=["meal-plans"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])

@app.get("/", tags=["health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "service": "meal-plan-generator"
    }

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Global HTTP exception handler"""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Global exception handler for unhandled errors"""
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "message": str(exc) if settings.DEBUG else None
        },
    )

@app.on_event("startup")
async def startup_event():
    """Run startup tasks"""
    pass 