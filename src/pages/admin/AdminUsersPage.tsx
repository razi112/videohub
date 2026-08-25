import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, User, AlertCircle, RefreshCw } from 'lucide-react'
import { useStore } from '../../store/useStore'

export default function AdminUsersPage() {
  const { adminUsers, adminUsersLoading, adminUsersError, loadAdminUsers } = useStore()

  useEffect(() => {
    loadAdminUsers()
  }, [loadAdminUsers])

  return (
    <div>
      <div className="flex items-start justify-between mb-1">
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Users</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={loadAdminUsers}
          disabled={adminUsersLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 glass rounded-xl text-white/50 text-sm hover:text-white hover:bg-white/10 transition-all disabled:opacity-40"
          aria-label="Refresh users"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${adminUsersLoading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </motion.button>
      </div>

      <p className="text-white/40 text-sm mb-6 sm:mb-8">
        {adminUsersLoading
          ? 'Loading…'
          : adminUsersError
          ? 'Could not load users'
          : `${adminUsers.length} registered user${adminUsers.length !== 1 ? 's' : ''}`}
      </p>

      {/* Error state */}
      {adminUsersError && !adminUsersLoading && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 glass rounded-2xl p-4 mb-6 border border-red-500/20 text-red-400"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium">Failed to load users</p>
            <p className="text-xs text-red-400/70 mt-0.5">{adminUsersError}</p>
            <p className="text-xs text-white/30 mt-2">
              Make sure migration <code className="text-white/50">002_user_profiles_view.sql</code> has been applied in
              your Supabase project (Dashboard → SQL Editor → run the file).
            </p>
          </div>
        </motion.div>
      )}

      {/* Loading skeleton */}
      {adminUsersLoading && adminUsers.length === 0 && (
        <div className="relative glass rounded-2xl overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[320px]">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="py-3 px-4 sm:px-5 text-left text-xs font-semibold text-white/30 uppercase tracking-wide">User</th>
                  <th className="py-3 px-4 sm:px-5 text-left text-xs font-semibold text-white/30 uppercase tracking-wide hidden md:table-cell">Email</th>
                  <th className="py-3 px-4 sm:px-5 text-left text-xs font-semibold text-white/30 uppercase tracking-wide">Role</th>
                  <th className="py-3 px-4 sm:px-5 text-left text-xs font-semibold text-white/30 uppercase tracking-wide hidden sm:table-cell">Joined</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/[0.05] last:border-b-0">
                    <td className="py-3 px-4 sm:px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full glass animate-pulse bg-white/10" />
                        <div className="h-3 w-28 rounded-full bg-white/10 animate-pulse" />
                      </div>
                    </td>
                    <td className="py-3 px-4 sm:px-5 hidden md:table-cell">
                      <div className="h-3 w-40 rounded-full bg-white/10 animate-pulse" />
                    </td>
                    <td className="py-3 px-4 sm:px-5">
                      <div className="h-5 w-14 rounded-full bg-white/10 animate-pulse" />
                    </td>
                    <td className="py-3 px-4 sm:px-5 hidden sm:table-cell">
                      <div className="h-3 w-20 rounded-full bg-white/10 animate-pulse" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users table */}
      {!adminUsersLoading && adminUsers.length > 0 && (
        <div className="relative glass rounded-2xl overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[320px]">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="py-3 px-4 sm:px-5 text-left text-xs font-semibold text-white/30 uppercase tracking-wide">User</th>
                  <th className="py-3 px-4 sm:px-5 text-left text-xs font-semibold text-white/30 uppercase tracking-wide hidden md:table-cell">Email</th>
                  <th className="py-3 px-4 sm:px-5 text-left text-xs font-semibold text-white/30 uppercase tracking-wide">Role</th>
                  <th className="py-3 px-4 sm:px-5 text-left text-xs font-semibold text-white/30 uppercase tracking-wide hidden sm:table-cell">Joined</th>
                </tr>
              </thead>
              <tbody>
                {adminUsers.map((user, i) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-white/[0.05] last:border-b-0 hover:bg-white/[0.03] transition-colors"
                  >
                    {/* User */}
                    <td className="py-3 px-4 sm:px-5">
                      <div className="flex items-center gap-2 sm:gap-3">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.name}
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover shrink-0 ${
                              user.role === 'admin' ? 'ring-1 ring-[#6c63ff]/50' : ''
                            }`}
                          />
                        ) : (
                          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 glass ${
                            user.role === 'admin' ? 'text-[#a78bfa] border border-[#6c63ff]/30' : 'text-white/40'
                          }`}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="text-xs sm:text-sm text-white/80 truncate max-w-[100px] sm:max-w-none">
                          {user.name}
                        </span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3 px-4 sm:px-5 hidden md:table-cell">
                      <span className="text-xs sm:text-sm text-white/40">{user.email}</span>
                    </td>

                    {/* Role */}
                    <td className="py-3 px-4 sm:px-5">
                      <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full glass ${
                        user.role === 'admin'
                          ? 'text-[#a78bfa] border border-[#6c63ff]/25'
                          : 'text-white/40'
                      }`}>
                        {user.role === 'admin'
                          ? <Shield className="w-3 h-3" />
                          : <User className="w-3 h-3" />}
                        {user.role}
                      </span>
                    </td>

                    {/* Joined */}
                    <td className="py-3 px-4 sm:px-5 hidden sm:table-cell">
                      <span className="text-xs sm:text-sm text-white/35">
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!adminUsersLoading && !adminUsersError && adminUsers.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 text-white/30"
        >
          <User className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-sm">No users found</p>
        </motion.div>
      )}
    </div>
  )
}
