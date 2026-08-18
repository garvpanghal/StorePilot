from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from app.db.session import get_db
from app.api.deps import get_current_store_id
from app.services import ai_service

router = APIRouter(prefix="/api/ai", tags=["AI"])


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str
    ai_available: bool


class ChartExplainRequest(BaseModel):
    chart_type: str
    chart_data: dict


@router.get("/status")
def ai_status():
    return {"available": ai_service.is_ai_available()}


@router.post("/chat", response_model=ChatResponse)
def chat(
    data: ChatRequest,
    db: Session = Depends(get_db),
    store_id: int = Depends(get_current_store_id),
):
    response = ai_service.chat(db, data.message, store_id)
    return ChatResponse(response=response, ai_available=ai_service.is_ai_available())


@router.get("/health-score")
def health_score(db: Session = Depends(get_db), store_id: int = Depends(get_current_store_id)):
    return ai_service.get_health_score(db, store_id)


@router.get("/executive-summary")
def executive_summary(db: Session = Depends(get_db), store_id: int = Depends(get_current_store_id)):
    return {"summary": ai_service.get_executive_summary(db, store_id)}


@router.post("/explain-chart")
def explain_chart(
    data: ChartExplainRequest,
    db: Session = Depends(get_db),
    _user: int = Depends(get_current_store_id),
):
    return {"explanation": ai_service.explain_chart(db, data.chart_type, data.chart_data)}


@router.get("/recommendations")
def recommendations(db: Session = Depends(get_db), store_id: int = Depends(get_current_store_id)):
    return {"recommendations": ai_service.get_recommendations(db, store_id)}
