import { useState, useEffect } from 'react'
import { Save, X, Edit3 } from 'lucide-react'
import { Note } from '../types'
import { useAppStore } from '../store'

interface NoteEditorProps {
  courseId: string
  chapterId?: string
  note?: Note
  onClose: () => void
}

export default function NoteEditor({ courseId, chapterId, note, onClose }: NoteEditorProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const addNote = useAppStore((state) => state.addNote)
  const updateNote = useAppStore((state) => state.updateNote)

  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setContent(note.content)
    }
  }, [note])

  const handleSave = () => {
    if (!title.trim() && !content.trim()) {
      onClose()
      return
    }

    if (note) {
      updateNote(note.id, { title, content })
    } else {
      addNote({
        courseId,
        chapterId,
        title: title.trim() || '无标题笔记',
        content: content.trim()
      })
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scale-in">
        {/* 头部 */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Edit3 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
              {note ? '编辑笔记' : '添加笔记'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105"
            aria-label="关闭"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500" />
          </button>
        </div>

        {/* 内容区域 */}
        <div className="p-5 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              笔记标题
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入笔记标题..."
              className="w-full px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all duration-200 text-sm sm:text-base"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              笔记内容
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="在这里写下你的笔记内容..."
              className="w-full px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all duration-200 resize-none min-h-[200px] sm:min-h-[220px] text-sm sm:text-base"
            />
          </div>
        </div>

        {/* 底部操作栏 */}
        <div className="flex justify-end gap-2 sm:gap-3 p-5 sm:p-6 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="px-5 sm:px-6 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-xl transition-all duration-200 font-medium text-sm sm:text-base"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-5 sm:px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-200 font-medium flex items-center gap-2 text-sm sm:text-base"
          >
            <Save className="h-4 w-4 sm:h-5 sm:w-5" />
            保存笔记
          </button>
        </div>
      </div>
    </div>
  )
}