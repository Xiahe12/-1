import { useParams, useNavigate } from 'react-router-dom'
import { BookOpen, Calendar, ArrowLeft, PlayCircle, CheckCircle2, Clock, Award, FileText, Link as LinkIcon, Sparkles, GraduationCap } from 'lucide-react'
import { useAppStore } from '../store'
import ProgressBar from '../components/ProgressBar'
import ChapterList from '../components/ChapterList'
import NoteList from '../components/NoteList'

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const course = useAppStore((state) => state.courses.find((c) => c.id === id))
  const chapters = useAppStore((state) => state.chapters.filter((c) => c.courseId === id))
  const completedChapters = chapters.filter((c) => c.isCompleted).length

  if (!course) {
    return (
      <div className="text-center py-16 sm:py-20 bg-white rounded-2xl shadow-soft border border-gray-100">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">课程未找到</h2>
        <button
          onClick={() => navigate('/courses')}
          className="px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
        >
          返回课程列表
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5 sm:space-y-6 lg:space-y-8">
      {/* 返回按钮 */}
      <button
        onClick={() => navigate('/courses')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-xl transition-all duration-200 w-fit"
      >
        <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        <span className="text-sm sm:text-base">返回课程列表</span>
      </button>

      {/* 课程头部信息 */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 shadow-soft border border-gray-100 animate-fade-in">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">
              <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>{course.category}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">{course.title}</h1>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">{course.description}</p>
            
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-4 sm:mb-6">
              <div className="flex items-center gap-2 text-gray-600 text-sm sm:text-base">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>创建于 {new Date(course.createdAt).toLocaleDateString('zh-CN')}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 sm:gap-4">
              <button className="px-5 sm:px-8 py-2.5 sm:py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-200 font-semibold text-sm sm:text-lg flex items-center gap-2">
                <PlayCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                {course.progress === 100 ? '重新学习' : '继续学习'}
              </button>
            </div>
          </div>
          
          {/* 进度卡片 */}
          <div className="lg:w-72 xl:w-80 flex-shrink-0">
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 text-white shadow-xl shadow-emerald-500/20">
              <div className="text-center mb-4 sm:mb-6">
                <div className="text-4xl sm:text-5xl font-bold mb-1">{course.progress}%</div>
                <div className="text-emerald-100 text-sm sm:text-base">课程进度</div>
              </div>
              <div className="w-full bg-emerald-400/50 rounded-full h-2.5 sm:h-3 mb-3 sm:mb-4 overflow-hidden">
                <div 
                  className="bg-white h-full rounded-full transition-all duration-700 ease-out" 
                  style={{ width: `${course.progress}%` }}
                />
              </div>
              <div className="text-xs sm:text-sm text-emerald-100 text-center flex items-center justify-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                已完成 {completedChapters}/{chapters.length} 章节
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 课程介绍 */}
      {course.introduction && (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 shadow-soft border border-gray-100 animate-fade-in-up">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-emerald-600" />
            课程介绍
          </h2>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line">
            {course.introduction}
          </p>
        </div>
      )}

      {/* 掌握技能 */}
      {course.skills && course.skills.length > 0 && (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 shadow-soft border border-gray-100 animate-fade-in-up">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            你将掌握的技能
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {course.skills.map((skill, index) => (
              <div key={index} className="flex items-center gap-3 p-3 sm:p-4 bg-emerald-50 rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-all duration-200">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0">
                  {index + 1}
                </div>
                <span className="text-sm sm:text-base text-gray-700 font-medium">{skill}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 评估方式 */}
      {course.evaluation && (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 shadow-soft border border-gray-100 animate-fade-in-up">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
            <Award className="h-5 w-5 text-emerald-600" />
            评估方式
          </h2>
          <p className="text-sm sm:text-base text-gray-700 mb-4">
            本课程采用多元化的评估方式，全面考核学习效果：
          </p>
          <div className="flex flex-wrap gap-3 sm:gap-4">
            {course.evaluation.split('+').map((item, index) => (
              <div key={index} className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-100 to-emerald-50 rounded-xl border border-emerald-200">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 flex-shrink-0" />
                <span className="text-sm sm:text-base text-gray-700 font-medium whitespace-nowrap">{item.trim()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 学习资源 */}
      {course.learningResources && course.learningResources.length > 0 && (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 shadow-soft border border-gray-100 animate-fade-in-up">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-600" />
            学习资源
          </h2>
          <div className="space-y-3 sm:space-y-4">
            {course.learningResources.map((resource, index) => (
              <a
                key={index}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 hover:bg-emerald-50 rounded-xl border border-gray-100 hover:border-emerald-200 transition-all duration-200 group"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-200 flex-shrink-0">
                  <LinkIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm sm:text-base font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors truncate">
                    {resource.title}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    {resource.type}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* 进度展示 */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 shadow-soft border border-gray-100 animate-fade-in-up">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
          <Clock className="h-5 w-5 text-emerald-600" />
          学习进度
        </h2>
        <ProgressBar progress={course.progress} label="整体进度" />
        <div className="mt-3 sm:mt-4 text-sm text-gray-600">
          {course.progress === 100 ? (
            <div className="flex items-center gap-2 text-emerald-600 font-medium">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>恭喜！您已完成这门课程！</span>
            </div>
          ) : (
            <span>继续努力，还有 {chapters.length - completedChapters} 个章节待完成</span>
          )}
        </div>
      </div>

      {/* 章节列表 */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 shadow-soft border border-gray-100 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-emerald-600" />
          课程章节
        </h2>
        <ChapterList chapters={chapters} />
      </div>

      {/* 笔记列表 */}
      <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <NoteList courseId={course.id} chapters={chapters} />
      </div>
    </div>
  )
}
