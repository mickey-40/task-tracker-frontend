import { useEffect, useState } from "react";
import axios from "axios";

function Home() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'Low'
  });
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [filterCompleted, setFilterCompleted] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');


  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/tasks`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setNewTask({
      ...newTask,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTaskId) {
        await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/tasks/${editingTaskId}`, newTask);
      } else {
        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/tasks`, newTask);
      }
      setNewTask({ title: '', description: '', priority: 'Low' });
      setEditingTaskId(null);
      fetchTasks();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/tasks/${id}`);
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleEdit = (task) => {
    setNewTask({
      title: task.title,
      description: task.description,
      priority: task.priority
    });
    setEditingTaskId(task._id);
  };

  const handleToggleCompleted = async (task) => {
    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/tasks/${task._id}`, {
        ...task,
        completed: !task.completed
      });
      fetchTasks();
    } catch (error) {
      console.error('Error toggling completed:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <h2 className="text-2xl">Loading tasks...</h2>
      </div>
    );
  }

  // Apply filters
  const filteredTasks = tasks.filter(task => {
    const completedMatch =
      filterCompleted === 'all' ||
      (filterCompleted === 'completed' && task.completed) ||
      (filterCompleted === 'incomplete' && !task.completed);

    const priorityMatch =
      filterPriority === 'all' || task.priority === filterPriority;

    return completedMatch && priorityMatch;
  });


  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto mb-8">
        <h2 className="text-2xl font-semibold mb-4">{editingTaskId ? 'Edit Task' : 'Add New Task'}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={newTask.title}
            onChange={handleChange}
            className="w-full p-2 mb-4 border rounded"
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={newTask.description}
            onChange={handleChange}
            className="w-full p-2 mb-4 border rounded"
          />
          <select
            name="priority"
            value={newTask.priority}
            onChange={handleChange}
            className="w-full p-2 mb-4 border rounded"
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
            {editingTaskId ? 'Update Task' : 'Add Task'}
          </button>
        </form>
      </div>
      {/* Filters */}
      <div className="flex justify-center gap-4 mb-8">
        <select
          value={filterCompleted}
          onChange={(e) => setFilterCompleted(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="all">All</option>
          <option value="completed">Completed</option>
          <option value="incomplete">Incomplete</option>
        </select>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="all">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>


      {/* Task List */}
      {tasks.length === 0 ? (
        <p className="text-center text-gray-600">No tasks found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map(task => (
            <div key={task._id} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-2">{task.title}</h2>
              <p className="text-gray-700">{task.description}</p>
              <p className="text-sm text-gray-500 mt-2">Priority: {task.priority}</p>
              <p className="text-sm text-gray-500">Completed: {task.completed ? 'Yes' : 'No'}</p>

              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={() => handleEdit(task)}
                  className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleToggleCompleted(task)}
                  className={`${
                    task.completed ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'
                  } text-white py-1 px-3 rounded transition`}
                >
                  {task.completed ? 'Mark Incomplete' : 'Mark Completed'}
                </button>
                <button
                  onClick={() => handleDelete(task._id)}
                  className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
