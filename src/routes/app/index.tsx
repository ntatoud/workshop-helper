// src/routes/participant/index.tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { orpc } from '@/orpc/client'

export const Route = createFileRoute('/app/')({
  component: ParticipantJoinPage,
})

function ParticipantJoinPage() {
  const navigate = useNavigate()
  const [sessionCode, setSessionCode] = useState('')
  const [participantName, setParticipantName] = useState('')
  const [error, setError] = useState('')

  const getSession = useMutation(orpc.sessions.getByCode.mutationOptions())
  const joinSession = useMutation(orpc.participants.join.mutationOptions())

  const handleJoin = async () => {
    setError('')
    try {
      // First, verify the session exists
      const session = await getSession.mutateAsync({
        code: sessionCode.toUpperCase(),
      })

      // Then join the session
      const participant = await joinSession.mutateAsync({
        sessionId: session.id,
        name: participantName,
      })

      // Navigate to participant view
      navigate({
        to: '/app/$sessionId/$participantId',
        params: {
          sessionId: session.id.toString(),
          participantId: participant.id.toString(),
        },
      })
    } catch (err: any) {
      setError(err.message || 'Failed to join session')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-4xl font-bold text-center mb-8">Join Workshop</h1>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Your Name</label>
            <input
              type="text"
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Session Code
            </label>
            <input
              type="text"
              value={sessionCode}
              onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 border rounded-lg font-mono text-2xl text-center tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="ABC123"
              maxLength={10}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <button
            onClick={handleJoin}
            disabled={
              !participantName ||
              !sessionCode ||
              getSession.isPending ||
              joinSession.isPending
            }
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
          >
            {getSession.isPending || joinSession.isPending
              ? 'Joining...'
              : 'Join Session'}
          </button>
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Get the session code from your workshop manager</p>
        </div>
      </div>
    </div>
  )
}
