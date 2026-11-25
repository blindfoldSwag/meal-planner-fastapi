# 🍽️ Meal Planner & Smart Pantry

![Python](https://img.shields.io/badge/Python-3.8%2B-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-D71F00?logo=sqlalchemy&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?logo=sqlite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?logo=javascript&logoColor=black)

A full-stack web application that streamlines meal preparation, tracks pantry inventory, and automates grocery shopping. Built with a **FastAPI** backend and a **Vanilla JavaScript** single-page frontend.

---

## 📖 Overview

This project was built to answer two everyday questions: **"What's for dinner?"** and **"What do I need to buy?"**

Users can store recipes, plan meals for the week, and keep track of the ingredients they already have in their kitchen. Using relational database logic, the app automatically generates a grocery list and suggests recipes based on the current pantry stock.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| **📚 Recipe Management** | Full CRUD for recipes, with nested ingredient management: add ingredients, edit quantities, and remove them from a specific recipe. |
| **📅 Weekly Meal Planner** | Interactive weekly calendar for scheduling breakfast, lunch, and dinner, with navigation to past and future weeks. |
| **🥫 Smart Pantry Tracker** | Inventory system for kitchen stock with an autocomplete search dropdown to quickly find and update existing ingredients or create new ones on the fly. |
| **🛒 Automated Grocery List** | A dynamic endpoint that compares the ingredients needed for the week's planned meals against current pantry stock to produce a precise shopping list. |
| **👩‍🍳 "What Can I Cook?" Analytics** | Evaluates the pantry against all saved recipes and returns what you can cook right now, plus any missing ingredients for the rest. |

---

## 🛠️ Tech Stack

### Backend
- **Python 3**: core programming language
- **FastAPI**: high-performance web framework for the REST API
- **SQLAlchemy**: SQL toolkit and ORM
- **SQLite**: lightweight relational database for local storage
- **Pydantic**: data validation using Python type annotations

### Frontend
- **HTML5 & CSS3**: semantic structure and responsive layout (Flexbox)
- **Vanilla JavaScript (ES6+)**: DOM manipulation and asynchronous API communication, with no external libraries

---

## 🚀 Getting Started

### Prerequisites

- Python **3.8+** installed on your system

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/YOUR_USERNAME/meal-planner.git
   cd meal-planner
   ```

2. **(Optional) Create a virtual environment**

   ```bash
   python -m venv venv
   source venv/bin/activate    # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**

   ```bash
   pip install fastapi uvicorn sqlalchemy
   ```

4. **Initialize the database**

   ```bash
   python create_tables.py
   ```

5. **Run the app**

   ```bash
   uvicorn main:app --reload
   ```

6. **Open it in your browser**

   - App: [http://localhost:8000](http://localhost:8000)
   - Interactive API docs (Swagger UI): [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📂 Project Structure

```
meal-planner/
│
├── main.py              # FastAPI application entry point and API routes
├── db_model.py          # SQLAlchemy database models
├── database.py          # Database connection and session configuration
├── create_tables.py     # Script to initialize the database schema
├── recipes.py           # Schemas and logic for Recipes
├── ingredients.py       # Schemas and logic for Ingredients
├── meals.py             # Schemas and logic for Meal Plans, Pantry, etc.
│
├── static/              # Frontend assets
│   ├── index.html       # Main HTML structure
│   ├── styles.css       # Custom CSS styling
│   └── script.js        # Client-side logic and API calls
│
└── .gitignore           # Git ignore rules
```

---

## 📡 API Documentation

FastAPI generates interactive documentation automatically. With the server running, visit:

- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

---

## 🗺️ Future Enhancements

- [ ] **User authentication (JWT)** to support multiple user profiles
- [ ] **PostgreSQL** migration from SQLite for production readiness
- [ ] **Modern frontend framework** (React or Vue.js) for better state management
- [ ] **Automated testing suite** using `pytest` and FastAPI's `TestClient`

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to open an issue or submit a pull request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m "Add amazing feature"`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👤 Author

**YOUR_NAME**
GitHub: [@blindfoldSwag](https://github.com/blindfoldSwag)
