import pytest
import json
from datetime import datetime
from app import app
from models import db, Todo
from database import init_db


@pytest.fixture
def client():
    """Create a test client with an in-memory database"""
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
        yield client
        with app.app_context():
            db.drop_all()


@pytest.fixture
def sample_todo(client):
    """Create a sample todo for testing"""
    with app.app_context():
        todo = Todo(
            title='Test Todo',
            description='Test Description',
            completed=False
        )
        db.session.add(todo)
        db.session.commit()
        todo_id = todo.id
    return todo_id


class TestHealthCheck:
    """Test health check endpoint"""
    
    def test_health_check(self, client):
        """Test GET /api/health returns healthy status"""
        response = client.get('/api/health')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['status'] == 'healthy'
        assert 'message' in data


class TestGetTodos:
    """Test GET /api/todos endpoint"""
    
    def test_get_todos_empty(self, client):
        """Test getting todos when database is empty"""
        response = client.get('/api/todos')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert isinstance(data, list)
        assert len(data) == 0
    
    def test_get_todos_with_data(self, client):
        """Test getting todos when database has data"""
        # Create test todos
        with app.app_context():
            todo1 = Todo(title='Todo 1', description='Desc 1', completed=False)
            todo2 = Todo(title='Todo 2', description='Desc 2', completed=True)
            db.session.add(todo1)
            db.session.add(todo2)
            db.session.commit()
        
        response = client.get('/api/todos')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert isinstance(data, list)
        assert len(data) == 2
        
        # Verify todos are ordered by created_at descending
        assert data[0]['title'] == 'Todo 2'
        assert data[1]['title'] == 'Todo 1'
    
    def test_get_todos_structure(self, client, sample_todo):
        """Test that returned todos have correct structure"""
        response = client.get('/api/todos')
        assert response.status_code == 200
        data = json.loads(response.data)
        
        todo = data[0]
        assert 'id' in todo
        assert 'title' in todo
        assert 'description' in todo
        assert 'completed' in todo
        assert 'created_at' in todo


class TestGetTodoById:
    """Test GET /api/todos/<id> endpoint"""
    
    def test_get_todo_by_id_success(self, client, sample_todo):
        """Test getting a specific todo by ID"""
        response = client.get(f'/api/todos/{sample_todo}')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['id'] == sample_todo
        assert data['title'] == 'Test Todo'
        assert data['description'] == 'Test Description'
        assert data['completed'] is False
    
    def test_get_todo_by_id_not_found(self, client):
        """Test getting a non-existent todo"""
        response = client.get('/api/todos/9999')
        assert response.status_code == 404
        data = json.loads(response.data)
        assert 'error' in data


