import { Target, CheckCircle2, Plus, Flame } from 'lucide-react'
import { useState } from 'react'
import { useAppStore } from '../store'
import { TodayGoal, Course } from '../types'

export default function TodayGoals() {
  const todayGoals = useAppStore((state) => state.todayGoals)
  const courses = useAppStore((state) => state.courses)
  const addTodayGoal = useAppStore((state) => state.addTodayGoal)
  const updateTodayGoal = useAppStore((state) => state.updateTodayGoal)
  const getTodayStudyTime = useAppStore((state) => state.getTodayStudyTime)
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [targetMinutes, setTargetMinutes] = useState(60)

  const todayStr = new Date().toISOString().split('T')[0]
  const filteredGoals = todayGoals.filter((goal) => goal.date === todayStr)
  const todayStudyTime = getTodayStudyTime()

  const getCourseById = (id: string): Course | undefined => {
    return courses.find((course) => course.id === id)
  }

  const handleAddGoal = () => {
    if (selectedCourseId && targetMinutes > 0) {
      addTodayGoal({
        courseId: selectedCourseId,
        targetMinutes,
        date: todayStr
      })
      setShowAddGoal(false)
      setSelectedCourseId('')
      setTargetMinutes(60)
    }
  }

  const handleAddProgress = (goalId: string, currentMinutes: number, targetMinutes: number) => {
    const newMinutes = Math.min(currentMinutes + 15, targetMinutes)
    updateTodayGoal(goalId, { completedMinutes: newMinutes })
  }

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-soft border border-gray-100">
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
          <div className="w-1 h-6 bg-gradient-to-b from-emerald-600 to-emerald-700 rounded-full" />
          今日目标
        </h2>
        <button 
          onClick={() => setShowAddGoal(!showAddGoal)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:shadow-lg transition-all duration-200 text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">添加目标</span>
        </button>
      </div>

      {/* 添加目标表单 */}
      {showAddGoal && (
        <div className="mb-5 p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl border border-emerald-100 animate-scale-in">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">选择课程</label>
              <select 
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 text-sm"
              >
                <option value="">请选择课程</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">目标时长（分钟）</label>
              <input 
                type="number"
                value={targetMinutes}
                onChange={(e) => setTargetMinutes(parseInt(e.target.value) || 60)}
                min="15"
                step="15"
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 text-sm"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button 
                onClick={handleAddGoal}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:shadow-lg transition-all duration-200 text-sm font-medium"
              >
                确认添加
              </button>
              <button 
                onClick={() => setShowAddGoal(false)}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 text-sm font-medium"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 今日学习时长卡片 */}
      <div className="mb-5 p-4 sm:p-5 bg-gradient-to-br from-emerald-50 via-emerald-100/50 to-emerald-50 rounded-2xl border border-emerald-100">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-float">
            <Flame className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-xs sm:text-sm text-gray-600 mb-0.5">今日已学习</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">
              {todayStudyTime} <span className="text-sm font-medium text-gray-500">分钟</span>
            </p>
          </div>
        </div>
      </div>

      {/* 目标列表 */}
      {filteredGoals.length === 0 ? (
        <div className="text-center py-8 sm:py-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">还没有设置今日目标</h3>
          <p className="text-sm text-gray-500 mb-4">点击上方按钮添加目标开始学习吧！</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredGoals.map((goal: TodayGoal, index) => {
            const course = getCourseById(goal.courseId)
            const progress = Math.round((goal.completedMinutes / goal.targetMinutes) * 100)
            
            return (
              <div 
                key={goal.id} 
                className={`p-4 rounded-2xl border transition-all duration-300 animate-fade-in-up ${
                  goal.isCompleted 
                    ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200' 
                    : 'bg-emerald-50 border-emerald-100'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    {goal.isCompleted && (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 animate-bounce-subtle" />
                    )}
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{course?.title || '未知课程'}</h3>
                  </div>
                  <span className={`text-xs sm:text-sm font-bold ${
                    goal.isCompleted ? 'text-emerald-700' : 'text-emerald-700'
                  }`}>
                    {goal.completedMinutes}/{goal.targetMinutes} 分钟
                  </span>
                </div>
                <div className="mb-3">
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ease-out ${
                        goal.isCompleted 
                          ? 'bg-gradient-to-r from-emerald-600 to-emerald-700' 
                          : 'bg-gradient-to-r from-emerald-600 to-emerald-700'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                {!goal.isCompleted && (
                  <button 
                    onClick={() => handleAddProgress(goal.id, goal.completedMinutes, goal.targetMinutes)}
                    className="w-full py-2.5 text-sm font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    + 15 分钟
                  </button>
                )}
                {goal.isCompleted && (
                  <div className="flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    目标已完成！
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}