export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
  introduction?: string;
  skills?: string[];
  evaluation?: string;
  learningResources?: { title: string; url: string; type: string }[];
}

export interface Exercise {
  id: string;
  type: 'choice' | 'code';
  question: string;
  options?: string[];
  answer?: number | string;
  codeTemplate?: string;
  explanation?: string;
}

export interface Chapter {
  id: string;
  courseId: string;
  title: string;
  content: string;
  isCompleted: boolean;
  completedAt?: string;
  studyDurationMinutes?: number;
  keyPoints?: string[];
  exercises?: Exercise[];
}

export interface Note {
  id: string;
  courseId: string;
  chapterId?: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudyRecord {
  id: string;
  courseId: string;
  durationMinutes: number;
  date: string;
}

export interface TodayGoal {
  id: string;
  courseId: string;
  targetMinutes: number;
  completedMinutes: number;
  date: string;
  isCompleted: boolean;
}

export interface StudyTask {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
}

export interface AppState {
  courses: Course[];
  chapters: Chapter[];
  notes: Note[];
  studyRecords: StudyRecord[];
  todayGoals: TodayGoal[];
  studyTasks: StudyTask[];
  addCourse: (course: Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'progress'>) => void;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  addChapter: (chapter: Omit<Chapter, 'id'>) => void;
  updateChapter: (id: string, updates: Partial<Chapter>) => void;
  deleteChapter: (id: string) => void;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  updateCourseProgress: (courseId: string) => void;
  addStudyRecord: (record: Omit<StudyRecord, 'id'>) => void;
  addTodayGoal: (goal: Omit<TodayGoal, 'id' | 'completedMinutes' | 'isCompleted'>) => void;
  updateTodayGoal: (id: string, updates: Partial<TodayGoal>) => void;
  adjustTodayGoalMinutes: (id: string, delta: number) => void;
  addStudyTask: (task: Omit<StudyTask, 'id' | 'createdAt'>) => void;
  toggleStudyTask: (id: string) => void;
  updateStudyTask: (id: string, updates: Partial<StudyTask>) => void;
  deleteStudyTask: (id: string) => void;
  getTotalCourses: () => number;
  getCompletedCourses: () => number;
  getTotalStudyTime: () => number;
  getTodayStudyTime: () => number;
  getTodayGoalProgress: () => number;
  getRecentCourses: () => Course[];
}
