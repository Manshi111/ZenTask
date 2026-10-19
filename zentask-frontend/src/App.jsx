import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [tasks, setTasks] = useState([])
  
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDesc, setNewTaskDesc] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await axios.get('http://127.0.0.1:8080/api/tasks/', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTasks(response.data.reverse()) 
    } catch (error) {
      setIsLoggedIn(false)
    }
  }

  useEffect(() => {
    if (isLoggedIn) fetchTasks()
  }, [isLoggedIn])

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post('http://127.0.0.1:8080/api/token/', { email, password })
      localStorage.setItem('access_token', response.data.access)
      setIsLoggedIn(true)
    } catch (error) {
      alert("Login Failed!")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    setIsLoggedIn(false)
    setTasks([])
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    setIsCreating(true)
    try {
      const token = localStorage.getItem('access_token')
      await axios.post('http://127.0.0.1:8080/api/tasks/', 
        { title: newTaskTitle, description: newTaskDesc }, 
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setNewTaskTitle('')
      setNewTaskDesc('')
      fetchTasks() 
    } catch (error) {
      alert("Error creating task")
    } finally {
      setIsCreating(false)
    }
  }

  // NAYA FUNCTION 1: Task ko Done/Undo Mark karna (PATCH Request)
  const handleToggleStatus = async (taskId, currentStatus) => {
    try {
      const token = localStorage.getItem('access_token')
      const newStatus = currentStatus === 'DONE' ? 'TODO' : 'DONE' // Agar pehle se Done hai, toh TODO kar do
      
      await axios.patch(`http://127.0.0.1:8080/api/tasks/${taskId}/`, 
        { status: newStatus }, // Sirf status update kar rahe hain
        { headers: { Authorization: `Bearer ${token}` } }
      )
      fetchTasks() // List refresh karo
    } catch (error) {
      alert("Error updating task")
    }
  }

  // NAYA FUNCTION 2: Task Delete karna (DELETE Request)
  const handleDelete = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        const token = localStorage.getItem('access_token')
        await axios.delete(`http://127.0.0.1:8080/api/tasks/${taskId}/`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        fetchTasks() // List refresh karo
      } catch (error) {
        alert("Error deleting task")
      }
    }
  }

  if (isLoggedIn) {
    return (
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>ZenTask Dashboard </h1>
          <button onClick={handleLogout} style={{ padding: '8px 15px', background: '#ff4d4d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
        <hr style={{ marginBottom: '20px' }}/>

        <div style={{ background: '#f0f4f8', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
          <h3>➕ Create New Task</h3>
          <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input type="text" placeholder="Task Title" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
            <textarea placeholder="Description" value={newTaskDesc} onChange={(e) => setNewTaskDesc(e.target.value)} rows="3" style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
            <button type="submit" disabled={isCreating} style={{ padding: '12px', background: isCreating ? '#888' : '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
              {isCreating ? 'AI is analyzing...' : 'Add Task'}
            </button>
          </form>
        </div>

        <h2>Your Tasks:</h2>
        {tasks.length === 0 ? <p>No tasks found.</p> : null}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {tasks.map((task) => (
            // Agar task DONE hai, toh uska background thoda grey kar denge (opacity kam)
            <div key={task.id} style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', background: 'white', opacity: task.status === 'DONE' ? 0.6 : 1 }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h3 style={{ margin: '0 0 10px 0', textDecoration: task.status === 'DONE' ? 'line-through' : 'none' }}>
                  {task.title}
                </h3>
                
                {/* Naye Action Buttons */}
                <div>
                  <button onClick={() => handleToggleStatus(task.id, task.status)} style={{ marginRight: '10px', padding: '5px 10px', cursor: 'pointer', background: task.status === 'DONE' ? '#ff9800' : '#4CAF50', color: 'white', border: 'none', borderRadius: '3px' }}>
                    {task.status === 'DONE' ? 'Undo' : 'Mark Done'}
                  </button>
                  <button onClick={() => handleDelete(task.id)} style={{ padding: '5px 10px', cursor: 'pointer', background: 'red', color: 'white', border: 'none', borderRadius: '3px' }}>
                    Delete
                  </button>
                </div>
              </div>

              <p style={{ margin: '0 0 10px 0', color: '#666' }}>{task.description}</p>
              
              {task.is_ai_processed && (
                <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '8px', marginTop: '15px', borderLeft: '4px solid #2196F3' }}>
                  <p style={{ margin: '0 0 8px 0' }}> <strong>AI Priority:</strong> <span style={{ color: task.ai_priority === 'CRITICAL' ? 'red' : 'darkblue' }}>{task.ai_priority}</span></p>
                  <p style={{ margin: '0 0 8px 0' }}> <strong>Tags:</strong> {task.ai_tags.join(', ')}</p>
                  <p style={{ margin: '0', color: '#0d47a1' }}> <strong>Next Action:</strong> {task.ai_next_action}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'Arial' }}>
      <h1>ZenTask </h1>
      <form onSubmit={handleLogin} style={{ display: 'inline-flex', flexDirection: 'column', gap: '10px' }}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '12px', width: '280px', borderRadius: '5px' }} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '12px', width: '280px', borderRadius: '5px' }} />
        <button type="submit" style={{ padding: '12px', background: '#2196F3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Login</button>
      </form>
    </div>
  )
}

export default App