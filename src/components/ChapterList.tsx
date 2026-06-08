import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronRight, CheckCircle2, Circle, BookOpen, PartyPopper, Clock, Brain, Code, Lightbulb, FileQuestion } from 'lucide-react'
import { Chapter, Exercise } from '../types'
import { useAppStore } from '../store'

interface ChapterListProps {
  chapters: Chapter[]
}

export default function ChapterList({ chapters }: ChapterListProps) {
  const [expandedChapterId, setExpandedChapterId] = useState<string | null>(null)
  const [animatingChapterId, setAnimatingChapterId] = useState<string | null>(null)
  const [exerciseAnswers, setExerciseAnswers] = useState<Record<string, number | string>>({})
  const [showResults, setShowResults] = useState<Record<string, boolean>>({})
  const updateChapter = useAppStore((state) => state.updateChapter)

  const toggleChapter = (chapterId: string) => {
    setExpandedChapterId(expandedChapterId === chapterId ? null : chapterId)
  }

  const toggleComplete = (chapter: Chapter, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!chapter.isCompleted) {
      setAnimatingChapterId(chapter.id)
      setTimeout(() => setAnimatingChapterId(null), 1500)
    }
    
    updateChapter(chapter.id, { 
      isCompleted: !chapter.isCompleted,
      completedAt: !chapter.isCompleted ? new Date().toISOString() : undefined
    })
  }

  const selectAnswer = (chapterId: string, exerciseId: string, answerIndex: number | string) => {
    setExerciseAnswers(prev => ({
      ...prev,
      [`${chapterId}-${exerciseId}`]: answerIndex
    }))
  }

  const submitExercise = (_chapter: Chapter, exercise: Exercise, chapterId: string) => {
    const key = `${chapterId}-${exercise.id}`
    const userAnswer = exerciseAnswers[key]
    if (userAnswer !== undefined) {
      setShowResults(prev => ({ ...prev, [key]: true }))
    }
  }

  if (chapters.length === 0) {
    return (
      <div className="text-center py-10 sm:py-12 bg-emerald-50 rounded-2xl">
        <BookOpen className="h-12 w-12 sm:h-14 sm:w-14 mx-auto mb-4 opacity-50" />
        <p className="text-sm sm:text-base text-gray-500">暂无章节内容</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {chapters.map((chapter, index) => (
        <div 
          key={chapter.id} 
          className={`bg-emerald-50 rounded-2xl overflow-hidden transition-all duration-300 animate-fade-in-up ${
            animatingChapterId === chapter.id ? 'ring-2 ring-emerald-400 ring-offset-2' : ''
          }`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div
            onClick={() => toggleChapter(chapter.id)}
            className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 cursor-pointer hover:bg-emerald-100 transition-colors"
          >
            <button
              onClick={(e) => toggleComplete(chapter, e)}
              className="flex-shrink-0 hover:scale-110 transition-transform duration-200"
            >
              {chapter.isCompleted ? (
                <CheckCircle2 className={`h-6 w-6 sm:h-7 sm:w-7 text-emerald-600 hover:text-emerald-700 transition-all ${
                  animatingChapterId === chapter.id ? 'animate-bounce' : ''
                }`} />
              ) : (
                <Circle className="h-6 w-6 sm:h-7 sm:w-7 text-gray-400 hover:text-emerald-600 transition-colors" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <span className="text-xs sm:text-sm font-medium text-gray-500 w-7 sm:w-8 flex-shrink-0">{index + 1}.</span>
                <h3 className={`font-semibold transition-all duration-300 text-sm sm:text-base ${
                  chapter.isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'
                } ${animatingChapterId === chapter.id ? 'text-emerald-600' : ''}`}>
                  {chapter.title}
                </h3>
                {animatingChapterId === chapter.id && (
                  <PartyPopper className="h-5 w-5 text-yellow-500 animate-bounce flex-shrink-0" />
                )}
              </div>
              {chapter.studyDurationMinutes && (
                <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                  <Clock className="h-3 w-3" />
                  <span>学习时长 {chapter.studyDurationMinutes} 分钟</span>
                </div>
              )}
            </div>

            {expandedChapterId === chapter.id ? (
              <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 transition-transform flex-shrink-0" />
            ) : (
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 transition-transform flex-shrink-0" />
            )}
          </div>

          {expandedChapterId === chapter.id && (
            <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0 space-y-4">
              {/* 章节内容 */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-200">
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line">
                  {chapter.content}
                </p>
                <div className="mt-3 sm:mt-4 flex flex-wrap gap-3 sm:gap-4">
                  {chapter.completedAt && (
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      完成于 {new Date(chapter.completedAt).toLocaleDateString('zh-CN')}
                    </p>
                  )}
                  {chapter.studyDurationMinutes && (
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      学习时长 {chapter.studyDurationMinutes} 分钟
                    </p>
                  )}
                </div>
              </div>

              {/* 重点知识 */}
              {chapter.keyPoints && chapter.keyPoints.length > 0 && (
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-emerald-200">
                  <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-emerald-600" />
                    重点知识
                  </h4>
                  <ul className="space-y-2">
                    {chapter.keyPoints.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm sm:text-base text-gray-700">
                        <span className="text-emerald-600 font-bold flex-shrink-0">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 章节练习 */}
              {chapter.exercises && chapter.exercises.length > 0 && (
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-200">
                  <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileQuestion className="h-5 w-5 text-emerald-600" />
                    章节练习 ({chapter.exercises.length}题)
                  </h4>
                  <div className="space-y-6">
                    {chapter.exercises.map((exercise, exIdx) => {
                      const key = `${chapter.id}-${exercise.id}`
                      const selectedAnswer = exerciseAnswers[key]
                      const resultShown = showResults[key]
                      const isCorrect = exercise.type === 'choice' 
                        ? selectedAnswer === exercise.answer
                        : selectedAnswer === exercise.answer

                      return (
                        <div key={exercise.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <div className="flex items-start gap-2 mb-3">
                            <div className="w-7 h-7 bg-emerald-600 text-white rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">
                              {exIdx + 1}
                            </div>
                            <p className="text-sm sm:text-base text-gray-900 font-medium leading-relaxed">
                              {exercise.type === 'choice' ? (
                                <span className="flex items-center gap-2">
                                  <span>{exercise.question}</span>
                                </span>
                              ) : (
                                <span className="flex items-start gap-2">
                                  <Code className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                  <span>{exercise.question}</span>
                                </span>
                              )}
                            </p>
                          </div>

                          {exercise.type === 'choice' && exercise.options && (
                            <div className="space-y-2 ml-9">
                              {exercise.options.map((option, optIdx) => {
                                const isSelected = selectedAnswer === optIdx
                                const isCorrectOption = optIdx === exercise.answer
                                let optionClass = 'option-btn bg-white border-gray-200 text-gray-700'

                                if (resultShown) {
                                  if (isCorrectOption) {
                                    optionClass = 'option-btn bg-emerald-600 text-white border-emerald-600'
                                  } else if (isSelected && !isCorrectOption) {
                                    optionClass = 'option-btn bg-red-600 text-white border-red-600'
                                  }
                                } else if (isSelected) {
                                  optionClass = 'option-btn bg-emerald-50 border-emerald-500 text-emerald-700'
                                }

                                return (
                                  <button
                                    key={optIdx}
                                    onClick={() => !resultShown && selectAnswer(chapter.id, exercise.id, optIdx)}
                                    disabled={resultShown}
                                    className={`w-full text-left px-4 py-2.5 rounded-lg border-2 transition-all duration-200 text-sm sm:text-base ${optionClass}`}
                                  >
                                    {String.fromCharCode(65 + optIdx)}. {option}
                                  </button>
                                )
                              })}
                            </div>
                          )}

                          {exercise.type === 'code' && (
                            <div className="ml-9 space-y-3">
                              {exercise.codeTemplate && (
                                <div className="bg-gray-800 text-gray-100 rounded-lg p-4 font-mono text-xs sm:text-sm overflow-x-auto">
                                  <pre className="whitespace-pre-wrap">{exercise.codeTemplate}</pre>
                                </div>
                              )}
                              {!resultShown && (
                                <textarea
                                  placeholder="请在此处输入代码..."
                                  value={selectedAnswer as string || ''}
                                  onChange={(e) => selectAnswer(chapter.id, exercise.id, e.target.value)}
                                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-mono text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
                                  rows={4}
                                />
                              )}
                              {resultShown && selectedAnswer && (
                                <div className={`p-4 rounded-lg border-2 ${
                                  isCorrect ? 'bg-emerald-50 border-emerald-300' : 'bg-red-50 border-red-300'
                                }`}>
                                  <p className={`text-sm font-medium mb-2 ${isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
                                    {isCorrect ? '✓ 回答正确！' : '✗ 回答错误'}
                                  </p>
                                  <div className="bg-white rounded p-3 font-mono text-xs sm:text-sm text-gray-800">
                                    <strong>你的答案：</strong>
                                    <pre className="mt-1 whitespace-pre-wrap">{selectedAnswer as string}</pre>
                                  </div>
                                  {!isCorrect && exercise.answer && (
                                    <div className="bg-emerald-50 rounded p-3 font-mono text-xs sm:text-sm text-emerald-800 mt-2">
                                      <strong>正确答案：</strong>
                                      <pre className="mt-1 whitespace-pre-wrap">{exercise.answer as string}</pre>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {/* 操作按钮 */}
                          {!resultShown && (
                            <div className="mt-4 ml-9">
                              <button
                                onClick={() => submitExercise(chapter, exercise, chapter.id)}
                                disabled={selectedAnswer === undefined}
                                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                                  selectedAnswer !== undefined
                                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                              >
                                提交答案
                              </button>
                            </div>
                          )}

                          {/* 解析 */}
                          {resultShown && exercise.explanation && (
                            <div className="mt-4 ml-9 bg-blue-50 rounded-lg p-4 border border-blue-200">
                              <p className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-2">
                                <Brain className="h-4 w-4" />
                                解析：
                              </p>
                              <p className="text-sm text-blue-800 leading-relaxed">
                                {exercise.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* 代码练习按钮 */}
              {chapter.hasCodePractice && (
                <div className="mt-4">
                  <Link to={`/practice/${chapter.id}`}>
                    <button className="w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-medium hover:from-emerald-700 hover:to-emerald-800 transition-all flex items-center justify-center gap-2 shadow-lg">
                      <Code className="h-5 w-5" />
                      开始代码练习
                    </button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
