import { BookOpen, CheckCircle, Clock, Target } from 'lucide-react'
import { useAppStore } from '../store'
import { useEffect, useState } from 'react'

interface StatItem {
  icon: React.ElementType
  label: string
  value: string | number
  gradient: string
  iconBg: string
}

export default function StatsCard() {
  const courses = useAppStore((state) => state.courses)
  const studyRecords = useAppStore((state) => state.studyRecords)
  const todayGoals = useAppStore((state) => state.todayGoals)
  const getTotalCourses = useAppStore((state) => state.getTotalCourses)
  const getCompletedCourses = useAppStore((state) => state.getCompletedCourses)
  const getTotalStudyTime = useAppStore((state) => state.getTotalStudyTime)
  const getTodayGoalProgress = useAppStore((state) => state.getTodayGoalProgress)

  const [totalCourses, setTotalCourses] = useState(0)
  const [completedCourses, setCompletedCourses] = useState(0)
  const [totalStudyTime, setTotalStudyTime] = useState(0)
  const [todayGoalProgress, setTodayGoalProgress] = useState(0)

  useEffect(() => {
    setTotalCourses(getTotalCourses())
    setCompletedCourses(getCompletedCourses())
    setTotalStudyTime(getTotalStudyTime())
    setTodayGoalProgress(getTodayGoalProgress())
  }, [courses, studyRecords, todayGoals, getTotalCourses, getCompletedCourses, getTotalStudyTime, getTodayGoalProgress])

  const formatStudyTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}小时${mins > 0 ? ` ${mins}分钟` : ''}`
    }
    return `${mins}分钟`
  }

  const stats: StatItem[] = [
    {
      icon: BookOpen,
      label: '课程总数',
      value: totalCourses,
      gradient: 'from-emerald-600 to-emerald-700',
      iconBg: 'from-emerald-600 to-emerald-700'
    },
    {
      icon: CheckCircle,
      label: '已完成课程',
      value: completedCourses,
      gradient: 'from-emerald-600 to-emerald-700',
      iconBg: 'from-emerald-600 to-emerald-700'
    },
    {
      icon: Clock,
      label: '总学习时长',
      value: formatStudyTime(totalStudyTime),
      gradient: 'from-emerald-600 to-emerald-700',
      iconBg: 'from-emerald-600 to-emerald-700'
    },
    {
      icon: Target,
      label: '今日目标进度',
      value: `${todayGoalProgress}%`,
      gradient: 'from-emerald-600 to-emerald-700',
      iconBg: 'from-emerald-600 to-emerald-700'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div 
            key={index} 
            className="bg-white rounded-2xl p-5 sm:p-6 shadow-soft border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${stat.iconBg} rounded-2xl flex items-center justify-center shadow-lg`}>
                <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              <div className="w-2 h-2 rounded-full bg-gray-200 animate-bounce-subtle" />
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{stat.value}</div>
              <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}