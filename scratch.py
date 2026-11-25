from database import SessionLocal
from db_model import Recipe,RecipeIngredient,Ingredient,MealPlan,Pantry
from datetime import date
from sqlalchemy import select
from sqlalchemy.orm import selectinload





with SessionLocal() as db: 
    '''
    ingredient = Ingredient(name = "flour",unit = "g")
        recipe = Recipe(name = "pancakes", servings = 2,instructions = "do this and that")
    
        link = RecipeIngredient(recipe = recipe, ingredient = ingredient, quantity = 200)
        link2 = RecipeIngredient(recipe = recipe, ingredient = Ingredient(name="samsa",unit="g"),quantity = 300)
    
        db.add_all([link,link2])
        db.commit()
    
    '''
    # trying to add a meal. that is. 
    # get meals within a date range. 


    pantry_rows = db.execute(select(Pantry)).scalars().all()
    stock_available = {}
    for pantry in pantry_rows:
        stock_available[pantry.ingredient_id] = pantry.quantity

    print(stock_available)

    # comparing against recipes now. 
    recipes_available = db.execute(select(Recipe)).scalars().all()
    print(len(recipes_available))
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
    print(final_list)

            

            


