/*
 * ============================================================================
 * TODO APP - FRONTEND JAVASCRIPT
 * ============================================================================
 * 
 * This file handles all the interactive functionality of our todo application.
 * It communicates with a backend API to create, read, update, and delete todos.
 * 
 * Key Concepts Covered:
 * - API Communication using Fetch API
 * - Async/Await for handling asynchronous operations
 * - DOM Manipulation to update the user interface
 * - Error Handling to gracefully manage failures
 * - Event Handling for user interactions
 */

// ============================================================================
// API CONFIGURATION
// ============================================================================

/*
 * API_BASE_URL: The base URL where our backend server is running
 * 
 * This is the address of our Flask backend server. All API requests will be
 * sent to endpoints that start with this URL. For example:
 * - GET http://localhost:5001/api/todos (to fetch all todos)
 * - POST http://localhost:5001/api/todos (to create a new todo)
 */
const API_BASE_URL = 'http://localhost:5001/api';

// ============================================================================
// DOM ELEMENT REFERENCES
// ============================================================================

/*
 * We store references to HTML elements that we'll need to interact with.
 * This is more efficient than searching for them every time we need them.
 * 
 * getElementById() finds an element by its 'id' attribute in the HTML.
 */
const todoForm = document.getElementById('todoForm');           // The form for adding new todos
const todoTitle = document.getElementById('todoTitle');         // Input field for todo title
const todoDescription = document.getElementById('todoDescription'); // Textarea for todo description
const todosList = document.getElementById('todosList');         // Container where todos will be displayed
const loadingState = document.getElementById('loadingState');   // Loading spinner shown while fetching data
const errorState = document.getElementById('errorState');       // Error message shown when something fails
const emptyState = document.getElementById('emptyState');       // Message shown when there are no todos
const errorMessage = document.getElementById('errorMessage');   // Text element for error details
const retryBtn = document.getElementById('retryBtn');           // Button to retry loading after an error

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

/*
 * todos: An array that stores all our todo items
 * 
 * This is our "single source of truth" for the current state of todos.
 * Whenever we fetch, create, update, or delete a todo, we update this array
 * and then re-render the UI to reflect the changes.
 */
let todos = [];

// ============================================================================
// APPLICATION INITIALIZATION
// ============================================================================

/*
 * DOMContentLoaded Event: Fires when the HTML document has been completely loaded
 * 
 * We wait for this event to ensure all HTML elements exist before we try to
 * interact with them. This is a best practice in JavaScript.
 */
document.addEventListener('DOMContentLoaded', () => {
    loadTodos();              // Fetch todos from the server when the page loads
    setupEventListeners();    // Set up all event handlers for user interactions
});

// ============================================================================
// EVENT LISTENER SETUP
// ============================================================================

/*
 * setupEventListeners: Attaches event handlers to interactive elements
 * 
 * Event listeners "listen" for user actions (like clicks or form submissions)
 * and execute functions when those actions occur.
 */
function setupEventListeners() {
    // When the form is submitted, call handleAddTodo
    // 'submit' event fires when user clicks the submit button or presses Enter
    todoForm.addEventListener('submit', handleAddTodo);
    
    // When the retry button is clicked, try loading todos again
    retryBtn.addEventListener('click', loadTodos);
}

// ============================================================================
// API FUNCTIONS - COMMUNICATING WITH THE BACKEND
// ============================================================================

/*
 * loadTodos: Fetches all todos from the backend API
 * 
 * ASYNC/AWAIT EXPLANATION:
 * - 'async' keyword makes this function asynchronous, meaning it can wait for
 *   operations to complete without blocking other code from running
 * - 'await' keyword pauses execution until a Promise resolves (completes)
 * - This makes asynchronous code look and behave more like synchronous code,
 *   which is easier to read and understand
 * 
 * WHY USE ASYNC/AWAIT?
 * - Network requests take time (could be milliseconds to seconds)
 * - We don't want to freeze the entire application while waiting
 * - Async/await lets us write code that waits for the response without blocking
 * 
 * ERROR HANDLING:
 * - We use try/catch to handle errors gracefully
 * - If anything goes wrong in the 'try' block, the 'catch' block executes
 * - This prevents the app from crashing and lets us show helpful error messages
 */
