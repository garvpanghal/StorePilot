from pydantic import BaseModel
from typing import Optional, List, Any


class ReportRow(BaseModel):
    """Generic report row — columns vary by report type."""
    data: dict


class ReportResponse(BaseModel):
    title: str
    columns: List[str]
    rows: List[dict]
    summary: dict = {}
