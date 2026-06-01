import { TrendingUp, BookOpen, Clock, Calendar, Award, BarChart3 } from 'lucide-react'
import { useAppStore } from '../store'

export default function StudyData() {
  const { 
    getTotalCourses,
    getCompletedCourses,
    getTotalStudyTime,
    getTodayStudyTime,
    getTodayGoalProgress,
    courses,
    studyRecords
  } = useAppStore()

  const totalHours = Math.floor(getTotalStudyTime() / 60)
  const totalMinutes = getTotalStudyTime() % 60

  const recentRecords = [...studyRecords]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  const getCourseTitle = (courseId: string) => {
    return courses.find((c) => c.id === courseId)?.title || '未知课程'
  }

  const stats = [
    {
      title: '总课程数',
      value: getTotalCourses(),
      icon: BookOpen,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      title: '已完成课程',
      value: getCompletedCourses(),
      icon: Award,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700'
    },
    {
      title: '今日学习',
      value: `${getTodayStudyTime()} 分钟`,
      icon: Clock,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700'
    },
    {
      title: '总学习时长',
      value: `${totalHours}小时${totalMinutes}分`,
      icon: Calendar,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    }
  ]

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">学习数据</h1>
            <p className="text-slate-600">追踪您的学习进度和统计数据</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.title}
              className="card-base card-hover p-5 sm:p-6"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">{stat.title}</p>
                  <p className={`text-2xl sm:text-3xl font-bold ${stat.textColor}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-base p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">今日目标进度</h3>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-600">总体进度</span>
              <span className="font-semibold text-emerald-700">{getTodayGoalProgress()}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-1000"
                style={{ width: `${getTodayGoalProgress()}%` }}
              />
            </div>
          </div>
        </div>

        <div className="card-base p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">最近学习记录</h3>
          </div>

          <div className="space-y-3">
            {recentRecords.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{getCourseTitle(record.courseId)}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(record.date).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-blue-700">{record.durationMinutes} 分钟</p>
                </div>
              </div>
            ))}
            {recentRecords.length === 0 && (
              <div className="text-center py-6 text-slate-500">
                <p>暂无学习记录</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card-base p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">课程进度概览</h3>
        </div>

        <div className="space-y-4">
          {courses.map((course) => (
            <div key={course.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-slate-800">{course.title}</span>
                </div>
                <span className="text-sm font-semibold text-emerald-700">{course.progress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-1000"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
