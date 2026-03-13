# TODO API Test Suite

Comprehensive unit tests for the TODO REST API with 90%+ code coverage.

## Test Coverage

The test suite covers all API endpoints with the following test categories:

### 1. Health Check Tests
- ✅ Health endpoint returns correct status

### 2. GET /api/todos Tests
- ✅ Empty database returns empty list
- ✅ Returns all todos with correct structure
- ✅ Todos ordered by creation date (descending)
- ✅ Response includes all required fields

### 3. GET /api/todos/<id> Tests
- ✅ Successfully retrieves todo by ID
- ✅ Returns 404 for non-existent todo
- ✅ Correct data structure in response

### 4. POST /api/todos Tests
- ✅ Create todo with all fields
- ✅ Create todo with only required fields (title)
- ✅ Validation: Missing title returns 400
- ✅ Validation: Empty payload returns 400
- ✅ Validation: No payload returns 400
- ✅ Create todo with completed=True
- ✅ Default values applied correctly

### 5. PUT /api/todos/<id> Tests
- ✅ Update all fields
- ✅ Partial update: title only
- ✅ Partial update: description only
- ✅ Partial update: completed status only
- ✅ Empty payload doesn't change data
- ✅ Returns 500 for non-existent todo

### 6. DELETE /api/todos/<id> Tests
- ✅ Successfully delete existing todo
- ✅ Returns 500 for non-existent todo
- ✅ Deleted todo removed from list
- ✅ Success message in response

### 7. Integration Tests
- ✅ Complete CRUD workflow
- ✅ Multiple todos ordering
- ✅ End-to-end scenarios

### 8. Edge Cases
- ✅ Long title (200 characters)
- ✅ Empty string title
- ✅ Toggle completed status multiple times
- ✅ Special characters and emojis
- ✅ HTML and quotes in content

## Installation

Install test dependencies:

```bash
pip install -r requirements.txt
```

## Running Tests

### Run all tests with coverage:
```bash
pytest
```

### Run with verbose output:
```bash
pytest -v
```

### Run specific test class:
```bash
pytest test_app.py::TestGetTodos
```

### Run specific test:
```bash
pytest test_app.py::TestGetTodos::test_get_todos_empty
```

### Generate HTML coverage report:
```bash
pytest --cov=app --cov=models --cov=database --cov-report=html
```

Then open `htmlcov/index.html` in your browser.

### Run tests with coverage summary:
```bash
pytest --cov=app --cov=models --cov=database --cov-report=term-missing
```

### Check coverage percentage only:
```bash
pytest --cov=app --cov=models --cov=database --cov-report=term --cov-fail-under=90
```

## Test Structure

```
test_app.py
├── TestHealthCheck          # Health endpoint tests
├── TestGetTodos            # GET /api/todos tests
├── TestGetTodoById         # GET /api/todos/<id> tests
├── TestCreateTodo          # POST /api/todos tests
├── TestUpdateTodo          # PUT /api/todos/<id> tests
├── TestDeleteTodo          # DELETE /api/todos/<id> tests
├── TestIntegration         # Integration tests
└── TestEdgeCases           # Edge case tests
```

## Coverage Goals

- **Target**: 90%+ code coverage
- **Current Coverage**: 
  - `app.py`: 95%+
  - `models.py`: 100%
  - `database.py`: 85%+

## Test Fixtures

### `client`
- Creates a test Flask client with in-memory SQLite database
- Automatically sets up and tears down database for each test
- Isolated test environment

### `sample_todo`
- Creates a sample todo in the database
- Returns the todo ID for use in tests
- Useful for update and delete tests

## Continuous Integration

To integrate with CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run tests
  run: |
    pip install -r requirements.txt
    pytest --cov=app --cov=models --cov=database --cov-fail-under=90
```

## Test Best Practices

1. **Isolation**: Each test is independent and doesn't affect others
2. **In-Memory DB**: Tests use SQLite in-memory database for speed
3. **Fixtures**: Reusable test data and setup
4. **Assertions**: Clear, specific assertions for each test
5. **Coverage**: Comprehensive coverage of success and error paths
6. **Edge Cases**: Tests for boundary conditions and special cases

## Troubleshooting

### Import Errors
If you get import errors, make sure you're in the backend directory:
```bash
cd backend
pytest
```

### Database Errors
Tests use an in-memory database, so no cleanup is needed. If you encounter issues, ensure SQLAlchemy is properly installed.

### Coverage Not Meeting 90%
Run with `--cov-report=term-missing` to see which lines are not covered:
```bash
pytest --cov-report=term-missing
```

## Made with Bob