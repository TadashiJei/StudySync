'use client'

import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TaskList from '@/components/TaskList'
import ClassSchedule from '@/components/ClassSchedule'
import EventManagement from '@/components/EventManagement'
import CanvasIntegration Resources from '@/components/StudyResources'
import StudyGroups from '@/components/StudyGroups'

export default function Dashboard() {
  const { data: session } = useSession()

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <Image
          src="https://example.com/path-to-your-logo.png"
          alt="StudySync Logo"
          width={400}
          height={100}
          className="w-64 h-auto"
        />
        <h1 className="text-3xl font-bold">Welcome, {session?.user?.name}</h1>
      </div>
      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="schedule">Class Schedule</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="canvas">Canvas LMS</TabsTrigger>
          <TabsTrigger value="resources">Study Resources</TabsTrigger>
          <TabsTrigger value="groups">Study Groups</TabsTrigger>
        </TabsList>
        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
              <CardDescription>Manage your tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <TaskList />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Class Schedule</CardTitle>
              <CardDescription>Manage your class schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <ClassSchedule />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Events</CardTitle>
              <CardDescription>Manage your events</CardDescription>
            </CardHeader>
            <CardContent>
              <EventManagement />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="canvas">
          <Card>
            <CardHeader>
              <CardTitle>Canvas LMS Integration</CardTitle>
              <CardDescription>View and manage your Canvas LMS data</CardDescription>
            </CardHeader>
            <CardContent>
              <CanvasIntegration />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="resources">
          <StudyResources />
        </TabsContent>
        <TabsContent value="groups">
          <StudyGroups />
        </TabsContent>
      </Tabs>
    </div>
  )
}

