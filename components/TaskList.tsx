'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Spinner } from "@/components/ui/spinner"

interface Task {
  id: string
  title: string
  completed: boolean
}

export default function TaskList() {
  const { data: session } = useSession()
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTasks()
  }, [session])

  const fetchTasks = async () => {
    if (session?.user?.id) {
      try {
        setLoading(true)
        const tasksRef = collection(db, 'tasks')
        const q = query(tasksRef, where('userId', '==', session.user.id))
        const querySnapshot = await getDocs(q)
        const fetchedTasks = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Task))
        setTasks(fetchedTasks)
        setError(null)
      } catch (err) {
        setError('Failed to fetch tasks. Please try again.')
      } finally {
        setLoading(false)
      }
    }
  }

  const addTask = async () => {
    if (newTask.trim() !== '' && session?.user?.id) {
      try {
        const docRef = await addDoc(collection(db, 'tasks'), {
          title: newTask,
          completed: false,
          userId: session.user.id
        })
        setTasks([...tasks, { id: docRef.id, title: newTask, completed: false }])
        setNewTask('')
      } catch (err) {
        setError('Failed to add task. Please try again.')
      }
    }
  }

  const toggleTask = async (id: string) => {
    try {
      const taskRef = doc(db, 'tasks', id)
      const task = tasks.find(t => t.id === id)
      if (task) {
        await updateDoc(taskRef, {
          completed: !task.completed
        })
        setTasks(tasks.map(task => 
          task.id === id ? { ...task, completed: !task.completed } : task
        ))
      }
    } catch (err) {
      setError('Failed to update task. Please try again.')
    }
  }

  const deleteTask = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', id))
      setTasks(tasks.filter(task => task.id !== id))
    } catch (err) {
      setError('Failed to delete task. Please try again.')
    }
  }

  if (loading) {
    return <Spinner />
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Input
          type="text"
          placeholder="Add a new task"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <Button onClick={addTask}>Add</Button>
      </div>
      {tasks.length > 0 ? (
        <ul className="space-y-2">
          {tasks.map(task => (
            <li key={task.id} className="flex items-center space-x-2">
              <Checkbox
                id={`task-${task.id}`}
                checked={task.completed}
                onCheckedChange={() => toggleTask(task.id)}
              />
              <label
                htmlFor={`task-${task.id}`}
                className={`flex-grow ${task.completed ? 'line-through text-gray-500' : ''}`}
              >
                {task.title}
              </label>
              <Button variant="destructive" size="sm" onClick={() => deleteTask(task.id)}>Delete</Button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No tasks yet. Add a task to get started!</p>
      )}
    </div>
  )
}

