import StatsCard from '../components/StatsCard'
import RecentCourses from '../components/RecentCourses'
import TodayGoals from '../components/TodayGoals'

export default function Home() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 欢迎区域 */}
      <div className="mb-6 sm:mb-8 animate-fade-in-down">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
          欢迎回来，夏荷！
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mb-2">
          广东科学技术职业学院 · 商学院 · 商务数据分析与应用专业
        </p>
        <p className="text-sm sm:text-base text-gray-600">
          继续你的学习旅程，每天进步一点点。
        </p>
      </div>

      {/* 统计卡片 */}
      <StatsCard />

      {/* 主要内容区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* 最近学习 */}
        <div className="lg:col-span-2">
          <RecentCourses />
        </div>
        {/* 今日目标 */}
        <div className="lg:col-span-1">
          <TodayGoals />
        </div>
      </div>
    </div>
  )
}