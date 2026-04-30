import { Menu, BookOpen, Home, User, X } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

interface NavbarProps {
  onToggleSidebar: () => void
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { path: '/', label: '首页', icon: Home },
    { path: '/courses', label: '课程', icon: BookOpen }
  ]

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-md' 
        : 'bg-white shadow-sm border-b border-gray-100'
    }`}>
      <div className="max-w-full mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* 左侧区域 */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
              aria-label="打开侧边栏"
            >
              <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-900">夏荷的学习中心</span>
            </Link>
          </div>
          
          {/* 桌面端导航 */}
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive = location.pathname === link.path
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* 右侧区域 */}
          <div className="flex items-center gap-2">
            {/* 移动端菜单按钮 */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
              aria-label={mobileMenuOpen ? "关闭菜单" : "打开菜单"}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
            
            {/* 用户按钮 */}
            <button className="p-2 rounded-xl hover:bg-gray-100 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* 移动端导航菜单 */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white animate-fade-in">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive = location.pathname === link.path
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {link.label}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </nav>
  )
}