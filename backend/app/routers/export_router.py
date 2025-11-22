from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Project, User
from ..auth import get_current_user
from ..services.docx_service import create_docx
from ..services.pptx_service import create_pptx
import io

router = APIRouter(prefix="/export", tags=["export"])

@router.get("/{project_id}")
def export_document(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Get all sections ordered
    sections = sorted(project.sections, key=lambda x: x.order_index)
    sections_data = [{'title': s.title, 'content': s.content or ''} for s in sections]
    
    if project.document_type == "docx":
        file_bytes = create_docx(project.title, sections_data)
        filename = f"{project.title}.docx"
        media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    else:  # pptx
        file_bytes = create_pptx(project.title, sections_data)
        filename = f"{project.title}.pptx"
        media_type = "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    
    return StreamingResponse(
        io.BytesIO(file_bytes),
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
