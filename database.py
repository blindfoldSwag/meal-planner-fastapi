from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "sqlite:///meal_planner.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind = engine)
