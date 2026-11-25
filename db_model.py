from sqlalchemy.orm import DeclarativeBase,mapped_column,Mapped,relationship
from sqlalchemy import ForeignKey
from datetime import date

class Base(DeclarativeBase):
    pass

class Ingredient(Base):
    __tablename__ = "ingredients"
    id : Mapped[int] = mapped_column(primary_key=True)
    name:Mapped[str] = mapped_column(unique=True)
    unit:Mapped[str]
    pantry  = relationship("Pantry",cascade="all,delete-orphan",back_populates="ingredient",uselist=False)

class Recipe(Base):
    __tablename__ = "recipes"
    id:Mapped[int] = mapped_column(primary_key=True)
    name:Mapped[str] = mapped_column(unique= True)
    servings:Mapped[int]
    instructions:Mapped[str]
    recipe_ingredients: Mapped[list["RecipeIngredient"]] = relationship("RecipeIngredient",back_populates="recipe",cascade="all,delete-orphan"                                                          
)
    meal = relationship("MealPlan",back_populates="recipe")

class RecipeIngredient(Base):
    __tablename__ = "recipeingredient"
    recipe_id:Mapped[int] = mapped_column(ForeignKey("recipes.id"),primary_key=True)
    ingredient_id:Mapped[int] = mapped_column(ForeignKey("ingredients.id"),primary_key=True)
    quantity:Mapped[float]
    recipe = relationship("Recipe",back_populates="recipe_ingredients")
    ingredient = relationship("Ingredient")

class MealPlan(Base):
    __tablename__ = "meals"
    id:Mapped[int] = mapped_column(primary_key=True)
    date:Mapped[date]
    meal_type:Mapped[str] 
    recipe_id:Mapped[int|None] = mapped_column(ForeignKey("recipes.id"))
    recipe = relationship("Recipe",back_populates="meal")

class Pantry(Base):
    __tablename__ = "pantry"
    ingredient_id:Mapped[int] = mapped_column(ForeignKey("ingredients.id"),primary_key=True)
    quantity:Mapped[float]
    ingredient = relationship("Ingredient",back_populates="pantry")


