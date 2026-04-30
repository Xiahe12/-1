import { Search, Filter, BookOpen, Frown } from 'lucide-react'
import { useState, useMemo } from 'react'
import CourseCard from '../components/CourseCard'
import { useAppStore } from '../store'
import { Course } from '../types'

export default function Courses() {
  const courses = useAppStore((state) => state.courses)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(courses.map((course) => course.category)))
    return ['all', ...uniqueCategories]
  }, [courses])

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch = 
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        course.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [courses, searchQuery, selectedCategory])

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* 页面标题 */}
      <div className="animate-fade-in-down">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">我的课程</h1>
        <p className="text-sm sm:text-base text-gray-600">管理和继续你的学习进度</p>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex flex-col md:flex-row gap-3 sm:gap-4 animate-fade-in">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索课程..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all duration-200 text-sm sm:text-base"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4.5 w-4.5 text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3.5 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all duration-200 cursor-pointer text-sm sm:text-base"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === 'all' ? '全部分类' : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 课程列表 */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-12 sm:py-16 bg-white rounded-2xl border border-gray-100 shadow-soft animate-fade-in">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {searchQuery || selectedCategory !== 'all' ? (
              <Frown className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
            ) : (
              <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
            )}
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            {searchQuery || selectedCategory !== 'all' ? '没有找到匹配的课程' : '还没有添加任何课程'}
          </h3>
          <p className="text-sm sm:text-base text-gray-500">
            {searchQuery || selectedCategory !== 'all' ? '尝试调整搜索条件或筛选条件' : '开始添加你的第一个课程吧'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {filteredCourses.map((course: Course, index) => (
            <div 
              key={course.id} 
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CourseCard course={course} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}