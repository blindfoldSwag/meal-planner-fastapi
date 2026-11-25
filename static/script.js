document.addEventListener("DOMContentLoaded",()=>{

            const form = document.getElementById("recipe-form")
            form.addEventListener("submit",async(event)=>{
                event.preventDefault();
                const name = document.getElementById("recipe-name").value;
                const servings = document.getElementById("recipe-servings").value;
                const instructions = document.getElementById("recipe-instructions").value;

                const newRecipe = {
                    name:name,
                    servings:parseInt(servings),
                    instructions:instructions
                }

                const response = await fetch("/recipes",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(newRecipe)});
                if (response.ok){
                    form.reset()
                    await loadRecipes()
                }

            })

            let selectedRecipeId = null; 
        let ingredientBeingEditedId = null;
        let selectedPantryIngredientId = null; 
        let selectedIngredientFromPantryDropdownId = null; 
        let currentStartDate = new Date();
        let currentEndDate = new Date();
        let masterItemList = [];

        // setting up the search button for the pantry, adding it to the add ingredient thingy. 
        const pantrySearchDropdown = document.getElementById("pantry-search-dropdown");
        const addIngredientToPantryInput = document.getElementById("add-ingredient-to-pantry-input");
        const addIngredientToPantryQuantityInput = document.getElementById("add-ingredient-to-pantry-quantity-input");
        const addIngredientToPantryUnitInput = document.getElementById("add-ingredient-to-pantry-unit-input")
        const addIngredientToPantryForm = document.getElementById("add-ingredient-to-pantry-form");

        addIngredientToPantryForm.addEventListener("submit",async(event)=>{
            event.preventDefault();
            const ingredientName = addIngredientToPantryInput.value; 
            const ingredientQuantity = parseFloat(addIngredientToPantryQuantityInput.value)
            const ingredientUnit = addIngredientToPantryUnitInput.value; 

            let ingredientId = null; 
            for(const ingredient of masterItemList){
                if(ingredient.name.toLowerCase()==ingredientName){
                    ingredientId = ingredient.id;  
                    break;
                }
            }
            if(ingredientId){
                const pantryRequest = {quantity: ingredientQuantity}
                const pantryResponse = await fetch(`/pantry/${ingredientId}`,{"method":"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(pantryRequest)});
                if(pantryResponse.ok)
            {
                await loadPantry()
                addIngredientToPantryInput.value = "";
                addIngredientToPantryQuantityInput.value = "";
                addIngredientToPantryUnitInput.value = "";
                await loadGroceryList();
            }

            }
            else{
                const ingredientRequest = {
                    name: ingredientName,
                    unit: ingredientUnit
                }
                const ingredientResponse = await fetch(`/ingredients`,{"method":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(ingredientRequest)});
                if(ingredientResponse.ok){
                    const ingredientDetails = await ingredientResponse.json();
                    const ingredientReturnedId = ingredientDetails.id; 
                    const pantryRequest = {quantity: ingredientQuantity}

                    const pantryResponse = await fetch(`/pantry/${ingredientReturnedId}`,{"method":"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(pantryRequest)});
                if(pantryResponse.ok)
                {
                await loadPantry();
                addIngredientToPantryInput.value = "";
                addIngredientToPantryQuantityInput.value = "";
                addIngredientToPantryUnitInput.value = "";
           
                }

            }
            }
        })
        addIngredientToPantryInput.addEventListener("input",(event)=>{
            const searchTerm = addIngredientToPantryInput.value;
            addIngredientToPantryQuantityInput.value = "";
            addIngredientToPantryUnitInput.value = "";

            // filtering master list based on search term. 
            if(searchTerm==""){
                pantrySearchDropdown.style.display = "none";
                return; 
            }
            pantrySearchDropdown.innerHTML = "";

            const filteredList = masterItemList.filter((item)=>item.name.toLowerCase().includes(searchTerm));
            if(filteredList.length==0){
                pantrySearchDropdown.style.display = "none";
            }
            else{
                pantrySearchDropdown.style.display = "block";
            }
            for(const item of filteredList){
            const searchResultRow = document.createElement("li");
            searchResultRow.textContent = item.name; 
            searchResultRow.addEventListener("click",(event)=>{
                event.stopPropagation();
                // fill the input. 
                addIngredientToPantryInput.value = item.name;
                addIngredientToPantryQuantityInput.value = item.pantry_quantity; 
                addIngredientToPantryUnitInput.value = item.unit; 
                // clear the results. 
                pantrySearchDropdown.style.display = "none";
                pantrySearchDropdown.innerHTML = "";

            })
            pantrySearchDropdown.appendChild(searchResultRow);
        }
        
        })
        currentStartDate.setDate(currentStartDate.getDate()-currentStartDate.getDay()+1);
        currentEndDate.setDate(currentEndDate.getDate()-currentEndDate.getDay()+7);
        
        const addIngredientForm = document.getElementById("add-ingredient-form");
        const ingredientQuantityEditForm = document.getElementById("ingredient-quantity-edit-form");
        const ingredientQuantityEditFormCancelButton = document.getElementById("ingredient-quantity-edit-form-cancel");
        const addIngredientQuantityInputBox = document.getElementById("add-ingredient-quantity-input");
        const addIngredientDropDown = document.getElementById("add-ingredient-dropdown");
        const ingredientQuantityEditInputBox = document.getElementById("ingredient-quantity-edit-form-input");
        const ingredientQuantityEditModal = document.getElementById("ingredient-quantity-edit-modal");
        const addNewIngredientToRecipeButton = document.getElementById("add-new-ingredient-to-recipe-button");

        const addNewIngredientDiv = document.getElementById("add-new-ingredient-div");
        const addNewIngredientFormCancelButton = document.getElementById("add-new-ingredient-form-cancel-button");
        const addNewIngredientForm = document.getElementById("add-new-ingredient-form");

        // Meal Planner Components
        const mealPlannerForm = document.getElementById("meal-planner-form");
        const mealPlannerRecipeDropDown = document.getElementById("meal-planner-recipe-dropdown");
        const mealPlannerMealTypeDropDown = document.getElementById("meal-planner-meal-type-dropdown");
        const mealPlannerDateInput = document.getElementById("meal-planner-date-input");
        const mealPlannerDiv = document.getElementById("meal-planner-div");

        //Meal Planner Event Listeners 
        mealPlannerForm.addEventListener("submit",async (event)=>{
            // getting the entered details: 
            const mealDate = mealPlannerDateInput.value; 
            const mealPlannerMealType = mealPlannerMealTypeDropDown.value; 
            const mealPlannerSelectedRecipeId = parseInt(mealPlannerRecipeDropDown.value); 
            const mealRequest = {
                date:mealDate, 
                meal_type:mealPlannerMealType,
                recipe_id:mealPlannerSelectedRecipeId
            }
            const addMealToScheduleResponse = await fetch("/meals",{"method":"POST",headers:{"Content-type":"application/json"},body:JSON.stringify(mealRequest)});
            if (addMealToScheduleResponse.ok){
               await loadMealDetails();
            }
        })

        



        addNewIngredientForm.addEventListener("submit",async (event)=>{
            
            // first it will have to create an ingredient. 
            event.preventDefault();
            const ingredientNameInput = document.getElementById("add-new-ingredient-input-name");
            const ingredientQuantityInput = document.getElementById("add-new-ingredient-input-quantity");
            const ingredientUnitInput = document.getElementById("add-new-ingredient-input-unit");

            const ingredientName = ingredientNameInput.value; 
            const ingredientQuantity = parseFloat(ingredientQuantityInput.value);
            const ingredientUnit = ingredientUnitInput.value; 

            const addIngredientRequest = {
                name:ingredientName,
                unit:ingredientUnit
            }
            const ingredientPostResponse = await fetch(`/ingredients`,{"method":"POST",headers:{
                "Content-Type":"application/json"
            },body:JSON.stringify(addIngredientRequest)})

            if(ingredientPostResponse.ok){
                const newIngredientDetails = await ingredientPostResponse.json();
                const ingredientRequest = {
                    ingredient_id: newIngredientDetails.id,
                    quantity: ingredientQuantity
                }

                const addIngredientToRecipeResponse = await addIngredientToRecipe(ingredientRequest,selectedRecipeId);
                if(addIngredientToRecipeResponse.ok){
                    await loadRecipeDetails(selectedRecipeId);
                    addNewIngredientDiv.style.display = "none";
                    addNewIngredientForm.reset();   
                } 
                else{
                    alert("Ingredient is already in the recipe");
                }
            } })

        addNewIngredientFormCancelButton.addEventListener("click",(event)=>{
            addNewIngredientDiv.style.display = "none";
        })
        addNewIngredientToRecipeButton.addEventListener("click",(event)=>{
            addNewIngredientDiv.style.display = "flex";
        
        })

        // buttons for week navigation 
        const mealPlannerNextWeekButton = document.getElementById("meal-planner-next-week-button");
        const mealPlannerPreviousWeekButton = document.getElementById("meal-planner-previous-week-button");

        mealPlannerNextWeekButton.addEventListener("click",async (event)=>{
            event.stopPropagation();
            currentStartDate.setDate(currentStartDate.getDate()+7);
            currentEndDate.setDate(currentEndDate.getDate()+7);
            await loadMealDetails();
        })
        mealPlannerPreviousWeekButton.addEventListener("click",async(event)=>{
            event.stopPropagation();
            currentStartDate.setDate(currentStartDate.getDate()-7);
            currentEndDate.setDate(currentEndDate.getDate()-7);
            await loadMealDetails();
        })


        //buttons for editing pantry quantity of an item
        const pantryItemQuantityEditCancelBtn = document.getElementById("pantry-item-quantity-edit-cancel-button");
        const pantryItemQuantityEditDiv = document.getElementById("pantry-item-quantity-edit-div");
        const pantryItemQuantityEditForm = document.getElementById("pantry-item-quantity-edit-form");
        const pantryItemQuantityEditInput = document.getElementById("pantry-item-quantity-edit-input");

        pantryItemQuantityEditCancelBtn.addEventListener("click",(event)=>{
            event.stopPropagation();
            pantryItemQuantityEditDiv.style.display= "none";
        })

        pantryItemQuantityEditForm.addEventListener("submit",async(event)=>{
            event.preventDefault();
            const newQuantity = parseFloat(pantryItemQuantityEditInput.value); 
            const pantryRequest = {
                quantity:newQuantity
            }
            const pantryUpdateResponse = await fetch(`/pantry/${selectedPantryIngredientId}`,{"method":"PUT",headers:{
                "Content-Type":"application/json"
            },body:JSON.stringify(pantryRequest)});

            if(pantryUpdateResponse.ok){
                pantryItemQuantityEditDiv.style.display = "none";
                loadPantry();
            }
            else{
               const errorData=  await pantryUpdateResponse.json();
                console.log(errorData)
            }
        })

        async function loadWhatCanICook() {

            const whatCanICookResponse = await fetch("/what-can-i-cook");
            const cookingList = await whatCanICookResponse.json();
            const cookingTable = document.getElementById("what-can-i-cook-table");
            const cookingTableBody = document.getElementById("what-can-i-cook-table-body");
            const cookingTableMessage = document.getElementById("no-results-available-for-cooking");

            if(cookingList.length==0){
                cookingTable.style.display = "none";
                cookingTableMessage.style.display = "block";

                return; 
            }

            cookingTable.style.display = "table";
            cookingTableMessage.style.display = "none";

            cookingTableBody.innerHTML = "";

            for(const items of cookingList){
                const cookingTableRow = document.createElement("tr");
                const cookingTableItemNameColumn = document.createElement("td");
                const cookingTableMissingItemsColumn = document.createElement("td");
                const cookingTableMissingItemList = document.createElement("ol");

                cookingTableItemNameColumn.textContent = items.name; 
                if(items.missing_items.length==0){
                    cookingTableMissingItemsColumn.textContent = "All Items Available";
                }
                else{
                    for(const missing_item of items.missing_items){
                        const missingItemInfoListEntry = document.createElement("li");
                        missingItemInfoListEntry.style.padding = "10px";
                        missingItemInfoListEntry.textContent = `${missing_item.ingredient} ${missing_item.offset}${missing_item.unit}`;
                        cookingTableMissingItemList.appendChild(missingItemInfoListEntry);
                    }
                    cookingTableMissingItemsColumn.appendChild(cookingTableMissingItemList);
                }


                

                cookingTableRow.appendChild(cookingTableItemNameColumn);
                cookingTableRow.appendChild(cookingTableMissingItemsColumn);
                cookingTableBody.appendChild(cookingTableRow);

            }
            
        }
        async function loadGroceryList() {
            const formatDate = (date)=>date.toISOString().split("T")[0];
            const startDate = formatDate(currentStartDate);
            const endDate = formatDate(currentEndDate);

            const groceryListResponse = await fetch(`/grocery-list?start_date=${startDate}&end_date=${endDate}`);
            const groceryList = await groceryListResponse.json();
            
            // filling the grocery list for the week.
            const groceryListNotNeededMessage = document.getElementById("grocery-list-message");
            const groceryListTableBody = document.getElementById('grocery-list-table-body');
            const groceryListTable = document.getElementById('grocery-list-table');
            
            // wiping out the old enteries. 
            groceryListTableBody.innerHTML = "";
            if(groceryList.length==0){
                groceryListTable.style.display = "none";
                groceryListNotNeededMessage.style.display = "block";
            }
            else{
                
                for(const items of groceryList){
                    groceryListTable.style.display = "table";
                    groceryListNotNeededMessage.style.display = "none";
                    
                    const groceryTableItemNameColumn = document.createElement("td");
                    const groceryTableItemQtyAvailableColumn = document.createElement('td');
                    const groceryTableItemQtyNeededColumn = document.createElement('td');
                    const groceryTableItemQtyToBuyColumn = document.createElement('td');
                    const groceryTableRow = document.createElement('tr');
                    
                    //setting the values. 
                    groceryTableItemNameColumn.textContent = items.name; 
                    groceryTableItemQtyNeededColumn.textContent = `${items.need} ${items.unit}`
                    groceryTableItemQtyAvailableColumn.textContent = `${items.stock} ${items.unit}` 
                    groceryTableItemQtyToBuyColumn.textContent = `${items.buy} ${items.unit}` 


                    groceryTableRow.appendChild(groceryTableItemNameColumn);
                    groceryTableRow.appendChild(groceryTableItemQtyNeededColumn);
                    groceryTableRow.appendChild(groceryTableItemQtyAvailableColumn);
                    groceryTableRow.appendChild(groceryTableItemQtyToBuyColumn);

                    groceryListTableBody.appendChild(groceryTableRow);

                }
            }
            

            
        }


        async function loadPantry(){
            const ingredientsResponse = await fetch("/ingredients");
            const pantryResponse = await fetch("/pantry");

            const ingredientsAvailable = await ingredientsResponse.json();
            const pantryItems = await pantryResponse.json();

            const pantryTableBody = document.getElementById("pantry-table-body");
            pantryTableBody.innerHTML = "";
            masterItemList.length = 0; 

            // first add everything that is in the pantry
            for (const item of pantryItems){
                masterItemList.push({
                    id: item.ingredient.id,
                    name:item.ingredient.name,
                    unit:item.ingredient.unit,
                    pantry_quantity:item.quantity
                })
            }

            for (const ingredient of ingredientsAvailable){
                const itemInMasterList = masterItemList.some((item)=>item.id===ingredient.id)
            if(!itemInMasterList)
            {
                masterItemList.push({id:ingredient.id,name:ingredient.name,unit:ingredient.unit,pantry_quantity:0})
            }
        }
        // adding the pantry items to the table. 
       
       const pantryItemQuantityEditDiv = document.getElementById("pantry-item-quantity-edit-div");
       const pantryItemQuantityEditSpan = document.getElementById("pantry-item-quantity-edit-span");

        for(const item of masterItemList){

            if(item.pantry_quantity>0){
                const pantryTableRow = document.createElement("tr");
                const pantryTableItemName = document.createElement("td");
                const pantryTableItemQuantity = document.createElement("td");
                const pantryTableEditButtonColumn = document.createElement("td");

                const pantryItemEditButton = document.createElement("button");
                pantryItemEditButton.textContent = "Edit";
                pantryTableItemName.textContent = item.name; 
                pantryTableItemQuantity.textContent = `${item.pantry_quantity} ${item.unit}`;

                pantryItemEditButton.addEventListener("click",async (event)=>{
                    pantryItemQuantityEditSpan.innerHTML = "";
                    const selectedPantryItemDetailsHeading = document.createElement("h3");
                    selectedPantryItemDetailsHeading.textContent = `Ingredient: ${item.name} | Current Quantity:${item.pantry_quantity}${item.unit}`;
                    pantryItemQuantityEditSpan.appendChild(selectedPantryItemDetailsHeading);
                    pantryItemQuantityEditDiv.style.display = "flex";
                    selectedPantryIngredientId = item.id; 
                    
                })
                pantryTableEditButtonColumn.appendChild(pantryItemEditButton);

                
                pantryTableRow.appendChild(pantryTableItemName);
                pantryTableRow.appendChild(pantryTableItemQuantity);
                pantryTableRow.appendChild(pantryTableEditButtonColumn);
                
                pantryTableBody.appendChild(pantryTableRow);
                
            }
        
        }
        await loadWhatCanICook();   

        }

        async function loadMealDetails() {

            // setting the start and the end date 
            const weeklyDateRangeHeading = document.getElementById("weekly-date-range");

            const formatDate = (date)=>date.toISOString().split("T")[0];
            const startDate = formatDate(currentStartDate);
            const endDate = formatDate(currentEndDate);

            weeklyDateRangeHeading.textContent = `${startDate} to ${endDate}`;
            const mealTableBody = document.getElementById("meal-information-table-body");
            mealTableBody.innerHTML = "";

            const mealDetailsResponse = await fetch(`/meals?start_date=${startDate}&end_date=${endDate}`);
            

            const mealPlans = await mealDetailsResponse.json();
            

            const noMealsFoundMessageDom = document.getElementById("no-meals-found-message");
            if (noMealsFoundMessageDom){
                noMealsFoundMessageDom.remove();
            }


            if(mealPlans.length===0){
                const noMealsFoundMessage = document.createElement('p');
                noMealsFoundMessage.id = "no-meals-found-message";
                noMealsFoundMessage.textContent = "NO Meals Available To Show";
                noMealsFoundMessage.style.textAlign = "center";
                mealPlannerDiv.appendChild(noMealsFoundMessage);
                await loadGroceryList();
                return; 
            }

            
           
            for(const meal of mealPlans){

                const mealInformationRow = document.createElement("tr");
                const mealDateColumn = document.createElement("td");
                const mealRecipeColumn = document.createElement("td");
                const mealTypeColumn = document.createElement("td");
                const mealPlanActionsColumn = document.createElement("td");
                const deleteMealButton = document.createElement("button");
            

                deleteMealButton.textContent = "Delete";

                mealDateColumn.textContent = meal.date; 
                if(meal.recipe){
                     mealRecipeColumn.textContent = meal.recipe.name;

                }
                else mealRecipeColumn.textContent = "Recipe Deleted";
                
                mealTypeColumn.textContent = meal.meal_type; 

                deleteMealButton.addEventListener("click",async (event)=>{
                    event.stopPropagation();
                    const deleteMealResponse = await fetch(`/meals/${meal.id}`,{"method":"DELETE"});
                    if (deleteMealResponse.ok){
                        await loadMealDetails();
                    }
                })
                
                mealPlanActionsColumn.appendChild(deleteMealButton);

                mealInformationRow.appendChild(mealDateColumn);
                mealInformationRow.appendChild(mealTypeColumn);
                mealInformationRow.appendChild(mealRecipeColumn);
                mealInformationRow.appendChild(mealPlanActionsColumn);


                mealTableBody.appendChild(mealInformationRow);
        
            }
            await loadGroceryList();

           
        }


        async function addIngredientToRecipe(ingredientRequest,recipeId) {
            const addIngredientToRecipeResponse = await fetch(`/recipes/${recipeId}/ingredients`,{"method":"POST",headers:{
                "Content-type":"application/json"
            },body:JSON.stringify(ingredientRequest)})

            return addIngredientToRecipeResponse;
        }

        // Add Ingredient To Recipe Event Listeners 
                addIngredientForm.addEventListener("submit",async (event)=>{
                    event.preventDefault();
                    const ingredientQuantity = parseFloat(addIngredientQuantityInputBox.value);
                    const selectedIngredientForAdditionId = parseInt(addIngredientDropDown.value); 

                    const addIngredientRequest = {
                        ingredient_id:selectedIngredientForAdditionId,
                        quantity:ingredientQuantity
                    }

                    const addIngredientRequestResponse = await fetch(`/recipes/${selectedRecipeId}/ingredients`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(addIngredientRequest)});
                    if(addIngredientRequestResponse.ok){
                        await loadRecipeDetails(selectedRecipeId);
                    }
                    else{
                        const errorData = addIngredientRequestResponse.json();
                        console.log(errorData);
                    }

                })


                // ingredient Quantity Edit Event Listeners 
                ingredientQuantityEditForm.addEventListener("submit",async (event)=>{
                    event.preventDefault();

                    const newIngredientQuantity = parseFloat(ingredientQuantityEditInputBox.value);
                    const UpdateQuantityRequest = {
                        quantity:newIngredientQuantity
                    }

                    const ingredientQuantityChangeResponse = await fetch(`/recipes/${selectedRecipeId}/ingredients/${ingredientBeingEditedId}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(UpdateQuantityRequest)});
                    if (ingredientQuantityChangeResponse.ok){
                        await loadRecipeDetails(selectedRecipeId);
                        ingredientQuantityEditModal.style.display = "none";
                    }
                })

                ingredientQuantityEditFormCancelButton.addEventListener("click",(event)=>{
                    ingredientQuantityEditModal.style.display = "none";
                })


        async function loadRecipeDetails(recipeId){
            const recipeResponse = await fetch(`/recipes/${recipeId}`);
            const ingredientsAvailableResponse = await fetch("/ingredients");

            if (recipeResponse.ok){

                const recipeDetails = await recipeResponse.json();
                const recipeDiv = document.getElementById("recipe-details");
                const ingredientQuantityEditModal = document.getElementById("ingredient-quantity-edit-modal");
                const ingredientQuantityEditForm = document.getElementById("ingredient-quantity-edit-form");
                const ingredientQuantityEditInputBox = document.getElementById("ingredient-quantity-edit-form-input");
                
                // add ingredient elements
                const addIngredientDiv = document.getElementById("add-ingredient-div");
                const addIngredientForm = document.getElementById("add-ingredient-form");
                
               
                
                // creating elements for recipeDiv
                const recipeNameHeading = document.createElement("h1");
                const recipeIngredientsHeading = document.createElement("h3");
                const recipeInstructionsHeading = document.createElement("h3");
                const recipeServingsDetail = document.createElement("p");
                const recipeInstructions = document.createElement("p");
    

                // Unhiding the div and resetting for display
                recipeDiv.style.display = "block";
                addIngredientDiv.style.display = "block";
                recipeDiv.innerHTML = "";

                // Setting values
                recipeNameHeading.textContent = recipeDetails.name;
                recipeInstructionsHeading.textContent = "Instructions: ";
                recipeIngredientsHeading.textContent = "Ingredients: ";

                recipeServingsDetail.textContent = `servings: ${recipeDetails.servings}`; 
                recipeInstructions.textContent = recipeDetails.instructions; 

                // Displaying Recipe Ingredients 
                const ingredientList = document.createElement("ul");
        
                for(const recipeIngredientRow of recipeDetails.recipe_ingredients){
                    const ingredientDetails = recipeIngredientRow.ingredient 
                    const ingredientRow = document.createElement("li");
                    const ingredientRowSpan = document.createElement("span");
                    const ingredientEditButton = document.createElement("button");
                    const ingredientDeleteButton = document.createElement("button");
                    
                    ingredientRow.style.display = "flex";
                    ingredientRow.style.justifyContent = "left";
                    ingredientRow.style.padding = "10px";
                    ingredientRow.style.gap = "10px";
                    ingredientEditButton.textContent = "Edit";
                    ingredientRowSpan.textContent = `name: ${ingredientDetails.name}, quantity: ${recipeIngredientRow.quantity} ${ingredientDetails.unit}`;
                    ingredientRow.appendChild(ingredientRowSpan)
                    ingredientDeleteButton.textContent = "Delete";
                    
                    ingredientDeleteButton.addEventListener("click",async (event)=>{
                        const ingredientDeleteResponse = await fetch(`/recipes/${selectedRecipeId}/ingredients/${ingredientDetails.id}`,{"method":"DELETE"});
                        if (ingredientDeleteResponse.ok){
                            await loadRecipeDetails(selectedRecipeId);
                        }
                    })
                    //setting the edit button    
                    ingredientEditButton.addEventListener("click",(event)=>{
                        ingredientQuantityEditModal.style.display = "flex";
                        ingredientBeingEditedId = ingredientDetails.id; 
                    })
                    

                    ingredientRow.appendChild(ingredientEditButton);
                    ingredientRow.appendChild(ingredientDeleteButton);
                    ingredientList.appendChild(ingredientRow);
                }

                //Populating the Add Ingredient Dropdown Menu
                addIngredientDropDown.innerHTML = `<option value="">--Select Ingredient--</option>`;
                addIngredientQuantityInputBox.value = "";

                if(ingredientsAvailableResponse.ok){
                    const ingredientsAvailable = await ingredientsAvailableResponse.json();
                    for(const ingredient of ingredientsAvailable){
                        const itemInRecipe = recipeDetails.recipe_ingredients.some((recipeRow)=>recipeRow.ingredient.id == ingredient.id)
                        if(!itemInRecipe){
                            const ingredientOptionInDropDown = document.createElement("option");
                            ingredientOptionInDropDown.textContent = `${ingredient.name}(${ingredient.unit})`; 
                            ingredientOptionInDropDown.value = ingredient.id; 
                            addIngredientDropDown.appendChild(ingredientOptionInDropDown);
                        }
                    }
                }

                

                // Adding Elements To The Recipe Div
                recipeDiv.appendChild(recipeNameHeading);
                recipeDiv.appendChild(recipeServingsDetail);
                recipeDiv.appendChild(recipeInstructionsHeading);
                recipeDiv.appendChild(recipeInstructions);
                recipeDiv.appendChild(recipeIngredientsHeading);
                recipeDiv.appendChild(ingredientList);

            
                
            }
        }

        async function loadRecipes() {
            const recipeList = document.getElementById("recipe-list");
            const mealPlannerRecipeDropdown = document.getElementById("meal-planner-recipe-dropdown");
            const mealPlannerRecipeDropdownDefaultOption = document.createElement("option")
            

            
            //resetting the recipeList and mealPlannerRecipeList Together. 
            recipeList.innerHTML = "";
            mealPlannerRecipeDropdownDefaultOption.textContent = "---- Select Recipe ----";
            mealPlannerRecipeDropDown.innerHTML = " ";

            mealPlannerRecipeDropDown.appendChild(mealPlannerRecipeDropdownDefaultOption);
            
            const recipeResponse = await fetch("/recipes");
            const recipes = await recipeResponse.json();

        for(const recipe of recipes)
        {
            const item = document.createElement("li");
            const button = document.createElement("button");

            button.textContent = "delete"
            button.addEventListener("click",async (event)=>{

                event.stopPropagation();
                selectedRecipeId = recipe.id;

                const response = await fetch(`/recipes/${selectedRecipeId}`,{method:"DELETE"} );
                if (response.ok){
                    await loadRecipes()
                }
                else{
                    const errorData = await response.json()
                    alert(errorData.detail)
                }
            })

            item.addEventListener("click",async()=>{

                const response = await fetch(`/recipes/${recipe.id}`);
                selectedRecipeId = recipe.id;

                if(!response.ok){
                    alert("Recipe Details no longer in database");
                    await(loadRecipes())
                    return; 
                }
                await loadRecipeDetails(selectedRecipeId);
            
        })
        const recipeNameSpanContainer = document.createElement("span");
        recipeNameSpanContainer.textContent = `${recipe.name} (servings: ${recipe.servings}) `;


    // populating the meal recipe dropdown as well. 
    const mealPlannerRecipeDropDownOption = document.createElement("option");
    mealPlannerRecipeDropDownOption.textContent = `${recipe.name}`;
    mealPlannerRecipeDropDownOption.value = `${recipe.id}`;
    mealPlannerRecipeDropDown.appendChild(mealPlannerRecipeDropDownOption);
    
    item.appendChild(recipeNameSpanContainer);
    item.appendChild(button);
    recipeList.appendChild(item);
    
    }
}
 loadRecipes();
 loadMealDetails();
 loadPantry();

});