'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

interface Class {
  id: string
  name: string
  day: string
  startTime: string
  endTime: string
  room: string
}

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function ClassSchedule() {
  const { data: session } = useSession()
  const [classes, setClasses] = useState<Class[]>([])
  const [newClass, setNewClass] = useState<Omit<Class, 'id'>>({ name: '', day: '', startTime: '', endTime: '', room: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchClasses()
  }, [session])

  const fetchClasses = async () => {
    if (session?.user?.id) {
      try {
        setLoading(true)
        const classesRef = collection(db, 'classes')
        const q = query(classesRef, where('userId', '==', session.user.id))
        const querySnapshot = await getDocs(q)
        const fetchedClasses = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Class))
        setClasses(fetchedClasses)
        setError(null)
      } catch (err) {
        setError('Failed to fetch classes. Please try again.')
      } finally {
        setLoading(false)
      }
    }
  }

  const addClass = async (e: React.FormEvent) => {
    e.preventDefault()
    if (session?.user?.id) {
      try {
        const docRef = await addDoc(collection(db, 'classes'), {
          ...newClass,
          userId: session.user.id
        })
        setClasses([...classes, { id: docRef.id, ...newClass }])
        setNewClass({ name: '', day: '', startTime: '', endTime: '', room: '' })
      } catch (err) {
        setError('Failed to add class. Please try again.')
      }
    }
  }

  const updateClass = async (id: string, updatedClass: Partial<Class>) => {
    try {
      const classRef = doc(db, 'classes', id)
      await updateDoc(classRef, updatedClass)
      setClasses(classes.map(c => c.id === id ? { ...c, ...updatedClass } : c))
    } catch (err) {
      setError('Failed to update class. Please try again.')
    }
  }

  const deleteClass = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'classes', id))
      setClasses(classes.filter(c => c.id !== id))
    } catch (err) {
      setError('Failed to delete class. Please try again.')
    }
  }

  if (loading) {
    return <Spinner />
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <div className="space-y-6">
      <form onSubmit={addClass} className="space-y-4">
        <Input
          type="text"
          placeholder="Class Name"
          value={newClass.name}
          onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
          required
        />
        <Select
          value={newClass.day}
          onValueChange={(value) => setNewClass({ ...newClass, day: value })}
          required
        >
          <Select.Trigger>
            <Select.Value placeholder="Select day" />
          </Select.Trigger>
          <Select.Content>
            {days.map((day) => (
              <Select.Item key={day} value={day}>
                {day}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
        <Input
          type="time"
          value={newClass.startTime}
          onChange={(e) => setNewClass({ ...newClass, startTime: e.target.value })}
          required
        />
        <Input
          type="time"
          value={newClass.endTime}
          onChange={(e) => setNewClass({ ...newClass, endTime: e.target.value })}
          required
        />
        <Input
          type="text"
          placeholder="Room"
          value={newClass.room}
          onChange={(e) => setNewClass({ ...newClass, room: e.target.value })}
          required
        />
        <Button type="submit">Add Class</Button>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((c) => (
          <Card key={c.id}>
            <CardHeader>
              <CardTitle>{c.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Day: {c.day}</p>
              <p>Time: {c.startTime} - {c.endTime}</p>
              <p>Room: {c.room}</p>
              <div className="mt-4 space-x-2">
                <Button onClick={() => updateClass(c.id, { name: prompt('Enter new class name', c.name) || c.name })}>
                  Edit
                </Button>
                <Button variant="destructive" onClick={() => deleteClass(c.id)}>Delete</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

