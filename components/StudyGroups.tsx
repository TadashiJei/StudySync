'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"

interface StudyGroup {
  id: string
  name: string
  description: string
  members: string[]
  createdBy: string
}

export default function StudyGroups() {
  const { data: session } = useSession()
  const [groups, setGroups] = useState<StudyGroup[]>([])
  const [newGroup, setNewGroup] = useState<Omit<StudyGroup, 'id' | 'members' | 'createdBy'>>({ name: '', description: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (session?.user?.id) {
      fetchGroups()
    }
  }, [session])

  const fetchGroups = async () => {
    try {
      setLoading(true)
      const groupsRef = collection(db, 'studyGroups')
      const q = query(groupsRef, where('members', 'array-contains', session?.user?.id))
      const querySnapshot = await getDocs(q)
      const fetchedGroups = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudyGroup))
      setGroups(fetchedGroups)
      setError(null)
    } catch (err) {
      setError('Failed to fetch study groups. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const createGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (session?.user?.id) {
      try {
        const docRef = await addDoc(collection(db, 'studyGroups'), {
          ...newGroup,
          members: [session.user.id],
          createdBy: session.user.id
        })
        setGroups([...groups, { id: docRef.id, ...newGroup, members: [session.user.id], createdBy: session.user.id }])
        setNewGroup({ name: '', description: '' })
      } catch (err) {
        setError('Failed to create study group. Please try again.')
      }
    }
  }

  const leaveGroup = async (groupId: string) => {
    try {
      const groupRef = doc(db, 'studyGroups', groupId)
      await updateDoc(groupRef, {
        members: groups.find(g => g.id === groupId)?.members.filter(m => m !== session?.user?.id)
      })
      setGroups(groups.filter(group => group.id !== groupId))
    } catch (err) {
      setError('Failed to leave study group. Please try again.')
    }
  }

  if (loading) {
    return <Spinner />
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Study Groups</CardTitle>
      </CardHeader>
      <CardContent>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="mb-4">Create New Study Group</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Study Group</DialogTitle>
            </DialogHeader>
            <form onSubmit={createGroup} className="space-y-4">
              <Input
                placeholder="Group Name"
                value={newGroup.name}
                onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                required
              />
              <Textarea
                placeholder="Group Description"
                value={newGroup.description}
                onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                required
              />
              <Button type="submit">Create Group</Button>
            </form>
          </DialogContent>
        </Dialog>
        <div className="space-y-4">
          {groups.map((group) => (
            <Card key={group.id}>
              <CardHeader>
                <CardTitle>{group.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{group.description}</p>
                <p className="text-sm text-gray-600 mt-2">Members: {group.members.length}</p>
                <Button variant="outline" className="mt-2" onClick={() => leaveGroup(group.id)}>
                  Leave Group
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

