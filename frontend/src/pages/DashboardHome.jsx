import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getUsers } from '../api/users'

function StatCard({ label, value, color, icon }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">{icon}</svg>
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-gray-400">{label}</p>
      </div>
    </div>
  )
}

export default function DashboardHome() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ total: 0, admins: 0, managers: 0, employees: 0 })

  useEffect(() => {
    getUsers().then((users) => {
      setStats({
        total: users.length,
        admins: users.filter(u => u.roles?.some(r => r.includes('ADMIN'))).length,
        managers: users.filter(u => u.roles?.some(r => r.includes('MANAGER'))).length,
        employees: users.filter(u => u.roles?.some(r => r.includes('EMPLOYEE'))).length,
      })
    }).catch(() => {})
  }, [])

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {user?.username} 👋
        </h1>
        <p className="text-gray-400 mt-1">Here's an overview of your Vaultify system.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Users"
          value={stats.total}
          color="bg-vault-500/15 text-vault-400"
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />}
        />
        <StatCard
          label="Admins"
          value={stats.admins}
          color="bg-red-900/30 text-red-400"
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />}
        />
        <StatCard
          label="Managers"
          value={stats.managers}
          color="bg-yellow-900/30 text-yellow-400"
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />}
        />
        <StatCard
          label="Employees"
          value={stats.employees}
          color="bg-blue-900/30 text-blue-400"
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />}
        />
      </div>

      {/* Security info */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">Security Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-gray-400 mb-1">Authentication</p>
            <p className="text-white font-medium">JWT + OAuth2 Bearer</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-gray-400 mb-1">Password Hashing</p>
            <p className="text-white font-medium">BCrypt (strength 10)</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-gray-400 mb-1">Access Control</p>
            <p className="text-white font-medium">RBAC — 3 role tiers</p>
          </div>
        </div>
      </div>
    </div>
  )
}
