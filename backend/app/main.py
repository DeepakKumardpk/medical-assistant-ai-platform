from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import actions, appointments, auth, chats, doctor, uploads

app = FastAPI(title="Medical AI Platform API")

# Iteration-1 scope: frontend is dev-only (Vite on a different port) and the
# VM deploy has no public frontend origin yet (Caddy/reverse-proxy not built
# yet), so allowing all origins is fine for now -- revisit once there's a
# real frontend origin to lock this down to.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(chats.router, prefix="/api/v1")
app.include_router(uploads.router, prefix="/api/v1")
app.include_router(doctor.router, prefix="/api/v1")
app.include_router(appointments.router, prefix="/api/v1")
app.include_router(actions.router, prefix="/api/v1")


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}
