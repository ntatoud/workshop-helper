// src/routes/index.tsx
import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Workshop Helper
          </h1>
          <p className="text-xl text-gray-600">
            Manage and run interactive workshops with ease
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Manager Card */}
          <Link
            to="/manager"
            className="group p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1"
          >
            <div className="text-5xl mb-4">👨‍💼</div>
            <h2 className="text-3xl font-bold mb-4 group-hover:text-blue-600 transition-colors">
              Manager
            </h2>
            <p className="text-gray-600 mb-6">
              Create workshops, manage sessions, and control participant access
              to content
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✓ Create and organize workshops</li>
              <li>✓ Start live sessions</li>
              <li>✓ Manage participant access</li>
              <li>✓ Control content visibility</li>
            </ul>
            <div className="mt-6 text-blue-600 font-semibold group-hover:translate-x-2 transition-transform inline-block">
              Go to Dashboard →
            </div>
          </Link>

          {/* Participant Card */}
          <Link
            to="/app"
            className="group p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1"
          >
            <div className="text-5xl mb-4">🎓</div>
            <h2 className="text-3xl font-bold mb-4 group-hover:text-indigo-600 transition-colors">
              Participant
            </h2>
            <p className="text-gray-600 mb-6">
              Join a workshop session and access the content shared by your
              manager
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✓ Join with session code</li>
              <li>✓ Access workshop content</li>
              <li>✓ Get hints when needed</li>
              <li>✓ View solutions when ready</li>
            </ul>
            <div className="mt-6 text-indigo-600 font-semibold group-hover:translate-x-2 transition-transform inline-block">
              Join Session →
            </div>
          </Link>
        </div>

        <div className="mt-16 text-center text-gray-500">
          <p className="text-sm">
            Built with TanStack Start, Drizzle ORM, and oRPC
          </p>
        </div>
      </div>
    </div>
  )
}
