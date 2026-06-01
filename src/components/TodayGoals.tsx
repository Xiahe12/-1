import { Target, Plus, Minus, CheckCircle2, Clock } from 'lucide-react';
import { useAppStore } from '../store';

export default function TodayGoals() {
  const { todayGoals, courses, adjustTodayGoalMinutes } = useAppStore();
  
  const getCourseTitle = (courseId: string) => {
    return courses.find(c => c.id === courseId)?.title || '未知课程';
  };

  return (
    <div className="card-base p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center">
          <Target className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">今日学习目标</h3>
          <p className="text-sm text-slate-500">追踪您的学习进度</p>
        </div>
      </div>

      <div className="space-y-4">
        {todayGoals.map((goal) => (
          <div 
            key={goal.id}
            className={`p-4 rounded-xl border-2 transition-all duration-300 ${
              goal.isCompleted 
                ? 'border-emerald-200 bg-emerald-50' 
                : 'border-slate-100 bg-white hover:border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {goal.isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex-shrink-0" />
                )}
                <div>
                  <h4 className={`font-medium ${goal.isCompleted ? 'text-emerald-700 line-through' : 'text-slate-800'}`}>
                    {getCourseTitle(goal.courseId)}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                    <Clock className="h-4 w-4" />
                    <span>目标: {goal.targetMinutes} 分钟</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 进度条 */}
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">
                  已完成: <span className="font-semibold text-emerald-700">{goal.completedMinutes} 分钟</span>
                </span>
                <span className="text-slate-500">
                  {Math.round((goal.completedMinutes / goal.targetMinutes) * 100)}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    goal.isCompleted ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                  }`}
                  style={{ width: `${Math.min((goal.completedMinutes / goal.targetMinutes) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* 调整按钮 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500 mr-2">调整学习时长:</span>
              <button
                onClick={() => adjustTodayGoalMinutes(goal.id, -5)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 transition-all duration-200"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center font-medium text-slate-700">
                {goal.completedMinutes}
              </span>
              <button
                onClick={() => adjustTodayGoalMinutes(goal.id, 5)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-700 hover:text-emerald-800 transition-all duration-200"
              >
                <Plus className="h-4 w-4" />
              </button>
              <span className="text-sm text-slate-400 ml-1">分钟</span>
            </div>
          </div>
        ))}

        {todayGoals.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <p>暂无今日学习目标</p>
          </div>
        )}
      </div>
    </div>
  );
}
