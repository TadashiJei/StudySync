'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

interface Assignment {
  id: string
  name: string
  dueDate: string
  course: string
  submissionLink: string
  grade?: string
}

interface Announcement {
  id: string
  title: string
  message: string
  postedDate: string
}

interface Course {
  id: string
  name: string
  code: string
  progress: number
}

export default function CanvasIntegration() {
  const { data: session } = useSession()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (session?.user?.id) {
      fetchCanvasData()
    }
  }, [session])

  const fetchCanvasData = async () => {
    try {
      setLoading(true)
      // In a real implementation, you would make API calls to Canvas LMS here
      // For this example, we'll use mock data
      const mockAssignments: Assignment[] = [
        { id: '1', name: 'Math Homework', dueDate: '2024-12-01', course: 'Mathematics', submissionLink: '/canvas/submit/1', grade: '95%' },
        { id: '2', name: 'History Essay', dueDate: '2024-12-05', course: 'History', submissionLink: '/canvas/submit/2' },
        { id: '3', name: 'Science Project', dueDate: '2024-12-10', course: 'Science', submissionLink: '/canvas/submit/3', grade: '88%' },
      ]
      const mockAnnouncements: Announcement[] = [
        { id: '1', title: 'Exam Schedule', message: 'Final exams will be held next week.', postedDate: '2024-11-25' },
        { id: '2', title: 'Holiday Break', message: 'School will be closed for the holidays from Dec 20 to Jan 5.', postedDate: '2024-11-26' },
      ]
      const mockCourses: Course[] = [
        { id: '1', name: 'Mathematics', code: 'MATH101', progress: 75 },
        { id: '2', name: 'History', code: 'HIST201', progress: 60 },
        { id: '3', name: 'Science', code: 'SCI301', progress: 90 },
      ]
      setAssignments(mockAssignments)
      setAnnouncements(mockAnnouncements)
      setCourses(mockCourses)
      setError(null)
    } catch (err) {
      setError('Failed to fetch Canvas data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0])
    }
  }

  const handleSubmit = async (assignmentId: string) => {
    if (!selectedFile) {
      alert('Please select a file to submit')
      return
    }

    setSubmitting(true)
    try {
      // In a real implementation, you would make an API call to submit the assignment
      // For this example, we'll simulate a submission
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call
      alert('Assignment submitted successfully!')
      setSelectedFile(null)
    } catch (err) {
      alert('Failed to submit assignment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <Spinner />
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <Tabs defaultValue="assignments">
      <TabsList>
        <TabsTrigger value="assignments">Assignments</TabsTrigger>
        <TabsTrigger value="announcements">Announcements</TabsTrigger>
        <TabsTrigger value="courses">Courses</TabsTrigger>
      </TabsList>
      <TabsContent value="assignments">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            {assignments.map((assignment) => (
              <div key={assignment.id} className="mb-4 p-4 border rounded">
                <p className="font-semibold">{assignment.name}</p>
                <p className="text-sm text-gray-600">Course: {assignment.course}</p>
                <p className="text-sm text-gray-600">Due: {assignment.dueDate}</p>
                {assignment.grade && <p className="text-sm text-green-600">Grade: {assignment.grade}</p>}
                <div className="mt-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>Submit Assignment</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Submit Assignment: {assignment.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input type="file" onChange={handleFileChange} />
                        <div className="flex justify-between">
                          <Button onClick={() => handleSubmit(assignment.id)} disabled={submitting}>
                            {submitting ? 'Submitting...' : 'Submit'}
                          </Button>
                          <Button variant="outline" onClick={() => window.open(assignment.submissionLink, '_blank')}>
                            View on Canvas
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="announcements">
        <Card>
          <CardHeader>
            <CardTitle>Recent Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            {announcements.map((announcement) => (
              <div key={announcement.id} className="mb-4">
                <p className="font-semibold">{announcement.title}</p>
                <p className="text-sm">{announcement.message}</p>
                <p className="text-xs text-gray-500">Posted: {announcement.postedDate}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="courses">
        <Card>
          <CardHeader>
            <CardTitle>Your Courses</CardTitle>
          </CardHeader>
          <CardContent>
            {courses.map((course) => (
              <div key={course.id} className="mb-4 p-4 border rounded">
                <p className="font-semibold">{course.name}</p>
                <p className="text-sm text-gray-600">Course Code: {course.code}</p>
                <div className="mt-2">
                  <p className="text-sm mb-1">Progress: {course.progress}%</p>
                  <Progress value={course.progress} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

