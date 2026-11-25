# for a specific recipe we need to retrieve all information, but for normal page just some stuff. 
# schemas
from pydantic import BaseModel,ConfigDict,Field
from ingredients import IngredientResponse
from sqlalchemy.orm import Session
from db_model import Recipe,Ingredient,RecipeIngredient,MealPlan
from sqlalchemy import select
from datetime import date 
'''
Recipe Request Schema
'''
class QuantityUpdateRequest(BaseModel):
    quantity:float = Field(gt=0)

class RecipeRequest(BaseModel):
    name:str = Field(min_length=1)
    servings:int = Field(gt=0)
    instructions: str = Field(min_length=1)
    model_config = ConfigDict(str_strip_whitespace=True)

class RecipeResponseShort(BaseModel):
    id:int
    name:str
    servings:int
    model_config = ConfigDict(from_attributes=True)

class RecipeIngredientRow(BaseModel):
    quantity:float
    ingredient:IngredientResponse
    model_config = ConfigDict(from_attributes=True)

class RecipeResponseDetailed(BaseModel):
    id:int
    name:str
    servings:int
    instructions:str
    recipe_ingredients:list[RecipeIngredientRow]
    model_config = ConfigDict(from_attributes=True)

class AddIngredientToRecipeRequest(BaseModel):
    ingredient_id:int
    quantity:float = Field(gt=0)

def get_specific_recipe(id:int, db:Session):
    recipe = db.get(Recipe,id)
    return recipe

def get_all_recipes(db:Session):
    stmt = select(Recipe)
    result = db.execute(stmt)
    return result.scalars().all()

def add_recipe(recipe:RecipeRequest,db:Session):
    new_recipe = Recipe(name = recipe.name, servings = recipe.servings, instructions = recipe.instructions)
    db.add(new_recipe)
    db.commit()
    db.refresh(new_recipe)
    return new_recipe


# None-> Recipe could not be found
# False-> Recipe can't be delted, its in use in today's or upcoming meal
# True-> Deletion successful

def remove_recipe(id:int,db:Session):
    recipe_details = db.get(Recipe,id)
    if recipe_details is None: 
        return None,"Recipe Does not exist"
    get_meal_details = select(MealPlan).where(MealPlan.recipe_id==recipe_details.id,MealPlan.date>=date.today())
    meal_details = db.execute(get_meal_details).scalar()

    if meal_details is not None: 
        return False,f"Recipe in Use in upcoming Meal, date: {meal_details.date}"

    
    db.delete(recipe_details)
    db.commit()
    return True,"Deltion successful"

def add_ingredient_to_recipe(recipe_id:int,ingredient:AddIngredientToRecipeRequest,db:Session):
    recipe_details = db.get(Recipe,recipe_id)
    if recipe_details is None: 
        return (False,"Recipe")

    ingredient_details = db.get(Ingredient,ingredient.ingredient_id)
    if ingredient_details is None: 
        return (False,"Ingredient")

    recipe_ingredient_row = RecipeIngredient(recipe = recipe_details, ingredient = ingredient_details,quantity = ingredient.quantity)
    db.add(recipe_ingredient_row)
    db.commit()
    db.refresh(recipe_details)
    return (True,recipe_details)

#True : the linked row was successfully deleted
#None : Record was not found, string returned is the message to add context
def remove_ingredient_from_recipe(recipe_id:int,ingredient_id:int,db:Session):
    recipe_details = db.get(Recipe,recipe_id)
    if recipe_details is None: 
        return None,"Recipe does not exist"
    
    recipe_ingredient_row = db.get(RecipeIngredient,{"recipe_id":recipe_id,"ingredient_id":ingredient_id})
    
    if recipe_ingredient_row is None: 
        return None,"Ingredient is not in recipe"

    db.delete(recipe_ingredient_row)
    db.commit()
    return True,"Deletion Successful"

def change_ingredient_quantity_in_recipe(recipe_id:int,ingredient_id:int,new_quantity:QuantityUpdateRequest,db:Session):
    recipe_info = db.get(Recipe,recipe_id)
    if recipe_info is None: 
        return None,"Recipe does not exist"

    recipe_ingredient_row = db.get(RecipeIngredient,{"recipe_id":recipe_id,"ingredient_id":ingredient_id})
    if recipe_ingredient_row is None: 
        return None, "Ingredient does not exist in the recipe"

    recipe_ingredient_row.quantity =  new_quantity.quantity
    db.commit()
    return recipe_info,"Updated Successfully"

