from db_model import Ingredient,RecipeIngredient
from sqlalchemy.orm import Session
from sqlalchemy import select
from pydantic import BaseModel,ConfigDict,Field

## request model 
class IngredientRequest(BaseModel):
    name:str = Field(min_length=1)
    unit:str
    model_config = ConfigDict(str_strip_whitespace=True)

## response model 
class IngredientResponse(BaseModel):
    id:int
    name:str
    unit:str
    model_config = ConfigDict(from_attributes= True)

def get_all_ingredients(db:Session):
    stmt = select(Ingredient)
    result = db.execute(stmt)
    ingredients = result.scalars().all()
    return ingredients

def get_specific_ingredient(id:int, db:Session):
    ingredient = db.get(Ingredient,id)
    return ingredient

def add_ingredient(ingredient:IngredientRequest,db:Session):
    new_ingredient = Ingredient(name = ingredient.name,unit = ingredient.unit)
    db.add(new_ingredient)
    db.commit()
    db.refresh(new_ingredient)
    return new_ingredient

## None -> ingredient does not exist, true for successful deletion while false is for if the recipe is using it
def remove_ingredient(id:int,db:Session):
    ingredient_details = db.get(Ingredient,id)
    if ingredient_details is None:
        return None
    #delete if unused 
    stmt = select(RecipeIngredient).where(RecipeIngredient.ingredient_id==ingredient_details.id)
    result = db.execute(stmt).scalar()
    if result is None: 
        db.delete(ingredient_details)
        db.commit()
        return True
    else: 
        return False 