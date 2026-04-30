import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  BookOpen, 
  Calendar, 
  Settings, 
  X,
  TrendingUp,
  Clock,
  BookMarked
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation()

  const menuItems = [
    { path: '/', label: '首页', icon: Home },
    { path: '/courses', label: '我的课程', icon: BookOpen },
    { path: '/progress', label: '学习进度', icon: TrendingUp },
    { path: '/schedule', label: '学习计划', icon: Calendar },
    { path: '/history', label: '学习历史', icon: Clock },
    { path: '/settings', label: '设置', icon: Settings }
  ]

  return (
    <>
      {/* 移动端遮罩 */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}
      
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-72 sm:w-80 bg-white border-r border-gray-100
          transform transition-transform duration-300 ease-in-out
          shadow-xl lg:shadow-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* 移动端头部 */}
        <div className="h-16 flex items-center justify-between px-5 lg:hidden border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2 group" onClick={onClose}>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">夏荷的学习中心</span>
          </Link>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:scale-105"
            aria-label="关闭侧边栏"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* 导航菜单 */}
        <nav className="p-4 space-y-1.5 overflow-y-auto" style={{ height: 'calc(100vh - 180px)' }}>
          {menuItems.map((item, index) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path))
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  hover:scale-[1.02]
                  ${isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse-slow" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* 底部统计卡片 */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-gradient-to-t from-gray-50 to-white">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <BookMarked className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">学习统计</h4>
                <p className="text-xs text-gray-500">今日表现</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">已学习</span>
                <span className="text-sm font-bold text-gray-900">42 小时</span>
              </div>
              <div className="w-full bg-white/60 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full" style={{ width: '65%' }} />
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}