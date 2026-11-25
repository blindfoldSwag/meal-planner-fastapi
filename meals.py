from pydantic import BaseModel,ConfigDict,Field
from datetime import date
from typing import Literal
from recipes import RecipeResponseShort
from sqlalchemy.orm import Session
from sqlalchemy import select,case
from db_model import MealPlan,Recipe,Pantry,Ingredient
from ingredients import IngredientResponse

class MealRequest(BaseModel):
    date: date
    meal_type:Literal["dinner","breakfast","lunch"]
    recipe_id:int

class MealResponse(BaseModel):
    id:int
    date:date
    meal_type:str
    recipe:RecipeResponseShort|None
    model_config = ConfigDict(from_attributes=True)

class GroceryListResponse(BaseModel):
    id:int
    name: str 
    need:float
    stock:float
    buy:float
    unit: str 

class PantryResponse(BaseModel):
    ingredient:IngredientResponse
    quantity:float 

    model_config = ConfigDict(from_attributes=True)

class PantryRequest(BaseModel):
    quantity:float = Field(gt=0)

class MissingItem(BaseModel):
    ingredient:str
    offset:float
    unit:str 

    model_config = ConfigDict(from_attributes=True)

class WhatCanICookResponse(BaseModel):
    id:int 
    name:str
    missing_items:list[MissingItem]

    model_config = ConfigDict(from_attributes=True)

def add_meal(meal:MealRequest,db:Session):
    recipe_info = db.get(Recipe,meal.recipe_id)
    if recipe_info is None: 
        return None 
    
    new_meal = MealPlan(date = meal.date, meal_type = meal.meal_type, recipe_id = meal.recipe_id)
    db.add(new_meal)
    db.commit()
    return new_meal

# None-> start date is greater than end, thus returning a 400 
def get_meals_filtered_by_date(start_date:date,end_date:date,db:Session):
    if start_date>end_date: 
        return None,"Start date can't be greater than the end date"
    priority_order_meal_type = case({"breakfast":1,"lunch":2,"dinner":3},value = MealPlan.meal_type)
    stmt = select(MealPlan).where(MealPlan.date>=start_date,MealPlan.date<=end_date).order_by(MealPlan.date,priority_order_meal_type)
    list_meals = db.execute(stmt).scalars().all()
    return list_meals, "Meals Fetches Successfully"

#None -> No meal info found
#True -> Deletion was successful

def remove_meal(meal_id:int, db:Session):
    meal_info = db.get(MealPlan,meal_id)
    if meal_info is None: 
        return None 
    db.delete(meal_info)
    db.commit()
    return True


def retrieve_grocery_list(start_date:date,end_date:date,db:Session):
    if start_date>end_date: 
        return None
    stmt = select(MealPlan).where(MealPlan.date>=start_date,MealPlan.date<=end_date,MealPlan.recipe_id.is_not(None))
    list_meal_info = db.execute(stmt).scalars().all()
    if not list_meal_info: 
        return list()
    
    grocery_planning = {}

    for meal_info in list_meal_info:
        for recipe_ingredient_row in meal_info.recipe.recipe_ingredients:
            
            ingredient_id = recipe_ingredient_row.ingredient_id
            quantity_needed = recipe_ingredient_row.quantity
            ingredient = recipe_ingredient_row.ingredient

            name = ingredient.name
            unit = ingredient.unit

            if ingredient_id not in grocery_planning: 
                grocery_planning[ingredient_id] = {}
                grocery_planning[ingredient_id]["id"] = ingredient_id
                grocery_planning[ingredient_id]["name"] = name
                grocery_planning[ingredient_id]["need"] = quantity_needed
                grocery_planning[ingredient_id]["stock"] = 0
                grocery_planning[ingredient_id]["buy"] = 0
                grocery_planning[ingredient_id]["unit"] = unit
            else:
                current_quantity_needed = grocery_planning[ingredient_id]["need"]
                grocery_planning[ingredient_id]["need"]=current_quantity_needed+quantity_needed


    ## retrieving the quantities from the pantry with what we have. 
    ingredient_in_stock = {}
    pantry_rows = db.execute(select(Pantry)).scalars().all()
    for pantry_items in pantry_rows:
        ingredient_in_stock[pantry_items.ingredient_id] = pantry_items.quantity

    for item_id in grocery_planning:
        grocery_planning[item_id]["stock"] = ingredient_in_stock.get(item_id,0)
        items_needed = grocery_planning[item_id]["need"] - grocery_planning[item_id]["stock"]
        if items_needed>0:
            grocery_planning[item_id]["buy"] = items_needed

    grocery_list = list(grocery_planning.values())
    grocery_list = list(filter(lambda x:x["buy"]>0,grocery_list))
    grocery_list.sort(key= lambda item:item["name"])
    return grocery_list

def get_all_pantry(db:Session):
    stmt = select(Pantry)
    result = db.execute(stmt)
    pantry_info = result.scalars().all()
    return pantry_info


# None-> ingredient not found
# pantry object -> information updated or created in the database

def put_ingredient_in_pantry(ingredient_id:int,pantry_request:PantryRequest,db:Session):
    pantry_info = db.get(Pantry,ingredient_id)

    if pantry_info is not None: 
        pantry_info.quantity = pantry_request.quantity
        db.commit()
        return pantry_info

    ingredient_info = db.get(Ingredient,ingredient_id)
    if ingredient_info is None: 
        return None 

    new_pantry_info = Pantry(ingredient = ingredient_info,quantity = pantry_request.quantity)
    db.add(new_pantry_info)
    db.commit()
    return new_pantry_info

def what_can_i_cook(db:Session):
    pantry_rows = db.execute(select(Pantry)).scalars().all()
    stock_available = {}
    for pantry in pantry_rows:
        stock_available[pantry.ingredient_id] = pantry.quantity

    # comparing against recipes now. 
    recipes_available = db.execute(select(Recipe)).scalars().all()
    
    final_list = list()
    for recipe in recipes_available:
        id = recipe.id
        name = recipe.name
        missing = list()
        offset_dictionary = dict()
        recipe_ingredient_row = recipe.recipe_ingredients
        if not recipe_ingredient_row:
            continue
        
        for recipe_ingredient_row in recipe.recipe_ingredients:
            
            ingredient = recipe_ingredient_row.ingredient
            offset = recipe_ingredient_row.quantity - stock_available.get(ingredient.id,0)
            if offset>0:
                offset_dictionary= {"ingredient":ingredient.name,"offset":offset,"unit":ingredient.unit}
                missing.append(offset_dictionary)

        final_list.append({"id":id,"name":name,"missing_items":missing})
            
    # sort from least amount of offset items to the highest amount of offset items.
    final_list.sort(key=lambda x:len(x["missing_items"])) 
    return final_list
