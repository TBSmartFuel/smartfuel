from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models.models import Question, UserResponse
from .questions import QUESTIONS_SEED
from sqlalchemy import text

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def run_all_seeds():
    db = next(get_db())
    try:
        # Check if questions already exist
        initial_count = db.query(Question).count()
        print(f"Current question count: {initial_count}")
        
        if initial_count == 0:
            print("No questions found. Starting fresh seeding...")
            print(f"About to seed {len(QUESTIONS_SEED)} questions")
            
            # Create new questions
            print("Creating new questions...")
            for question_data in QUESTIONS_SEED:
                question = Question(**question_data)
                db.add(question)
            
            db.commit()
            
            # Verify seeding
            final_count = db.query(Question).count()
            print(f"Final question count: {final_count}")
            
            if final_count != len(QUESTIONS_SEED):
                print("WARNING: Number of questions in database doesn't match seed data!")
                print(f"Expected {len(QUESTIONS_SEED)} questions but found {final_count}")
                return
            
            print("Database seeding completed successfully!")
        else:
            print(f"Questions already exist in database. Skipping seeding.")
        
    except Exception as e:
        print(f"Error during operation: {str(e)}")
        db.rollback()
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    run_all_seeds() 