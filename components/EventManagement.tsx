'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
}

export default function EventManagement() {
  const { data: session } = useSession()
  const [events, setEvents] = useState<Event[]>([])
  const [newEvent, setNewEvent] = useState<Omit<Event, 'id'>>({ title: '', description: '', date: '', time: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEvents()
  }, [session])

  const fetchEvents = async () => {
    if (session?.user?.id) {
      try {
        setLoading(true)
        const eventsRef = collection(db, 'events')
        const q = query(eventsRef, where('userId', '==', session.user.id))
        const querySnapshot = await getDocs(q)
        const fetchedEvents = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Event))
        setEvents(fetchedEvents)
        setError(null)
      } catch (err) {
        setError('Failed to fetch events. Please try again.')
      } finally {
        setLoading(false)
      }
    }
  }

  const addEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (session?.user?.id) {
      try {
        const docRef = await addDoc(collection(db, 'events'), {
          ...newEvent,
          userId: session.user.id
        })
        setEvents([...events, { id: docRef.id, ...newEvent }])
        setNewEvent({ title: '', description: '', date: '', time: '' })
      } catch (err) {
        setError('Failed to add event. Please try again.')
      }
    }
  }

  const updateEvent = async (id: string, updatedEvent: Partial<Event>) => {
    try {
      const eventRef = doc(db, 'events', id)
      await updateDoc(eventRef, updatedEvent)
      setEvents(events.map(e => e.id === id ? { ...e, ...updatedEvent } : e))
    } catch (err) {
      setError('Failed to update event. Please try again.')
    }
  }

  const deleteEvent = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'events', id))
      setEvents(events.filter(e => e.id !== id))
    } catch (err) {
      setError('Failed to delete event. Please try again.')
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
      <form onSubmit={addEvent} className="space-y-4">
        <Input
          type="text"
          placeholder="Event Title"
          value={newEvent.title}
          onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
          required
        />
        <Textarea
          placeholder="Event Description"
          value={newEvent.description}
          onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
          required
        />
        <Input
          type="date"
          value={newEvent.date}
          onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
          required
        />
        <Input
          type="time"
          value={newEvent.time}
          onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
          required
        />
        <Button type="submit">Add Event</Button>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => (
          <Card key={event.id}>
            <CardHeader>
              <CardTitle>{event.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{event.description}</p>
              <p>Date: {event.date}</p>
              <p>Time: {event.time}</p>
              <div className="mt-4 space-x-2">
                <Button onClick={() => updateEvent(event.id, { title: prompt('Enter new event title', event.title) || event.title })}>
                  Edit
                </Button>
                <Button variant="destructive" onClick={() => deleteEvent(event.id)}>Delete</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

