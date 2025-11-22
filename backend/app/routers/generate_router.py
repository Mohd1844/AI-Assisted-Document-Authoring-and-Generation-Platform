from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from ..database import get_db
from ..models import Project, Section, Refinement, User
from ..auth import get_current_user
from ..services.llm_service import generate_content, generate_outline, refine_section

router = APIRouter(prefix="/generate", tags=["generation"])

# --- SCHEMAS ---
class GenerateOutlineRequest(BaseModel):
    project_id: int

class GenerateContentRequest(BaseModel):
    section_id: int

class RefineRequest(BaseModel):
    section_id: int
    prompt: str
    feedback: str = None
    comment: str = None

# --- Generate outline for a project ---
@router.post("/outline")
def generate_document_outline(
    request: GenerateOutlineRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(
        Project.id == request.project_id,
        Project.user_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    headings = generate_outline(project.topic, project.document_type)
    return {"headings": headings}

# --- Generate content for a single section ---
@router.post("/content")
def generate_section_content(
    request: GenerateContentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    section = db.query(Section).join(Project).filter(
        Section.id == request.section_id,
        Project.user_id == current_user.id
    ).first()
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")

    project = section.project
    context = f"Document topic: {project.topic}\nSection: {section.title}"
    prompt = f"Write detailed content for the section titled '{section.title}'"
    content = generate_content(prompt, context)

    # Debug print
    print(f"[GEN] Section: {section.title} | Output: {content}")

    # Fallback for empty content (for dev/testing)
    if not content or not content.strip():
        content = f"[Sample AI content for '{section.title}']"

    section.content = content
    db.commit()
    return {
        "section_id": section.id,
        "title": section.title,
        "content": content
    }

# --- Refine section content ---
@router.post("/refine")
def refine_content(
    request: RefineRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    section = db.query(Section).join(Project).filter(
        Section.id == request.section_id,
        Project.user_id == current_user.id
    ).first()
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")

    refined_content = refine_section(section.content, request.prompt)

    # Debug print
    print(f"[REFINE] Section: {section.title} | Prompt: {request.prompt} | Output: {refined_content}")

    # Fallback for empty refined content
    if not refined_content or not refined_content.strip():
        refined_content = f"[Refined sample for '{section.title}': {request.prompt}]"

    refinement = Refinement(
        section_id=section.id,
        prompt=request.prompt,
        refined_content=refined_content,
        feedback=request.feedback,
        comment=request.comment
    )
    db.add(refinement)
    section.content = refined_content
    db.commit()
    return {
        "section_id": section.id,
        "title": section.title,
        "refined_content": refined_content
    }

# --- Bulk generate content for all sections in a project ---
@router.post("/project/{project_id}/generate")
def generate_all_sections(
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

    sections = db.query(Section).filter(Section.project_id == project.id).all()
    if not sections:
        raise HTTPException(status_code=404, detail="No sections found for this project")

    results = []
    for section in sections:
        context = f"Document topic: {project.topic}\nSection: {section.title}"
        prompt = f"Write detailed content for the section titled '{section.title}'"
        content = generate_content(prompt, context)

        # Debug print for generation
        print(f"[BULK GEN] Section: {section.title} | Output: {content}")

        # Fallback for empty content (for dev/testing)
        if not content or not content.strip():
            content = f"[Sample content for '{section.title}']"

        section.content = content
        results.append({
            "section_id": section.id,
            "title": section.title,
            "content": content
        })
    db.commit()

    return {"result": "success", "sections": results}
