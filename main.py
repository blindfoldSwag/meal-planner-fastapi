from fastapi import FastAPI,Depends,HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from database import SessionLocal
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import Annotated
from ingredients import get_all_ingredients,get_specific_ingredient,add_ingredient,remove_ingredient,IngredientResponse,IngredientRequest
from recipes import get_specific_recipe,get_all_recipes,change_ingredient_quantity_in_recipe,add_recipe,remove_ingredient_from_recipe,remove_recipe,add_ingredient_to_recipe,RecipeRequest,RecipeResponseDetailed,RecipeResponseShort,AddIngredientToRecipeRequest,QuantityUpdateRequest
from meals import add_meal,get_meals_filtered_by_date,what_can_i_cook,put_ingredient_in_pantry,get_all_pantry,remove_meal,retrieve_grocery_list,MealRequest, MealResponse,WhatCanICookResponse, GroceryListResponse,PantryResponse, PantryRequest
from datetime import date




# first adding the database. 
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app = FastAPI()
app.mount("/static",StaticFiles(directory="static"),name="static");

'''

FAST API ENDPOINTS ---- Page

'''
@app.get("/")
def get_meal_planner():
    return FileResponse("static/index.html")

'''

FAST API ENDPOINTS ---- Ingredients

'''
# get functions 
@app.get("/ingredients",response_model=list[IngredientResponse])
def get_ingredients(db:Annotated[Session,Depends(get_db)]):
    result = get_all_ingredients(db)
    return result

@app.get("/ingredients/{id}",response_model=IngredientResponse)
def get_ingredient(id:int, db:Annotated[Session,Depends(get_db)]):
    result = get_specific_ingredient(id= id,db = db)
    if result is None: 
        raise HTTPException(status_code=404, detail="Ingredient Not Found")
    return result

@app.post("/ingredients",status_code=201,response_model=IngredientResponse)
def put_ingredients(new_ingredient:IngredientRequest,db:Annotated[Session,Depends(get_db)]):
    try: 
        return add_ingredient(ingredient=new_ingredient,db=db)
    except IntegrityError:
        raise HTTPException(status_code=409,detail=f"{new_ingredient.name} already exists or is empty")

@app.delete("/ingredients/{id}",status_code=204)
def delete_ingredient(id:int, db:Annotated[Session,Depends(get_db)]):
    result = remove_ingredient(id=id,db=db)
    if result is None: 
        raise HTTPException(status_code=404,detail="Item Does Not Exist")

    if not result: 
        raise HTTPException(status_code=409,detail="Item In Use By A Recipe")
    


'''

FAST API ENDPOINTS ---- Recipe

'''
@app.get("/recipes/{id}",response_model=RecipeResponseDetailed)
def get_recipe(id:int,db:Annotated[Session,Depends(get_db)]):
    result = get_specific_recipe(id= id, db = db)
    if result is None:
        raise HTTPException(status_code=404,detail="recipe does not exist")
    return result

@app.get("/recipes",response_model=list[RecipeResponseShort])
def get_recipes(db:Annotated[Session,Depends(get_db)]):
        result = get_all_recipes(db=db)
        return result

@app.post("/recipes",status_code=201,response_model=RecipeResponseDetailed)
def post_recipe(recipe:RecipeRequest,db:Annotated[Session,Depends(get_db)]):
    try:
        return add_recipe(recipe=recipe,db=db)
    except IntegrityError:
        raise(HTTPException(status_code=409,detail = f"{recipe.name} already exists"))

@app.delete("/recipes/{id}",status_code=204)
def delete_recipe(id:int, db:Annotated[Session,Depends(get_db)]):
    result,message = remove_recipe(id=id,db=db)
    if result is None: 
        raise HTTPException(status_code=404,detail=message)
    if not result: 
        raise HTTPException(status_code=409,detail=message)
    
    

@app.post("/recipes/{recipe_id}/ingredients",response_model=RecipeResponseDetailed,status_code=201)
def post_ingredient_to_recipe(recipe_id:int,ingredient:AddIngredientToRecipeRequest, db:Annotated[Session,Depends(get_db)]):
    try: 
        status, result = add_ingredient_to_recipe(recipe_id=recipe_id,ingredient=ingredient,db = db)
        if not status: 
            if result == "Recipe":
                raise HTTPException(status_code=404,detail="Recipe does not exist")
            else: 
                raise HTTPException(status_code=404,detail="Ingredient does not exist")
        else: 
            return result 
    except IntegrityError: 
        raise HTTPException(status_code=409, detail= "Ingredient already in the recipe")

@app.delete("/recipes/{recipe_id}/ingredients/{ingredient_id}",status_code=204)
def delete_ingredient_from_recipe(recipe_id:int,ingredient_id:int,db:Annotated[Session,Depends(get_db)]):
    result,message = remove_ingredient_from_recipe(recipe_id=recipe_id,ingredient_id=ingredient_id,db=db)
    print(result,message)
    if result is None: 
        raise HTTPException(status_code=404,detail=message)
    
@app.patch("/recipes/{recipe_id}/ingredients/{ingredient_id}",response_model=RecipeResponseDetailed)
def patch_ingredient_quantity_in_recipe(recipe_id:int,ingredient_id:int,quantity:QuantityUpdateRequest,db:Annotated[Session,Depends(get_db)]):
    result,message = change_ingredient_quantity_in_recipe(recipe_id=recipe_id,ingredient_id=ingredient_id,new_quantity=quantity,db=db)
    if result is None: 
        raise HTTPException(status_code=404,detail=message)
    return result

@app.post("/meals",response_model=MealResponse,status_code=201)
def post_meal(meal:MealRequest,db:Annotated[Session,Depends(get_db)]):
    result =  add_meal(meal=meal,db=db)
    if result is None: 
        raise HTTPException(status_code=404,detail="Recipe does not exist")
    return result 

@app.get("/meals",response_model=list[MealResponse])
def get_meals(start_date:date,end_date:date,db:Annotated[Session,Depends(get_db)]):
    result, message = get_meals_filtered_by_date(start_date=start_date,end_date=end_date,db=db)
    if result is None: 
        raise HTTPException(status_code=400,detail=message)
    return result

@app.delete("/meals/{meal_id}",status_code=204)
def delete_meal(meal_id:int,db:Annotated[Session,Depends(get_db)]):
    result = remove_meal(meal_id=meal_id,db=db)
    if result is None: 
        raise HTTPException(status_code=404,detail="Meal does not exist")
    
@app.get("/grocery-list",response_model=list[GroceryListResponse])
def get_grocery_list(start_date:date,end_date:date,db:Annotated[Session,Depends(get_db)]):
    result = retrieve_grocery_list(start_date=start_date,end_date=end_date,db=db)
    if result is None: 
        raise HTTPException(status_code=400,detail="Start date cant be more than End date")
    return result

@app.get("/pantry",response_model=list[PantryResponse])
def get_pantry(db:Annotated[Session,Depends(get_db)]):
    return get_all_pantry(db=db)

@app.put("/pantry/{ingredient_id}",response_model=PantryResponse)
def put_pantry(ingredient_id:int,pantry_request:PantryRequest,db:Annotated[Session,Depends(get_db)]):
    result = put_ingredient_in_pantry(ingredient_id=ingredient_id,pantry_request=pantry_request,db=db)
    if result is None: 
        raise HTTPException(status_code=404,detail="Ingredient not found")
    return result

@app.get("/what-can-i-cook",response_model=list[WhatCanICookResponse])
def get_what_can_i_cook(db:Annotated[Session,Depends(get_db)]):
    result = what_can_i_cook(db=db)
    return result



    
    