'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Spinner } from "@/components/ui/spinner"

interface SemesterPlan {
  id: string
  name: string
  startDate: string
  endDate: string
  courses: string[]
}

interface ProjectMilestone {
  id: string
  projectName: string
  milestoneName: string
  dueDate: string
}

interface StudySchedule {
  id: string
  subject: string
  dayOfWeek: string
  startTime: string
  endTime: string
}

export default function FuturePlanning() {
  const { data: session } = useSession()
  const [semesterPlans, setSemesterPlans] = useState<SemesterPlan[]>([])
  const [projectMilestones, setProjectMilestones] = useState<ProjectMilestone[]>([])
  const [studySchedules, setStudySchedules] = useState<StudySchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (session?.user?.id) {
      fetchFuturePlanningData()
    }
  }, [session])

  const fetchFuturePlanningData = async () => {
    try {
      setLoading(true)
      // Fetch semester plans
      const semesterPlansRef = collection(db, 'semesterPlans')
      const semesterPlansQuery = query(semesterPlansRef, where('userId', '==', session?.user?.id))
      const semesterPlansSnapshot = await getDocs(semesterPlansQuery)
      const fetchedSemesterPlans = semesterPlansSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SemesterPlan))
      setSemesterPlans(fetchedSemesterPlans)

      // Fetch project milestones
      const projectMilestonesRef = collection(db, 'projectMilestones')
      const projectMilestonesQuery = query(projectMilestonesRef, where('userId', '==', session?.user?.id))
      const projectMilestonesSnapshot = await getDocs(projectMilestonesQuery)
      const fetchedProjectMilestones = projectMilestonesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProjectMilestone))
      setProjectMilestones(fetchedProjectMilestones)

      // Fetch study schedules
      const studySchedulesRef = collection(db, 'studySchedules')
      const studySchedulesQuery = query(studySchedulesRef, where('userId', '==', session?.user?.id))
      const studySchedulesSnapshot = await getDocs(studySchedulesQuery)
      const fetchedStudySchedules = studySchedulesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudySchedule))
      setStudySchedules(fetchedStudySchedules)

      setError(null)
    } catch (err) {
      setError('Failed to fetch future planning data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const addSemesterPlan = async (plan: Omit<SemesterPlan, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, 'semesterPlans'), {
        ...plan,
        userId: session?.user?.id
      })
      setSemesterPlans([...semesterPlans, { id: docRef.id, ...plan }])
    } catch (err) {
      setError('Failed to add semester plan. Please try again.')
    }
  }

  const addProjectMilestone = async (milestone: Omit<ProjectMilestone, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, 'projectMilestones'), {
        ...milestone,
        userId: session?.user?.id
      })
      setProjectMilestones([...projectMilestones, { id: docRef.id, ...milestone }])
    } catch (err) {
      setError('Failed to add project milestone. Please try again.')
    }
  }

  const addStudySchedule = async (schedule: Omit<StudySchedule, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, 'studySchedules'), {
        ...schedule,
        userId: session?.user?.id
      })
      setStudySchedules([...studySchedules, { id: docRef.id, ...schedule }])
    } catch (err) {
      setError('Failed to add study schedule. Please try again.')
    }
  }

  if (loading) {
    return <Spinner />
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <Tabs defaultValue="semester">
      <TabsList>
        <TabsTrigger value="semester">Semester Planning</TabsTrigger>
        <TabsTrigger value="projects">Project Milestones</TabsTrigger>
        <TabsTrigger value="study">Study Schedules</TabsTrigger>
      </TabsList>
      <TabsContent value="semester">
        <Card>
          <CardHeader>
            <CardTitle>Semester Planning</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Add form for semester planning here */}
            {semesterPlans.map((plan) => (
              <div key={plan.id} className="mb-4 p-4 border rounded">
                <p className="font-semibold">{plan.name}</p>
                <p>Start Date: {plan.startDate}</p>
                <p>End Date: {plan.endDate}</p>
                <p>Courses: {plan.courses.join(', ')}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="projects">
        <Card>
          <CardHeader>
            <CardTitle>Project Milestones</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Add form for project milestones here */}
            {projectMilestones.map((milestone) => (
              <div key={milestone.id} className="mb-4 p-4 border rounded">
                <p className="font-semibold">{milestone.projectName}</p>
                <p>Milestone: {milestone.milestoneName}</p>
                <p>Due Date: {milestone.dueDate}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="study">
        <Card>
          <CardHeader>
            <CardTitle>Study Schedules</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Add form for study schedules here */}
            {studySchedules.map((schedule) => (
              <div key={schedule.id} className="mb-4 p-4 border rounded">
                <p className="font-semibold">{schedule.subject}</p>
                <p>Day: {schedule.dayOfWeek}</p>
                <p>Time: {schedule.startTime} - {schedule.endTime}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

