import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { getUsers, createUser, updateUser, deleteUser } from '../api/users'

function RoleBadge({ role }) {
  if (role.includes('ADMIN')) return <span className="badge-admin">Admin</span>
  if (role.includes('MANAGER')) return <span className="badge-manager">Manager</span>
  return <span className="badge-employee">Employee</span>
}

function UserModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
    password: '',
    roles: user?.roles || ['ROLE_EMPLOYEE'],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const roleOptions = [
    { value: 'ROLE_EMPLOYEE', label: 'Employee' },
    { value: 'ROLE_MANAGER', label: 'Manager' },
    { value: 'ROLE_ADMIN', label: 'Admin' },
  ]

  const handleRoleToggle = (role) => {
    setForm(f => ({
      ...f,
      roles: f.roles.includes(role)
        ? f.roles.filter(r => r !== role)
        : [...f.roles, role],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = { ...form }
      if (!payload.password) delete payload.password
      await onSave(payload)
      onClose()
    } catch (err) {
      const data = err.response?.data
      if (typeof data === 'object' && !data.message) {
        setError(Object.values(data).join(', '))
      } else {
        setError(data?.message || 'Something went wrong')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">{user ? 'Edit User' : 'Create User'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!user && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Username</label>
              <input className="input-field" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
            <input type="email" className="input-field" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required={!user} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Password {user && <span className="text-gray-500">(leave blank to keep current)</span>}
            </label>
            <input type="password" className="input-field" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required={!user} minLength={!user ? 8 : 0} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Roles</label>
            <div className="flex gap-2 flex-wrap">
              {roleOptions.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleRoleToggle(value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    form.roles.includes(value)
                      ? 'bg-vault-500/20 border-vault-500/50 text-vault-300'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-300 text-sm px-4 py-3 rounded-lg">{error}</div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? 'Saving…' : user ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function UsersPage() {
  const { isAdmin, isManager } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingUser, setEditingUser] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const fetchUsers = useCallback(() => {
    setLoading(true)
    getUsers().then(setUsers).finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = async (data) => {
    await createUser(data)
    fetchUsers()
  }

  const handleUpdate = async (data) => {
    await updateUser(editingUser.id, data)
    fetchUsers()
  }

  const handleDelete = async (id) => {
    await deleteUser(id)
    setDeleteConfirm(null)
    fetchUsers()
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-gray-400 text-sm mt-1">{users.length} users registered</p>
        </div>
        {isManager && (
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add User
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          className="input-field pl-10"
          placeholder="Search users…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                <th className="text-left px-6 py-3">User</th>
                <th className="text-left px-6 py-3">Roles</th>
                <th className="text-left px-6 py-3">Status</th>
                <th className="text-left px-6 py-3">Joined</th>
                {(isManager || isAdmin) && <th className="text-right px-6 py-3">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {loading ? (
                <tr><td colSpan={5} className="text-center text-gray-500 py-12">Loading users…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-gray-500 py-12">No users found</td></tr>
              ) : filtered.map(u => (
                <tr key={u.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-vault-500/20 flex items-center justify-center text-vault-400 font-bold text-sm flex-shrink-0">
                        {u.username[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-white">{u.username}</p>
                        <p className="text-gray-500 text-xs">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1.5 flex-wrap">
                      {u.roles?.map(r => <RoleBadge key={r} role={r} />)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${u.enabled ? 'text-green-400' : 'text-gray-500'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.enabled ? 'bg-green-400' : 'bg-gray-500'}`} />
                      {u.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                  </td>
                  {(isManager || isAdmin) && (
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {isManager && (
                          <button
                            onClick={() => setEditingUser(u)}
                            className="text-gray-400 hover:text-vault-400 transition-colors p-1.5 rounded-lg hover:bg-vault-500/10"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            onClick={() => setDeleteConfirm(u)}
                            className="text-gray-400 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showCreate && (
        <UserModal onClose={() => setShowCreate(false)} onSave={handleCreate} />
      )}
      {editingUser && (
        <UserModal user={editingUser} onClose={() => setEditingUser(null)} onSave={handleUpdate} />
      )}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-2">Delete User</h3>
            <p className="text-gray-400 text-sm mb-6">
              Are you sure you want to delete <strong className="text-white">{deleteConfirm.username}</strong>? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm.id)} className="btn-danger flex-1">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
