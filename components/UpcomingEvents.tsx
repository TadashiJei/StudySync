'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface Event {
  id: string
  title: string
  date: string
}

export default function UpcomingEvents() {
  const { data: session } = useSession()
  const [events, setEvents] = useState<Event[]>([])

  useEffect(() => {
    const fetchEvents = async () => {
      if (session?.user?.id) {
        const eventsRef = collection(db, 'events')
        const q = query(eventsRef, where('userId', '==', session.user.id))
        const querySnapshot = await getDocs(q)
        const fetchedEvents = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Event))
        setEvents(fetchedEvents)
      }
    }

    fetchEvents()
  }, [session])

  return (
    <div>
      {events.length > 0 ? (
        <ul className="space-y-2">
          {events.map((event) => (
            <li key={event.id} className="flex justify-between items-center">
              <span>{event.title}</span>
              <span className="text-sm text-gray-500">{event.date}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p>No upcoming events.</p>
      )}
    </div>
  )
}

