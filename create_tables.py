from db_model import Base
from database import engine
Base.metadata.create_all(engine)