import { BookOpen, PlayCircle, CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store'
import { Course } from '../types'

const categoryColors: Record<string, { bg: string; text: string; icon: string }> = {
  '前端开发': { bg: 'from-emerald-100 to-emerald-200', text: 'text-emerald-700', icon: 'from-emerald-600 to-emerald-700' },
  '编程语言': { bg: 'from-emerald-100 to-emerald-200', text: 'text-emerald-700', icon: 'from-emerald-600 to-emerald-700' },
  '后端开发': { bg: 'from-emerald-100 to-emerald-200', text: 'text-emerald-700', icon: 'from-emerald-600 to-emerald-700' }
}

export default function RecentCourses() {
  const navigate = useNavigate()
  const getRecentCourses = useAppStore((state) => state.getRecentCourses)
  
  const recentCourses = getRecentCourses()

  const handleContinue = (courseId: string) => {
    navigate(`/courses/${courseId}`)
  }

  if (recentCourses.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-soft border border-gray-100">
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
          <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full" />
          最近学习
        </h2>
        <button
          onClick={() => navigate('/courses')}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
        >
          查看全部
        </button>
      </div>
      <div className="space-y-3 sm:space-y-4">
        {recentCourses.map((course: Course, index) => {
          const colorClass = categoryColors[course.category] || { 
            bg: 'from-emerald-100 to-emerald-200', 
            text: 'text-emerald-700', 
            icon: 'from-emerald-600 to-emerald-700' 
          }
          
          return (
            <div 
              key={course.id} 
              className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 hover:shadow-md transition-all duration-300 group cursor-pointer animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => handleContinue(course.id)}
            >
              <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${colorClass.bg} rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200 shadow-sm`}>
                <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-gray-700/80" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">{course.title}</h3>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${colorClass.bg} ${colorClass.text} flex-shrink-0`}>
                    {course.category}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mb-2 line-clamp-1">{course.description}</p>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-gray-500">进度</span>
                      <span className="text-xs font-bold text-gray-700">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-700 ease-out ${
                          course.progress === 100 
                            ? 'bg-gradient-to-r from-emerald-600 to-emerald-700' 
                            : 'bg-gradient-to-r from-emerald-600 to-emerald-700'
                        }`} 
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleContinue(course.id)
                    }}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      course.progress === 100 
                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:shadow-lg' 
                        : 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:shadow-lg'
                    }`}
                  >
                    {course.progress === 100 ? (
                      <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    ) : (
                      <PlayCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    )}
                    <span className="hidden sm:inline">{course.progress === 100 ? '复习' : '继续'}</span>
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}