async function loadTodos() {
    // Show loading spinner while we fetch data
    showLoading();
    
    try {
        /*
         * FETCH API: Modern way to make HTTP requests in JavaScript
         * 
         * fetch() returns a Promise that resolves to a Response object
         * We use 'await' to wait for the Promise to resolve before continuing
         * 
         * GET request: Retrieves data from the server without modifying anything
         */
        const response = await fetch(`${API_BASE_URL}/todos`);
        
        /*
         * Check if the request was successful
         * response.ok is true if status code is 200-299
         * If not ok, we throw an error to jump to the catch block
         */
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        /*
         * Parse the JSON response body
         * response.json() also returns a Promise, so we await it
         * This converts the JSON string from the server into a JavaScript array
         */
        todos = await response.json();
        
        // Update the UI to display the todos
        renderTodos();
        
    } catch (error) {
        /*
         * If anything goes wrong (network error, server error, parsing error),
         * we catch it here and show a user-friendly error message
         */
        console.error('Error loading todos:', error);
        showError('Failed to load todos. Please check if the backend server is running.');
    }
}

/*
 * createTodo: Sends a new todo to the backend API
 * 
 * @param {string} title - The title of the todo
 * @param {string} description - The description of the todo
 * 
 * POST REQUEST EXPLANATION:
 * - POST is used to create new resources on the server
 * - We send data in the request body as JSON
 * - The server processes this data and creates a new todo in the database
 */
