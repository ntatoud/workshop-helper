export function SessionEmptyAccess() {
  return (
    <div className="bg-white rounded-lg shadow p-12 text-center">
      <div className="text-6xl mb-4">⏳</div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Waiting for Access
      </h2>
      <p className="text-gray-600">
        The workshop manager hasn't granted you access to any content yet.
        <br />
        Please wait while they set up your access.
      </p>
    </div>
  )
}
