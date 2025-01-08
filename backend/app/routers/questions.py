from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.models import Question, User, UserResponse
from ..schemas.question import QuestionCreate, QuestionResponse, SaveResponseRequest, UserResponseSchema
from ..services.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=QuestionResponse)
async def create_question(
    question: QuestionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new question (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can create questions"
        )
    
    db_question = Question(**question.dict())
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question

@router.get("/", response_model=List[QuestionResponse])
async def get_questions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all questions"""
    try:
        questions = db.query(Question).filter(Question.is_active == True).offset(skip).limit(limit).all()
        print(f"Found {len(questions)} questions")
        return questions
    except Exception as e:
        print(f"Error fetching questions: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching questions: {str(e)}"
        )

@router.get("/{question_id}", response_model=QuestionResponse)
async def get_question(
    question_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific question by ID"""
    question = db.query(Question).filter(Question.id == question_id, Question.is_active == True).first()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    return question

@router.put("/{question_id}", response_model=QuestionResponse)
async def update_question(
    question_id: int,
    question_update: QuestionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a question (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can update questions"
        )
    
    db_question = db.query(Question).filter(Question.id == question_id).first()
    if not db_question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    for key, value in question_update.dict().items():
        setattr(db_question, key, value)
    
    db.commit()
    db.refresh(db_question)
    return db_question

@router.delete("/{question_id}")
async def delete_question(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Soft delete a question (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete questions"
        )
    
    db_question = db.query(Question).filter(Question.id == question_id).first()
    if not db_question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    db_question.is_active = False
    db.commit()
    return {"message": "Question deleted successfully"}

@router.post("/responses")
async def save_responses(
    request: SaveResponseRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Save user responses for questions"""
    try:
        # Delete existing responses for these questions
        question_ids = [response.question_id for response in request.responses]
        db.query(UserResponse).filter(
            UserResponse.user_id == current_user.id,
            UserResponse.question_id.in_(question_ids)
        ).delete(synchronize_session=False)
        
        # Create new responses
        for response in request.responses:
            db_response = UserResponse(
                user_id=current_user.id,
                question_id=response.question_id,
                response_value=response.answer
            )
            db.add(db_response)
        
        db.commit()
        return {"message": "Responses saved successfully"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error saving responses: {str(e)}"
        ) 

@router.get("/user-responses", response_model=List[UserResponseSchema])
async def get_user_responses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all responses for the current user"""
    try:
        # Get user responses and convert to schema format
        db_responses = db.query(UserResponse).filter(
            UserResponse.user_id == current_user.id
        ).all()
        
        # Map database model to response schema
        responses = []
        for response in db_responses:
            try:
                print(f"Converting response {response.id}:")
                print(f"  - question_id: {response.question_id}")
                print(f"  - response_value (raw): {response.response_value}")
                print(f"  - response_value type: {type(response.response_value)}")
                
                # Get the question text for this response
                question = db.query(Question).filter(Question.id == response.question_id).first()
                if question:
                    print(f"  - question_text: {question.text}")
                    print(f"  - is_fullname: {question.text == 'What is your full name?'}")
                
                responses.append(UserResponseSchema(
                    question_id=response.question_id,
                    answer=response.response_value
                ))
            except Exception as e:
                print(f"Error converting response {response.id}: {str(e)}")
                continue
        
        return responses
    except Exception as e:
        print(f"Error fetching user responses: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching user responses: {str(e)}"
        ) 