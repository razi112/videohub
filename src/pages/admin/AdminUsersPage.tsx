import { motion } from 'framer-motion'
import { Shield, User } from 'lucide-react'

const mockUsersDisplay = [
  { id: '1', name: 'Admin User',  email: 'admin@videohub.com', role: 'admin', joined: '2024-01-01' },
  { id: '2', name: 'Demo User',   email: 'user@videohub.com',  role: 'user',  joined: '2024-02-15' },
  { id: '3', name: 'John Smith',  email: 'john@example.com',   role: 'user',  joined: '2024-03-01' },
  { id: '4', name: 'Sarah Ahmed', email: 'sarah@example.com',  role: 'user',  joined: '2024-03-10' },
  { id: '5', name: 'Ali Hassan',  email: 'ali@example.com',    role: 'user',  joined: '2024-03-20' },
]

export default function AdminUsersPage() {
  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">Users</h1>
      <p className="text-gray-500 text-sm mb-6 sm:mb-8">{mockUsersDisplay.length} registered users</p>

      <div className="bg-[#111118] border border-[#2a2a3a] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[320px]">
            <thead>
              <tr className="border-b border-[#2a2a3a]">
                <th className="py-3 px-4 sm:px-5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                <th className="py-3 px-4 sm:px-5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Email</th>
                <th className="py-3 px-4 sm:px-5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                <th className="py-3 px-4 sm:px-5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody>
              {mockUsersDisplay.map((user, i) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-[#2a2a3a] last:border-b-0 hover:bg-[#16161e]/50 transition-colors"
                >
                  <td className="py-3 px-4 sm:px-5">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        user.role === 'admin' ? 'bg-[#6c63ff]/30 text-[#a78bfa]' : 'bg-[#2a2a3a] text-gray-400'
                      }`}>
                        {user.name.charAt(0)}
                      </div>
                      <span className="text-xs sm:text-sm text-white truncate max-w-[100px] sm:max-w-none">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 sm:px-5 hidden md:table-cell">
                    <span className="text-xs sm:text-sm text-gray-400">{user.email}</span>
                  </td>
                  <td className="py-3 px-4 sm:px-5">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                      user.role === 'admin' ? 'bg-[#6c63ff]/20 text-[#a78bfa]' : 'bg-[#2a2a3a] text-gray-400'
                    }`}>
                      {user.role === 'admin' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 sm:px-5 hidden sm:table-cell">
                    <span className="text-xs sm:text-sm text-gray-500">
                      {new Date(user.joined).toLocaleDateString()}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