class TestCreateTodo:
    """Test POST /api/todos endpoint"""
    
    def test_create_todo_success(self, client):
        """Test creating a new todo with all fields"""
        payload = {
            'title': 'New Todo',
            'description': 'New Description',
            'completed': False
        }
        response = client.post(
            '/api/todos',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['title'] == 'New Todo'
        assert data['description'] == 'New Description'
        assert data['completed'] is False
        assert 'id' in data
        assert 'created_at' in data
    
    def test_create_todo_minimal(self, client):
        """Test creating a todo with only required fields"""
        payload = {'title': 'Minimal Todo'}
        response = client.post(
            '/api/todos',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['title'] == 'Minimal Todo'
        assert data['description'] == ''
        assert data['completed'] is False
    
    def test_create_todo_missing_title(self, client):
        """Test creating a todo without title (should fail)"""
        payload = {'description': 'No title'}
        response = client.post(
            '/api/todos',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert 'Title is required' in data['error']
    
    def test_create_todo_empty_payload(self, client):
        """Test creating a todo with empty payload"""
        response = client.post(
            '/api/todos',
            data=json.dumps({}),
            content_type='application/json'
        )
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_create_todo_no_payload(self, client):
        """Test creating a todo with no payload"""
        response = client.post(
            '/api/todos',
            content_type='application/json'
        )
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_create_todo_with_completed_true(self, client):
        """Test creating a todo with completed=True"""
        payload = {
            'title': 'Completed Todo',
            'completed': True
        }
        response = client.post(
            '/api/todos',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['completed'] is True


class TestUpdateTodo:
    """Test PUT /api/todos/<id> endpoint"""
    
    def test_update_todo_all_fields(self, client, sample_todo):
        """Test updating all fields of a todo"""
        payload = {
            'title': 'Updated Title',
            'description': 'Updated Description',
            'completed': True
        }
        response = client.put(
            f'/api/todos/{sample_todo}',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['title'] == 'Updated Title'
        assert data['description'] == 'Updated Description'
        assert data['completed'] is True
    
    def test_update_todo_partial_title(self, client, sample_todo):
        """Test updating only the title"""
        payload = {'title': 'Only Title Updated'}
        response = client.put(
            f'/api/todos/{sample_todo}',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['title'] == 'Only Title Updated'
        assert data['description'] == 'Test Description'  # Unchanged
        assert data['completed'] is False  # Unchanged
    
    def test_update_todo_partial_description(self, client, sample_todo):
        """Test updating only the description"""
        payload = {'description': 'Only Description Updated'}
        response = client.put(
            f'/api/todos/{sample_todo}',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['title'] == 'Test Todo'  # Unchanged
        assert data['description'] == 'Only Description Updated'
        assert data['completed'] is False  # Unchanged
    
    def test_update_todo_partial_completed(self, client, sample_todo):
        """Test updating only the completed status"""
        payload = {'completed': True}
        response = client.put(
            f'/api/todos/{sample_todo}',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['title'] == 'Test Todo'  # Unchanged
        assert data['description'] == 'Test Description'  # Unchanged
        assert data['completed'] is True
    
    def test_update_todo_not_found(self, client):
        """Test updating a non-existent todo"""
        payload = {'title': 'Updated'}
        response = client.put(
            '/api/todos/9999',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 500
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_update_todo_empty_payload(self, client, sample_todo):
        """Test updating with empty payload (should succeed but not change anything)"""
        response = client.put(
            f'/api/todos/{sample_todo}',
            data=json.dumps({}),
            content_type='application/json'
        )
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['title'] == 'Test Todo'
        assert data['description'] == 'Test Description'
        assert data['completed'] is False


class TestDeleteTodo:
    """Test DELETE /api/todos/<id> endpoint"""
    
    def test_delete_todo_success(self, client, sample_todo):
        """Test deleting an existing todo"""
        response = client.delete(f'/api/todos/{sample_todo}')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'message' in data
        assert 'deleted successfully' in data['message']
        
        # Verify todo is actually deleted
        get_response = client.get(f'/api/todos/{sample_todo}')
        assert get_response.status_code == 404
    
    def test_delete_todo_not_found(self, client):
        """Test deleting a non-existent todo"""
        response = client.delete('/api/todos/9999')
        assert response.status_code == 500
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_delete_todo_verify_list(self, client):
        """Test that deleted todo is removed from list"""
        # Create two todos
        with app.app_context():
            todo1 = Todo(title='Todo 1')
            todo2 = Todo(title='Todo 2')
            db.session.add(todo1)
            db.session.add(todo2)
            db.session.commit()
            todo1_id = todo1.id
        
        # Delete first todo
        client.delete(f'/api/todos/{todo1_id}')
        
        # Verify only one todo remains
        response = client.get('/api/todos')
        data = json.loads(response.data)
        assert len(data) == 1
        assert data[0]['title'] == 'Todo 2'


class TestIntegration:
    """Integration tests for complete workflows"""
    
    def test_complete_crud_workflow(self, client):
        """Test complete CRUD workflow"""
        # Create
        create_payload = {
            'title': 'Integration Test Todo',
            'description': 'Testing CRUD',
            'completed': False
        }
        create_response = client.post(
            '/api/todos',
            data=json.dumps(create_payload),
            content_type='application/json'
        )
        assert create_response.status_code == 201
        todo_id = json.loads(create_response.data)['id']
        
        # Read
        read_response = client.get(f'/api/todos/{todo_id}')
        assert read_response.status_code == 200
        
        # Update
        update_payload = {'completed': True}
        update_response = client.put(
            f'/api/todos/{todo_id}',
            data=json.dumps(update_payload),
            content_type='application/json'
        )
        assert update_response.status_code == 200
        assert json.loads(update_response.data)['completed'] is True
        
        # Delete
        delete_response = client.delete(f'/api/todos/{todo_id}')
        assert delete_response.status_code == 200
        
        # Verify deletion
        verify_response = client.get(f'/api/todos/{todo_id}')
        assert verify_response.status_code == 404
    
    def test_multiple_todos_ordering(self, client):
        """Test that multiple todos are properly ordered"""
        # Create todos with slight delays to ensure different timestamps
        titles = ['First', 'Second', 'Third']
        for title in titles:
            client.post(
                '/api/todos',
                data=json.dumps({'title': title}),
                content_type='application/json'
            )
        
        # Get all todos
        response = client.get('/api/todos')
        data = json.loads(response.data)
        
        # Should be in reverse order (newest first)
        assert len(data) == 3
        assert data[0]['title'] == 'Third'
        assert data[1]['title'] == 'Second'
        assert data[2]['title'] == 'First'


class TestEdgeCases:
    """Test edge cases and boundary conditions"""
    
    def test_create_todo_with_long_title(self, client):
        """Test creating a todo with a very long title"""
        long_title = 'A' * 200  # Max length is 200
        payload = {'title': long_title}
        response = client.post(
            '/api/todos',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['title'] == long_title
    
    def test_create_todo_with_empty_string_title(self, client):
        """Test creating a todo with empty string title"""
        payload = {'title': ''}
        response = client.post(
            '/api/todos',
            data=json.dumps(payload),
            content_type='application/json'
        )
        # Empty string is still a valid title (not None)
        assert response.status_code == 201
    
    def test_update_todo_toggle_completed_multiple_times(self, client, sample_todo):
        """Test toggling completed status multiple times"""
        # Toggle to True
        response1 = client.put(
            f'/api/todos/{sample_todo}',
            data=json.dumps({'completed': True}),
            content_type='application/json'
        )
        assert json.loads(response1.data)['completed'] is True
        
        # Toggle back to False
        response2 = client.put(
            f'/api/todos/{sample_todo}',
            data=json.dumps({'completed': False}),
            content_type='application/json'
        )
        assert json.loads(response2.data)['completed'] is False
        
        # Toggle to True again
        response3 = client.put(
            f'/api/todos/{sample_todo}',
            data=json.dumps({'completed': True}),
            content_type='application/json'
        )
        assert json.loads(response3.data)['completed'] is True
    
    def test_create_todo_with_special_characters(self, client):
        """Test creating a todo with special characters"""
        payload = {
            'title': 'Todo with émojis 🎉 and spëcial çhars!',
            'description': 'Testing <html> & "quotes" and \'apostrophes\''
        }
        response = client.post(
            '/api/todos',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['title'] == payload['title']
        assert data['description'] == payload['description']


# Made with Bob