async function createTodo(title, description) {
    try {
        /*
         * Making a POST request with fetch()
         * 
         * Second parameter is an options object that configures the request:
         * - method: 'POST' tells the server we're creating something new
         * - headers: Tells the server we're sending JSON data
         * - body: The actual data we're sending (must be a JSON string)
         */
        const response = await fetch(`${API_BASE_URL}/todos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',  // Tell server we're sending JSON
            },
            body: JSON.stringify({                   // Convert JavaScript object to JSON string
                title,
                description,
                completed: false                     // New todos start as incomplete
            }),
        });
        
        // Check if the request was successful
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Parse the response to get the newly created todo (with its ID from the server)
        const newTodo = await response.json();
        
        /*
         * Update our local state
         * unshift() adds the new todo to the beginning of the array
         * This makes new todos appear at the top of the list
         */
        todos.unshift(newTodo);
        
        // Re-render the UI to show the new todo
        renderTodos();
        
        /*
         * Reset the form to clear the input fields
         * This provides good UX - user can immediately add another todo
         */
        todoForm.reset();
        todoTitle.focus();  // Put cursor back in title field for convenience
        
    } catch (error) {
        /*
         * If creation fails, show an alert to the user
         * In a production app, you might want a more elegant error display
         */
        console.error('Error creating todo:', error);
        alert('Failed to create todo. Please try again.');
    }
}

/*
 * toggleTodoComplete: Marks a todo as complete or incomplete
 * 
 * @param {number} id - The ID of the todo to update
 * @param {boolean} currentStatus - The current completion status
 * 
 * PUT REQUEST EXPLANATION:
 * - PUT is used to update existing resources on the server
 * - We send the updated data in the request body
 * - The server updates the todo in the database and returns the updated version
 */
async function toggleTodoComplete(id, currentStatus) {
    try {
        /*
         * Making a PUT request to update a specific todo
         * Note: We include the todo ID in the URL path
         * We only send the fields we want to update (completed status)
         */
        const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                completed: !currentStatus  // Toggle: if true, make false; if false, make true
            }),
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Get the updated todo from the server
        const updatedTodo = await response.json();
        
        /*
         * Update our local state
         * findIndex() finds the position of the todo in our array
         * We then replace the old todo with the updated one
         */
        const index = todos.findIndex(t => t.id === id);
        if (index !== -1) {
            todos[index] = updatedTodo;
            renderTodos();  // Re-render to show the updated status
        }
        
    } catch (error) {
        console.error('Error updating todo:', error);
        alert('Failed to update todo. Please try again.');
    }
}

/*
 * deleteTodo: Removes a todo from the backend
 * 
 * @param {number} id - The ID of the todo to delete
 * 
 * DELETE REQUEST EXPLANATION:
 * - DELETE is used to remove resources from the server
 * - We only need to specify which resource to delete (via the ID in the URL)
 * - No request body is needed for DELETE requests
 */
async function deleteTodo(id) {
    /*
     * confirm() shows a browser dialog asking the user to confirm
     * Returns true if user clicks OK, false if they click Cancel
     * This prevents accidental deletions
     */
    if (!confirm('Are you sure you want to delete this todo?')) {
        return;  // Exit the function if user cancels
    }
    
    try {
        /*
         * Making a DELETE request
         * Note: No body is needed, just the method and the ID in the URL
         */
        const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
            method: 'DELETE',
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        /*
         * Update our local state by removing the deleted todo
         * filter() creates a new array with all todos except the one we deleted
         */
        todos = todos.filter(t => t.id !== id);
        
        // Re-render to remove the todo from the UI
        renderTodos();
        
    } catch (error) {
        console.error('Error deleting todo:', error);
        alert('Failed to delete todo. Please try again.');
    }
}

// ============================================================================
// EVENT HANDLERS - RESPONDING TO USER ACTIONS
// ============================================================================

/*
 * handleAddTodo: Processes the form submission to add a new todo
 * 
 * @param {Event} e - The submit event object
 * 
 * This function is called when the user submits the form (clicks Add Todo button
 * or presses Enter in an input field)
 */
function handleAddTodo(e) {
    /*
     * preventDefault() stops the form from doing its default action
     * By default, forms reload the page when submitted
     * We prevent this because we want to handle submission with JavaScript
     */
    e.preventDefault();
    
    /*
     * Get the values from the input fields
     * trim() removes whitespace from the beginning and end
     * This prevents users from creating todos with just spaces
     */
    const title = todoTitle.value.trim();
    const description = todoDescription.value.trim();
    
    /*
     * Validation: Make sure the title isn't empty
     * If it is, focus the title field and exit the function
     */
    if (!title) {
        todoTitle.focus();
        return;
    }
    
    // If validation passes, create the todo
    createTodo(title, description);
}

// ============================================================================
// RENDER FUNCTIONS - UPDATING THE USER INTERFACE
// ============================================================================

/*
 * renderTodos: Updates the UI to display all todos
 * 
 * This is called whenever the todos array changes (after loading, creating,
 * updating, or deleting a todo). It's our main function for keeping the UI
 * in sync with our data.
 */
function renderTodos() {
    // First, hide all state displays (loading, error, empty)
    hideAllStates();
    
    /*
     * If there are no todos, show the empty state
     * This provides better UX than showing nothing
     */
    if (todos.length === 0) {
        showEmpty();
        return;
    }
    
    /*
     * Generate HTML for all todos
     * 
     * map() transforms each todo object into an HTML string
     * join('') combines all the HTML strings into one big string
     * innerHTML sets the content of the todosList container
     */
    todosList.innerHTML = todos.map(todo => createTodoElement(todo)).join('');
    
    /*
     * Attach event listeners to the dynamically created buttons
     * 
     * WHY DO WE DO THIS HERE?
     * - The buttons are created dynamically (they don't exist in the original HTML)
     * - Event listeners must be attached after the elements are created
     * - We loop through each todo and attach listeners to its buttons
     */
    todos.forEach(todo => {
        const completeBtn = document.getElementById(`complete-${todo.id}`);
        const deleteBtn = document.getElementById(`delete-${todo.id}`);
        
        if (completeBtn) {
            completeBtn.addEventListener('click', () => toggleTodoComplete(todo.id, todo.completed));
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => deleteTodo(todo.id));
        }
    });
}

/*
 * createTodoElement: Generates HTML for a single todo item
 * 
 * @param {Object} todo - A todo object with properties: id, title, description, completed, created_at
 * @returns {string} HTML string representing the todo
 * 
 * This function uses template literals (backticks) to create HTML strings
 * Template literals allow us to embed JavaScript expressions using ${...}
 */
function createTodoElement(todo) {
    /*
     * Format the creation date in a human-readable way
     * 
     * new Date() creates a Date object from the timestamp
     * toLocaleDateString() formats it according to locale settings
     */
    const createdDate = new Date(todo.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    /*
     * Return an HTML string for this todo
     * 
     * SECURITY NOTE: We use escapeHtml() to prevent XSS attacks
     * This converts special characters like < and > so they display as text
     * instead of being interpreted as HTML
     * 
     * CONDITIONAL RENDERING:
     * - ${todo.completed ? 'completed' : ''} adds 'completed' class if todo is done
     * - ${todo.description ? `<p>...</p>` : ''} only shows description if it exists
     * - This is called a ternary operator: condition ? valueIfTrue : valueIfFalse
     */
    return `
        <div class="todo-item ${todo.completed ? 'completed' : ''}">
            <div class="todo-header">
                <h3 class="todo-title">${escapeHtml(todo.title)}</h3>
                <div class="todo-actions">
                    <button 
                        id="complete-${todo.id}" 
                        class="btn btn-success" 
                        title="${todo.completed ? 'Mark as incomplete' : 'Mark as complete'}"
                    >
                        <span class="btn-icon">${todo.completed ? '↩️' : '✓'}</span>
                        ${todo.completed ? 'Undo' : 'Complete'}
                    </button>
                    <button 
                        id="delete-${todo.id}" 
                        class="btn btn-danger" 
                        title="Delete todo"
                    >
                        <span class="btn-icon">🗑️</span>
                        Delete
                    </button>
                </div>
            </div>
            ${todo.description ? `<p class="todo-description">${escapeHtml(todo.description)}</p>` : ''}
            <div class="todo-meta">
                <span class="todo-status ${todo.completed ? 'completed' : 'pending'}">
                    ${todo.completed ? '✓ Completed' : '○ Pending'}
                </span>
                <span class="todo-date">
                    <span>📅</span>
                    ${createdDate}
                </span>
            </div>
        </div>
    `;
}

// ============================================================================
// UI STATE FUNCTIONS - MANAGING DIFFERENT DISPLAY STATES
// ============================================================================

/*
 * These functions control what the user sees in different situations:
 * - Loading: When fetching data from the server
 * - Error: When something goes wrong
 * - Empty: When there are no todos to display
 * 
 * They work by adding/removing the 'hidden' CSS class, which sets display: none
 */

/*
 * showLoading: Displays the loading spinner
 * Called when we start fetching todos from the server
 */
function showLoading() {
    hideAllStates();
    loadingState.classList.remove('hidden');
}

/*
 * showError: Displays an error message
 * 
 * @param {string} message - The error message to display
 * 
 * Called when an API request fails
 */
function showError(message) {
    hideAllStates();
    errorMessage.textContent = message;
    errorState.classList.remove('hidden');
}

/*
 * showEmpty: Displays the empty state message
 * Called when there are no todos to display
 */
function showEmpty() {
    hideAllStates();
    emptyState.classList.remove('hidden');
}

/*
 * hideAllStates: Hides all state displays and clears the todos list
 * This is called before showing any specific state to ensure only one is visible
 */
function hideAllStates() {
    loadingState.classList.add('hidden');
    errorState.classList.add('hidden');
    emptyState.classList.add('hidden');
    todosList.innerHTML = '';  // Clear any existing todos
}

// ============================================================================
// UTILITY FUNCTIONS - HELPER FUNCTIONS
// ============================================================================

/*
 * escapeHtml: Prevents XSS (Cross-Site Scripting) attacks
 * 
 * @param {string} text - The text to escape
 * @returns {string} HTML-safe text
 * 
 * SECURITY EXPLANATION:
 * - If a user enters "<script>alert('hack')</script>" as a todo title,
 *   we don't want that script to execute
 * - This function converts special characters to HTML entities:
 *   < becomes &lt;
 *   > becomes &gt;
 *   & becomes &amp;
 * - This makes the text display safely without being interpreted as HTML/JavaScript
 * 
 * HOW IT WORKS:
 * - Create a temporary div element
 * - Set its textContent (which automatically escapes HTML)
 * - Read back the innerHTML (which gives us the escaped version)
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================================================
// AUTO-REFRESH FEATURE
// ============================================================================

/*
 * setInterval: Executes a function repeatedly at specified intervals
 * 
 * This automatically refreshes the todos every 30 seconds (30000 milliseconds)
 * 
 * WHY AUTO-REFRESH?
 * - If multiple users are using the app, they'll see each other's changes
 * - Keeps the UI in sync with the database
 * 
 * OPTIMIZATION:
 * - We check if we're currently loading before refreshing
 * - This prevents multiple simultaneous requests
 */
setInterval(() => {
    // Don't refresh if we're already loading
    if (!loadingState.classList.contains('hidden')) {
        return;
    }
    loadTodos();
}, 30000);  // 30000 milliseconds = 30 seconds

// Made with Bob