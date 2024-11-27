'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface Announcement {
  id: string
  title: string
  content: string
  date: string
}

export default function RecentAnnouncements() {
  const { data: session } = useSession()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])

  useEffect(() => {
    const fetchAnnouncements = async () => {
      if (session?.user?.id) {
        const announcementsRef = collection(db, 'announcements')
        const q = query(
          announcementsRef,
          where('userId', '==', session.user.id),
          orderBy('date', 'desc'),
          limit(5)
        )
        const querySnapshot = await getDocs(q)
        const fetchedAnnouncements = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Announcement))
        setAnnouncements(fetchedAnnouncements)
      }
    }

    fetchAnnouncements()
  }, [session])

  return (
    <div>
      {announcements.length > 0 ? (
        <ul className="space-y-4">
          {announcements.map((announcement) => (
            <li key={announcement.id} className="border-b pb-2">
              <h3 className="font-semibold">{announcement.title}</h3>
              <p className="text-sm text-gray-600">{announcement.content}</p>
              <span className="text-xs text-gray-500">{announcement.date}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p>No recent announcements.</p>
      )}
    </div>
  )
}

