import NextAuth from 'next-auth'
import CanvasLMS from 'next-auth/providers/canvas-lms'
import { FirestoreAdapter } from '@next-auth/firebase-adapter'
import { db } from '@/lib/firebase'

export default NextAuth({
  providers: [
    CanvasLMS({
      clientId: process.env.CANVAS_CLIENT_ID,
      clientSecret: process.env.CANVAS_CLIENT_SECRET,
      wellKnown: `${process.env.CANVAS_INSTANCE_URL}/.well-known/openid-configuration`,
    }),
  ],
  adapter: FirestoreAdapter(db),
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id
      return session
    },
  },
})

