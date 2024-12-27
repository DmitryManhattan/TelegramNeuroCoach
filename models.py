from sqlalchemy import Column, Integer, String, Date, JSON, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

Base = declarative_base()

class MoodEntry(Base):
    __tablename__ = 'mood_entries'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False)
    date = Column(Date, nullable=False)
    mood = Column(String, nullable=True)
    achievement = Column(String, nullable=True)
    goals = Column(JSON, nullable=True)

    def to_dict(self):
        return {
            'date': self.date.isoformat(),
            'mood': self.mood,
            'achievement': self.achievement,
            'goals': self.goals or ['', '', '']
        }

# Database initialization
engine = create_engine(os.environ['DATABASE_URL'])
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
def init_db():
    Base.metadata.create_all(bind=engine)
