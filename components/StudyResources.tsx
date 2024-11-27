'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

interface Resource {
  id: string
  title: string
  url: string
  category: string
}

export default function StudyResources() {
  const { data: session } = useSession()
  const [resources, setResources] = useState<Resource[]>([])
  const [newResource, setNewResource] = useState<Omit<Resource, 'id'>>({ title: '', url: '', category: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (session?.user?.id) {
      fetchResources()
    }
  }, [session])

  const fetchResources = async () => {
    try {
      setLoading(true)
      const resourcesRef = collection(db, 'studyResources')
      const q = query(resourcesRef, where('userId', '==', session?.user?.id))
      const querySnapshot = await getDocs(q)
      const fetchedResources = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Resource))
      setResources(fetchedResources)
      setError(null)
    } catch (err) {
      setError('Failed to fetch study resources. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const addResource = async (e: React.FormEvent) => {
    e.preventDefault()
    if (session?.user?.id) {
      try {
        const docRef = await addDoc(collection(db, 'studyResources'), {
          ...newResource,
          userId: session.user.id
        })
        setResources([...resources, { id: docRef.id, ...newResource }])
        setNewResource({ title: '', url: '', category: '' })
      } catch (err) {
        setError('Failed to add study resource. Please try again.')
      }
    }
  }

  const deleteResource = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'studyResources', id))
      setResources(resources.filter(resource => resource.id !== id))
    } catch (err) {
      setError('Failed to delete study resource. Please try again.')
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
        <CardTitle>Study Resources</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={addResource} className="space-y-4 mb-6">
          <Input
            type="text"
            placeholder="Resource Title"
            value={newResource.title}
            onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
            required
          />
          <Input
            type="url"
            placeholder="Resource URL"
            value={newResource.url}
            onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
            required
          />
          <Input
            type="text"
            placeholder="Category"
            value={newResource.category}
            onChange={(e) => setNewResource({ ...newResource, category: e.target.value })}
            required
          />
          <Button type="submit">Add Resource</Button>
        </form>
        <div className="space-y-4">
          {resources.map((resource) => (
            <div key={resource.id} className="flex justify-between items-center p-4 border rounded">
              <div>
                <h3 className="font-semibold">{resource.title}</h3>
                <p className="text-sm text-gray-600">{resource.category}</p>
                <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  View Resource
                </a>
              </div>
              <Button variant="destructive" onClick={() => deleteResource(resource.id)}>Delete</Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

