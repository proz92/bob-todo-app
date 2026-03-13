# 📝 Bob Todo App

A full-stack todo application built with Flask (Python) backend and vanilla JavaScript frontend. This project demonstrates modern web development practices with a RESTful API, SQLite database, and responsive UI.

## 🚀 Features

- ✅ Create, read, update, and delete todos
- 📝 Add titles and descriptions to tasks
- ✔️ Mark tasks as complete/incomplete
- 🎨 Clean and responsive user interface
- 🔄 Real-time updates without page refresh
- 💾 Persistent storage with SQLite database
- 🧪 Comprehensive test coverage

## 🛠️ Technology Stack

### Backend
- **Flask** - Python web framework
- **Flask-SQLAlchemy** - ORM for database operations
- **Flask-CORS** - Cross-Origin Resource Sharing support
- **SQLite** - Lightweight database
- **pytest** - Testing framework

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with flexbox/grid
- **JavaScript (ES6+)** - Vanilla JS for interactivity
- **Fetch API** - HTTP requests to backend

## 📋 Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Modern web browser

## 🔧 Installation

### 1. Clone the repository

```bash
git clone https://github.com/proz92/bob-todo-app.git
cd bob-todo-app
```

### 2. Set up the backend

```bash
cd backend

# Create a virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Run the application

```bash
# Start the Flask backend (from backend directory)
python app.py
```

The backend will start on `http://localhost:5000`

### 4. Open the frontend

Open `frontend/index.html` in your web browser, or serve it using a local server:

```bash
# Using Python's built-in server (from frontend directory)
cd ../frontend
python -m http.server 8000
```

Then navigate to `http://localhost:8000`

## 🧪 Running Tests

```bash
cd backend

# Run all tests
pytest

# Run with coverage report
pytest --cov=. --cov-report=html

# Run specific test file
pytest test_app.py -v
```

## 📁 Project Structure

```
bob-todo-app/
├── backend/
│   ├── app.py              # Flask application and API routes
│   ├── models.py           # SQLAlchemy database models
│   ├── database.py         # Database initialization
│   ├── requirements.txt    # Python dependencies
│   ├── test_app.py         # API tests
│   ├── pytest.ini          # Pytest configuration
│   └── TEST_README.md      # Testing documentation
├── frontend/
│   ├── index.html          # Main HTML file
│   ├── styles.css          # CSS styling
│   └── app.js              # JavaScript logic
├── .gitignore              # Git ignore rules
├── IMPLEMENTATION_PLAN.md  # Development plan
└── README.md               # This file
```

## 🔌 API Endpoints

### Get all todos
```http
GET /api/todos
```

### Get a specific todo
```http
GET /api/todos/:id
```

### Create a new todo
```http
POST /api/todos
Content-Type: application/json

{
  "title": "Task title",
  "description": "Task description (optional)",
  "completed": false
}
```

### Update a todo
```http
PUT /api/todos/:id
Content-Type: application/json

{
  "title": "Updated title",
  "description": "Updated description",
  "completed": true
}
```

### Delete a todo
```http
DELETE /api/todos/:id
```

## 🎨 Features in Detail

### Backend Features
- RESTful API design
- SQLAlchemy ORM for database operations
- CORS enabled for cross-origin requests
- Error handling and validation
- Automatic database initialization
- Comprehensive test suite

### Frontend Features
- Responsive design
- Form validation
- Dynamic DOM manipulation
- Async/await for API calls
- Error handling and user feedback
- Clean and intuitive UI

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

Created as part of the Bob AI Assistant workshop series.

## 🙏 Acknowledgments

- Built with guidance from Bob AI Assistant
- Part of the Bobathon workshop exercises
- Demonstrates modern full-stack development practices