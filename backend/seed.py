import os
import sys
from pathlib import Path

# Add the project root directory to Python path
project_root = Path(__file__).parent
sys.path.append(str(project_root))

from app.seeds.run_seeds import run_all_seeds

if __name__ == "__main__":
    run_all_seeds() 