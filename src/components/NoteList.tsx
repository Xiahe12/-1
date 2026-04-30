import { useState } from 'react'
import { Note, Chapter } from '../types'
import { useAppStore } from '../store'
import { Edit2, Trash2, FileText, Calendar, Plus } from 'lucide-react'
import NoteEditor from './NoteEditor'

interface NoteListProps {
  courseId: string
  chapters: Chapter[]
}

export default function NoteList({ courseId, chapters }: NoteListProps) {
  const notes = useAppStore((state) => state.notes.filter((n) => n.courseId === courseId))
  const deleteNote = useAppStore((state) => state.deleteNote)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | undefined>()

  const handleEdit = (note: Note) => {
    setEditingNote(note)
    setIsEditorOpen(true)
  }

  const handleAdd = () => {
    setEditingNote(undefined)
    setIsEditorOpen(true)
  }

  const handleCloseEditor = () => {
    setIsEditorOpen(false)
    setEditingNote(undefined)
  }

  const getChapterTitle = (chapterId?: string) => {
    if (!chapterId) return null
    const chapter = chapters.find((c) => c.id === chapterId)
    return chapter?.title
  }

  if (notes.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-soft border border-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">还没有笔记</h3>
          <p className="text-sm sm:text-base text-gray-500 mb-5 sm:mb-6">为这门课程添加你的第一个笔记吧！</p>
          <button
            onClick={handleAdd}
            className="px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-200 font-medium flex items-center gap-2 mx-auto text-sm sm:text-base"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            添加笔记
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-soft border border-gray-100">
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="h-5 w-5 text-emerald-600" />
          学习笔记
          <span className="text-sm font-normal text-gray-500">
            ({notes.length})
          </span>
        </h2>
        <button
          onClick={handleAdd}
          className="px-3.5 sm:px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-200 font-medium flex items-center gap-1.5 text-sm"
        >
          <Plus className="h-4 w-4" />
          添加笔记
        </button>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {notes.map((note, index) => (
          <div
            key={note.id}
            className="p-4 sm:p-5 bg-emerald-50 rounded-2xl hover:bg-emerald-100 transition-all duration-200 group animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 group-hover:text-emerald-600 transition-colors">
                  {note.title}
                </h3>
                <p className="text-gray-600 mb-2.5 sm:mb-3 text-sm line-clamp-2">
                  {note.content}
                </p>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>
                      {new Date(note.updatedAt).toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  {getChapterTitle(note.chapterId) && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                      <span>章节: {getChapterTitle(note.chapterId)}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-1.5 sm:gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                <button
                  onClick={() => handleEdit(note)}
                  className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all duration-200 hover:scale-110"
                  title="编辑笔记"
                >
                  <Edit2 className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110"
                  title="删除笔记"
                >
                  <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isEditorOpen && (
        <NoteEditor
          courseId={courseId}
          note={editingNote}
          onClose={handleCloseEditor}
        />
      )}
    </div>
  )
}