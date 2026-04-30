import { BookOpen, PlayCircle, CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Course } from '../types'

const categoryColors: Record<string, { bg: string; text: string; icon: string }> = {
  '前端开发': { bg: 'from-blue-100 to-blue-200', text: 'text-blue-700', icon: 'from-blue-500 to-blue-600' },
  '编程语言': { bg: 'from-green-100 to-green-200', text: 'text-green-700', icon: 'from-green-500 to-green-600' },
  '后端开发': { bg: 'from-purple-100 to-purple-200', text: 'text-purple-700', icon: 'from-purple-500 to-purple-600' }
}

interface CourseCardProps {
  course: Course
}

export default function CourseCard({ course }: CourseCardProps) {
  const navigate = useNavigate()
  const colorClass = categoryColors[course.category] || { 
    bg: 'from-gray-100 to-gray-200', 
    text: 'text-gray-700', 
    icon: 'from-gray-500 to-gray-600' 
  }

  const handleClick = () => {
    navigate(`/courses/${course.id}`)
  }

  return (
    <div 
      onClick={handleClick}
      className="bg-white rounded-2xl p-5 sm:p-6 shadow-soft border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
    >
      {/* 封面区域 */}
      <div className={`w-full h-32 sm:h-40 bg-gradient-to-br ${colorClass.bg} rounded-2xl mb-4 sm:mb-5 flex items-center justify-center group-hover:scale-[1.02] transition-transform duration-300 overflow-hidden`}>
        <div className="relative">
          <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-gray-700/70" />
          {course.progress > 0 && (
            <div className="absolute -bottom-2 -right-2 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-xs sm:text-sm font-bold">{course.progress}%</span>
            </div>
          )}
        </div>
      </div>
      
      {/* 分类标签 */}
      <div className="mb-3">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${colorClass.bg} ${colorClass.text}`}>
          {course.category}
        </span>
      </div>
      
      {/* 标题和描述 */}
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
        {course.title}
      </h3>
      
      <p className="text-sm text-gray-500 mb-4 line-clamp-2">
        {course.description}
      </p>
      
      {/* 进度条（有进度时显示） */}
      {course.progress > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs sm:text-sm mb-1.5">
            <span className="text-gray-500">进度</span>
            <span className="font-bold text-blue-600">{course.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${course.progress}%` }}
            />
          </div>
        </div>
      )}
      
      {/* 操作按钮 */}
      <button 
        className="w-full px-4 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300 font-medium flex items-center justify-center gap-2"
      >
        {course.progress === 0 ? (
          <>
            <PlayCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            开始学习
          </>
        ) : course.progress === 100 ? (
          <>
            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
            已完成
          </>
        ) : (
          <>
            <PlayCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            继续学习
          </>
        )}
      </button>
    </div>
  )
}