import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/manager/')({
  component: ManagerDashboard,
})

function ManagerDashboard() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Manager Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/manager/workshops"
          className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
        >
          <h2 className="text-2xl font-semibold mb-2">Workshops</h2>
          <p className="text-gray-600">Create and manage your workshops</p>
        </Link>

        <Link
          to="/manager/sessions"
          className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
        >
          <h2 className="text-2xl font-semibold mb-2">Live Sessions</h2>
          <p className="text-gray-600">
            Create sessions and manage participants
          </p>
        </Link>
      </div>
    </div>
  )
}
