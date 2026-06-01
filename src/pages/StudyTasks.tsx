import { CheckSquare, Plus, Trash2, Edit2, Flag, Calendar as CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import { useAppStore } from '../store';

export default function StudyTasks() {
  const { studyTasks, addStudyTask, toggleStudyTask, deleteStudyTask, updateStudyTask } = useAppStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: ''
  });
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTaskId) {
      updateStudyTask(editingTaskId, newTask);
      setEditingTaskId(null);
    } else {
      addStudyTask({ ...newTask, isCompleted: false });
    }
    setNewTask({ title: '', description: '', priority: 'medium', dueDate: '' });
    setShowAddForm(false);
  };

  const handleEdit = (task: any) => {
    setNewTask({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate || ''
    });
    setEditingTaskId(task.id);
    setShowAddForm(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-amber-600 bg-amber-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return '高';
      case 'medium': return '中';
      case 'low': return '低';
      default: return '-';
    }
  };

  const sortedTasks = [...studyTasks].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
    return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
  });

  const completedCount = studyTasks.filter(t => t.isCompleted).length;
  const totalCount = studyTasks.length;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 页面标题 */}
      <div className="mb-6 sm:mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center">
              <CheckSquare className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">学习清单</h1>
              <p className="text-slate-600">管理您的学习任务和待办事项</p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditingTaskId(null);
              setNewTask({ title: '', description: '', priority: 'medium', dueDate: '' });
              setShowAddForm(!showAddForm);
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-4 py-2 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Plus className="h-4 w-4" />
            添加任务
          </button>
        </div>
      </div>

      {/* 进度概览 */}
      <div className="card-base p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">任务进度</h3>
          <span className="text-sm font-medium text-emerald-700">
            {totalCount > 0 ? `${completedCount}/${totalCount} 已完成` : '暂无任务'}
          </span>
        </div>
        {totalCount > 0 && (
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-1000"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* 添加/编辑任务表单 */}
      {showAddForm && (
        <div className="card-base p-5 sm:p-6 animate-in fade-in slide-in-from-bottom-4">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            {editingTaskId ? '编辑任务' : '添加新任务'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">任务标题 *</label>
              <input
                type="text"
                required
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-all duration-200"
                placeholder="输入任务标题..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">任务描述</label>
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-all duration-200 resize-vertical"
                rows={3}
                placeholder="输入任务描述..."
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">优先级</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'low' | 'medium' | 'high' })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-all duration-200"
                >
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">截止日期</label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-all duration-200"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingTaskId(null);
                  setNewTask({ title: '', description: '', priority: 'medium', dueDate: '' });
                }}
                className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all duration-200"
              >
                取消
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl transition-all duration-200"
              >
                {editingTaskId ? '保存修改' : '添加任务'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 任务列表 */}
      <div className="space-y-3">
        {sortedTasks.map((task) => (
          <div 
            key={task.id}
            className={`card-base card-hover p-4 sm:p-5 transition-all duration-300 ${
              task.isCompleted ? 'bg-emerald-50/50 border-emerald-100' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <button
                onClick={() => toggleStudyTask(task.id)}
                className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                  task.isCompleted 
                    ? 'bg-emerald-500 border-emerald-500 text-white' 
                    : 'border-slate-300 hover:border-emerald-500'
                }`}
              >
                {task.isCompleted && <CheckSquare className="h-4 w-4" />}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className={`font-medium ${
                      task.isCompleted ? 'text-slate-500 line-through' : 'text-slate-800'
                    }`}>
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-sm text-slate-500 mt-1">{task.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${getPriorityColor(task.priority)}`}>
                      <Flag className="h-3 w-3" />
                      {getPriorityLabel(task.priority)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3">
                  {task.dueDate && (
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <CalendarIcon className="h-3 w-3" />
                      <span>{new Date(task.dueDate).toLocaleDateString('zh-CN')}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 ml-auto">
                    <button
                      onClick={() => handleEdit(task)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteStudyTask(task.id)}
                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {sortedTasks.length === 0 && (
          <div className="card-base p-10 text-center">
            <CheckSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">暂无学习任务</p>
            <p className="text-sm text-slate-400 mt-1">点击上方按钮添加第一个任务</p>
          </div>
        )}
      </div>
    </div>
  );
}
