import { create } from 'zustand';
import { Course, Chapter, Note, StudyRecord, TodayGoal, AppState, StudyTask } from '../types';
import { loadState, saveState } from '../utils/storage';

const mockCourses: Course[] = [
  {
    id: 'course-1',
    title: 'Python基础',
    description: 'Python编程语言的基础语法、数据类型、控制结构和函数等核心概念',
    category: '编程语言',
    progress: 16,
    createdAt: new Date('2024-09-01').toISOString(),
    updatedAt: new Date('2024-10-15').toISOString(),
    introduction: 'Python是一门易于学习、功能强大的编程语言，被广泛应用于数据分析、人工智能、Web开发、自动化等领域。本课程从零基础开始，系统讲解Python的基础语法和核心概念，培养您的编程思维和实践能力。',
    skills: ['掌握Python基础语法', '熟练使用基本数据类型', '编写函数和模块', '理解面向对象编程', '使用Python进行数据处理'],
    evaluation: '课堂练习30% + 章节测验30% + 期末项目40%',
    learningResources: [
      { title: 'Python官方文档', url: 'https://docs.python.org/3/', type: '官方文档' },
      { title: '廖雪峰Python教程', url: 'https://www.liaoxuefeng.com/wiki/1016959663602400', type: '在线教程' },
      { title: 'Python代码规范', url: 'https://pep8.org/', type: '编码规范' }
    ]
  },
  {
    id: 'course-2',
    title: '数据分析技术',
    description: '数据清洗、数据可视化、统计分析等数据分析核心技术',
    category: '数据分析',
    progress: 60,
    createdAt: new Date('2024-09-15').toISOString(),
    updatedAt: new Date('2024-10-10').toISOString(),
    introduction: '数据分析是企业决策的重要依据。本课程涵盖数据分析的完整流程，包括数据收集、清洗、转换、分析和可视化，培养您成为合格的数据分析师。',
    skills: ['掌握数据清洗技术', '熟练使用Pandas进行数据处理', '创建专业数据可视化图表', '进行描述性统计分析', '解读数据分析结果'],
    evaluation: '实验报告30% + 案例分析30% + 综合项目40%',
    learningResources: [
      { title: 'Pandas官方文档', url: 'https://pandas.pydata.org/docs/', type: '官方文档' },
      { title: 'Matplotlib教程', url: 'https://matplotlib.org/stable/tutorials/index.html', type: '官方文档' },
      { title: 'Kaggle数据集', url: 'https://www.kaggle.com/datasets', type: '数据集' }
    ]
  },
  {
    id: 'course-3',
    title: '数据采集与处理',
    description: '网络爬虫、数据抓取、数据预处理等数据采集和处理技术',
    category: '数据分析',
    progress: 45,
    createdAt: new Date('2024-10-01').toISOString(),
    updatedAt: new Date('2024-10-05').toISOString(),
    introduction: '数据是数据分析的基础。本课程教授数据采集的各种方法，包括网络爬虫、API调用、数据库查询等，以及数据预处理技术，为后续分析奠定基础。',
    skills: ['编写Python网络爬虫', '调用RESTful API', '进行数据清洗和预处理', '处理多种数据格式', '遵守网络爬虫伦理规范'],
    evaluation: '爬虫实战30% + 数据处理报告30% + 期末综合项目40%',
    learningResources: [
      { title: 'Requests库文档', url: 'https://docs.python-requests.org/', type: '官方文档' },
      { title: 'BeautifulSoup文档', url: 'https://www.crummy.com/software/BeautifulSoup/bs4/doc/', type: '官方文档' },
      { title: 'Scrapy框架', url: 'https://scrapy.org/', type: '爬虫框架' }
    ]
  },
  {
    id: 'course-4',
    title: '供应链数据分析',
    description: '供应链管理中的数据分析方法、库存优化、物流分析等',
    category: '专业课程',
    progress: 30,
    createdAt: new Date('2024-10-05').toISOString(),
    updatedAt: new Date('2024-10-08').toISOString(),
    introduction: '供应链数据分析是企业提升运营效率的关键。本课程结合商务数据分析专业的特点，教授供应链各环节的数据分析方法，包括需求预测、库存优化、物流调度等。',
    skills: ['进行需求预测分析', '优化库存管理策略', '分析物流配送效率', '使用数据分析支持决策', '构建供应链数据模型'],
    evaluation: '案例分析30% + 实践项目40% + 期末答辩30%',
    learningResources: [
      { title: '供应链管理知识', url: 'https://www.scmresearch.com/', type: '学术资源' },
      { title: '库存管理方法', url: 'https://www.investopedia.com/terms/in/inventory-management.asp', type: '专业文章' }
    ]
  },
  {
    id: 'course-5',
    title: '数据库原理与应用',
    description: '数据库设计、SQL语句、关系型数据库和NoSQL数据库应用',
    category: '数据库',
    progress: 50,
    createdAt: new Date('2024-09-20').toISOString(),
    updatedAt: new Date('2024-10-12').toISOString(),
    introduction: '数据库是现代信息系统的基础。本课程系统讲解数据库的设计原理、SQL查询语言，以及MySQL、PostgreSQL等主流数据库的应用，培养您管理和分析数据的能力。',
    skills: ['设计规范化的数据库', '熟练编写SQL查询', '进行数据库性能优化', '理解事务和并发控制', '使用NoSQL数据库'],
    evaluation: '数据库设计作业25% + SQL编程实验25% + 综合设计项目50%',
    learningResources: [
      { title: 'MySQL官方文档', url: 'https://dev.mysql.com/doc/', type: '官方文档' },
      { title: 'SQL教程', url: 'https://www.w3schools.com/sql/', type: '在线教程' },
      { title: 'PostgreSQL教程', url: 'https://www.postgresql.org/docs/', type: '官方文档' }
    ]
  },
  {
    id: 'course-6',
    title: '商务智能与数据可视化',
    description: '商业智能工具使用、数据仪表盘设计、数据可视化最佳实践',
    category: '数据分析',
    progress: 20,
    createdAt: new Date('2024-10-10').toISOString(),
    updatedAt: new Date('2024-10-10').toISOString(),
    introduction: '商务智能是将数据转化为商业价值的艺术。本课程教授如何使用Tableau、Power BI等工具创建专业的数据可视化报表和交互式仪表盘，为企业决策提供有力支持。',
    skills: ['使用Tableau创建可视化', '设计商业数据仪表盘', '掌握数据可视化最佳实践', '进行业务数据故事化呈现', '使用BI工具进行数据分析'],
    evaluation: '可视化作品集40% + 业务分析报告30% + 期末展示30%',
    learningResources: [
      { title: 'Tableau官方教程', url: 'https://www.tableau.com/learn/training', type: '官方教程' },
      { title: 'Power BI文档', url: 'https://docs.microsoft.com/zh-cn/power-bi/', type: '官方文档' },
      { title: '数据可视化案例库', url: 'https://www.tableau.com/public/gallery', type: '案例库' }
    ]
  }
];

const mockChapters: Chapter[] = [
  {
    id: 'chapter-1',
    courseId: 'course-1',
    title: 'Python简介与环境搭建',
    content: 'Python的历史、特点、安装方法和开发环境配置。',
    isCompleted: true,
    completedAt: new Date('2024-09-05').toISOString(),
    studyDurationMinutes: 60,
    keyPoints: ['Python的特点和应用领域', '安装Python和Anaconda', '配置开发环境', '编写第一个程序'],
    exercises: [
      {
        id: 'ex-1-1',
        type: 'choice',
        question: 'Python是由谁创建的？',
        options: ['Bill Gates', 'Guido van Rossum', 'James Gosling', 'Dennis Ritchie'],
        answer: 1,
        explanation: 'Python是由荷兰程序员Guido van Rossum于1991年创建的高级编程语言。'
      },
      {
        id: 'ex-1-2',
        type: 'code',
        question: '请编写一个Python程序，输出"Hello, World!"',
        codeTemplate: '# 在下方编写代码\nprint()',
        answer: 'print("Hello, World!")',
        explanation: '使用print()函数输出字符串，注意字符串需要用引号包裹。'
      }
    ]
  },
  {
    id: 'chapter-2',
    courseId: 'course-1',
    title: 'Python基础语法',
    content: '变量、数据类型、运算符、控制结构等基础语法。',
    isCompleted: true,
    studyDurationMinutes: 90,
    keyPoints: ['变量命名规则', '六种基本数据类型', '算术和比较运算符', 'if-elif-else条件语句', 'for和while循环'],
    exercises: [
      {
        id: 'ex-2-1',
        type: 'choice',
        question: '下列哪个是Python中的合法变量名？',
        options: ['2name', 'my-name', 'my_name', 'class'],
        answer: 2,
        explanation: 'Python变量名不能以数字开头，不能使用连字符，不能使用保留关键字。my_name是合法的变量名。'
      }
    ]
  },
  {
    id: 'chapter-3',
    courseId: 'course-1',
    title: '项目1：电商订单数据清洗与标准化',
    content: '处理乱码日期、负价格、空值等脏数据，为AI模型提供干净数据。学习pandas基础数据清洗方法。',
    isCompleted: false,
    studyDurationMinutes: 120,
    keyPoints: ['Pandas数据清洗', '异常值处理', '日期格式统一', '缺失值填充'],
    hasCodePractice: true
  },
  {
    id: 'chapter-4',
    courseId: 'course-1',
    title: '项目2：用户行为日志解析与Session构建',
    content: '从埋点日志构建用户会话序列，为AI推荐系统提供结构化输入。学习时间序列数据处理。',
    isCompleted: false,
    studyDurationMinutes: 120,
    keyPoints: ['Session分析', '时间序列处理', '用户路径分析', '会话切分'],
    hasCodePractice: true
  },
  {
    id: 'chapter-5',
    courseId: 'course-1',
    title: '项目3：销售数据的多维度探索性分析（EDA）',
    content: '直观理解销售规律，为预测建模打基础。学习pandas透视表和统计分析。',
    isCompleted: false,
    studyDurationMinutes: 120,
    keyPoints: ['透视表操作', '统计摘要', '周末效应分析', '销售波动'],
    hasCodePractice: true
  },
  {
    id: 'chapter-6',
    courseId: 'course-1',
    title: '项目4：购物车分析——商品关联规则挖掘',
    content: '经典的"啤酒与尿布"分析，挖掘捆绑推荐规则。学习商品共现分析。',
    isCompleted: false,
    studyDurationMinutes: 150,
    keyPoints: ['关联规则', '支持度置信度', '提升度计算', '推荐策略'],
    hasCodePractice: true
  },
  {
    id: 'chapter-7',
    courseId: 'course-1',
    title: '项目5：基于RFM模型的用户价值分层',
    content: '精细化运营的核心，为AI营销策略提供特征输入。学习用户分层方法。',
    isCompleted: false,
    studyDurationMinutes: 150,
    keyPoints: ['RFM模型', '用户价值分层', '分位数划分', '运营策略'],
    hasCodePractice: true
  },
  {
    id: 'chapter-8',
    courseId: 'course-1',
    title: '项目6：用户画像构建——K-Means聚类分析',
    content: '利用AI算法自动划分用户群体，实现自动化分群。学习无监督学习应用。',
    isCompleted: false,
    studyDurationMinutes: 180,
    keyPoints: ['K-Means聚类', '特征工程', '用户画像', '群体分析'],
    hasCodePractice: true
  },
  {
    id: 'chapter-9',
    courseId: 'course-1',
    title: '项目7：时间序列分解与移动平均预测',
    content: '理解销售数据的趋势与季节性，为AI预测模型提供基线。学习时间序列分析。',
    isCompleted: false,
    studyDurationMinutes: 150,
    keyPoints: ['时间序列', '移动平均', '季节性分解', '异常检测'],
    hasCodePractice: true
  },
  {
    id: 'chapter-10',
    courseId: 'course-1',
    title: '项目8：评论文本情感分析与销量关联',
    content: '利用NLP将非结构化评论转化为可分析数据，验证口碑效应。学习文本分析。',
    isCompleted: false,
    studyDurationMinutes: 150,
    keyPoints: ['情感分析', 'NLP基础', '关键词提取', '相关性分析'],
    hasCodePractice: true
  },
  {
    id: 'chapter-11',
    courseId: 'course-1',
    title: '项目9：协同过滤推荐系统实现',
    content: '理解AI推荐算法的底层矩阵运算逻辑。学习推荐系统原理。',
    isCompleted: false,
    studyDurationMinutes: 180,
    keyPoints: ['协同过滤', '余弦相似度', '矩阵运算', '推荐算法'],
    hasCodePractice: true
  },
  {
    id: 'chapter-12',
    courseId: 'course-1',
    title: '项目10：综合实战——电商全链路数据分析',
    content: '模拟真实工作场景，融合前面所有技术完成完整分析报告。',
    isCompleted: false,
    studyDurationMinutes: 240,
    keyPoints: ['全链路分析', '流量漏斗', '用户聚类', '策略建议'],
    hasCodePractice: true
  }
];

const mockNotes: Note[] = [
  {
    id: 'note-1',
    courseId: 'course-1',
    chapterId: 'chapter-1',
    title: 'Python环境搭建笔记',
    content: '1. 下载Python安装包\n2. 安装时勾选Add Python to PATH\n3. 验证安装：python --version\n4. 推荐使用VS Code或PyCharm作为IDE',
    createdAt: new Date('2024-09-06').toISOString(),
    updatedAt: new Date('2024-09-06').toISOString()
  }
];

const mockStudyRecords: StudyRecord[] = [
  {
    id: 'record-1',
    courseId: 'course-1',
    durationMinutes: 60,
    date: new Date().toISOString()
  },
  {
    id: 'record-2',
    courseId: 'course-2',
    durationMinutes: 45,
    date: new Date().toISOString()
  }
];

const mockTodayGoals: TodayGoal[] = [
  {
    id: 'goal-1',
    courseId: 'course-1',
    targetMinutes: 90,
    completedMinutes: 60,
    date: new Date().toISOString().split('T')[0],
    isCompleted: false
  },
  {
    id: 'goal-2',
    courseId: 'course-2',
    targetMinutes: 60,
    completedMinutes: 45,
    date: new Date().toISOString().split('T')[0],
    isCompleted: false
  }
];

const mockStudyTasks: StudyTask[] = [
  {
    id: 'task-1',
    title: '完成Python基础第一章练习',
    description: '完成课后所有选择题和编程练习',
    isCompleted: true,
    createdAt: new Date('2024-09-05').toISOString(),
    priority: 'high'
  },
  {
    id: 'task-2',
    title: '复习数据类型相关知识',
    description: '重点掌握列表和字典的使用',
    isCompleted: false,
    createdAt: new Date('2024-09-10').toISOString(),
    priority: 'medium'
  },
  {
    id: 'task-3',
    title: '准备数据分析项目',
    description: '收集项目所需数据集',
    isCompleted: false,
    createdAt: new Date('2024-09-15').toISOString(),
    priority: 'low'
  }
];

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useAppStore = create<AppState>((set, get) => {
  const initialState = loadState();
  
  const baseState = {
    courses: initialState?.courses || mockCourses,
    chapters: initialState?.chapters || mockChapters,
    notes: initialState?.notes || mockNotes,
    studyRecords: initialState?.studyRecords || mockStudyRecords,
    todayGoals: initialState?.todayGoals || mockTodayGoals,
    studyTasks: initialState?.studyTasks || mockStudyTasks
  };
  
  const saveCurrentState = () => {
    const state = get();
    saveState({
      courses: state.courses,
      chapters: state.chapters,
      notes: state.notes,
      studyRecords: state.studyRecords,
      todayGoals: state.todayGoals,
      studyTasks: state.studyTasks
    });
  };
  
  return {
    ...baseState,
    
    addCourse: (courseData) => {
      const now = new Date().toISOString();
      const newCourse: Course = {
        ...courseData,
        id: `course-${generateId()}`,
        progress: 0,
        createdAt: now,
        updatedAt: now
      };
      set((state) => ({
        courses: [...state.courses, newCourse]
      }));
      saveCurrentState();
    },
    
    updateCourse: (id, updates) => {
      set((state) => ({
        courses: state.courses.map((course) =>
          course.id === id
            ? { ...course, ...updates, updatedAt: new Date().toISOString() }
            : course
        )
      }));
      saveCurrentState();
    },
    
    deleteCourse: (id) => {
      set((state) => ({
        courses: state.courses.filter((course) => course.id !== id),
        chapters: state.chapters.filter((chapter) => chapter.courseId !== id),
        notes: state.notes.filter((note) => note.courseId !== id),
        studyRecords: state.studyRecords.filter((r) => r.courseId !== id),
        todayGoals: state.todayGoals.filter((g) => g.courseId !== id)
      }));
      saveCurrentState();
    },
    
    addChapter: (chapterData) => {
      const newChapter: Chapter = {
        ...chapterData,
        id: `chapter-${generateId()}`
      };
      set((state) => ({
        chapters: [...state.chapters, newChapter]
      }));
      saveCurrentState();
      get().updateCourseProgress(chapterData.courseId);
    },
    
    updateChapter: (id, updates) => {
      const stateBefore = get();
      const chapterBefore = stateBefore.chapters.find((c) => c.id === id);
      const courseId = chapterBefore?.courseId;
      
      if (!chapterBefore?.isCompleted && updates.isCompleted) {
        const studyDurationMinutes = updates.studyDurationMinutes || 20;
        
        updates.studyDurationMinutes = studyDurationMinutes;
        
        const todayStr = new Date().toISOString().split('T')[0];
        const todayRecord = stateBefore.studyRecords.find(
          (r) => r.courseId === courseId && r.date.split('T')[0] === todayStr
        );
        
        if (todayRecord) {
          set((state) => ({
            studyRecords: state.studyRecords.map((r) =>
              r.id === todayRecord.id
                ? { ...r, durationMinutes: r.durationMinutes + studyDurationMinutes }
                : r
            )
          }));
        } else {
          get().addStudyRecord({
            courseId: courseId!,
            durationMinutes: studyDurationMinutes,
            date: new Date().toISOString()
          });
        }
        
        const todayGoal = stateBefore.todayGoals.find(
          (g) => g.courseId === courseId && g.date === todayStr
        );
        if (todayGoal) {
          get().updateTodayGoal(todayGoal.id, {
            completedMinutes: todayGoal.completedMinutes + studyDurationMinutes
          });
        }
      }
      
      set((state) => ({
        chapters: state.chapters.map((c) =>
          c.id === id ? { ...c, ...updates } : c
        )
      }));
      saveCurrentState();
      
      if (courseId) {
        get().updateCourseProgress(courseId);
      }
    },
    
    deleteChapter: (id) => {
      const stateBefore = get();
      const chapterBefore = stateBefore.chapters.find((c) => c.id === id);
      const courseId = chapterBefore?.courseId;
      
      set((state) => ({
        chapters: state.chapters.filter((c) => c.id !== id),
        notes: state.notes.filter((note) => note.chapterId !== id)
      }));
      saveCurrentState();
      
      if (courseId) {
        get().updateCourseProgress(courseId);
      }
    },
    
    addNote: (noteData) => {
      const now = new Date().toISOString();
      const newNote: Note = {
        ...noteData,
        id: `note-${generateId()}`,
        createdAt: now,
        updatedAt: now
      };
      set((state) => ({
        notes: [...state.notes, newNote]
      }));
      saveCurrentState();
    },
    
    updateNote: (id, updates) => {
      set((state) => ({
        notes: state.notes.map((note) =>
          note.id === id
            ? { ...note, ...updates, updatedAt: new Date().toISOString() }
            : note
        )
      }));
      saveCurrentState();
    },
    
    deleteNote: (id) => {
      set((state) => ({
        notes: state.notes.filter((note) => note.id !== id)
      }));
      saveCurrentState();
    },
    
    updateCourseProgress: (courseId) => {
      const state = get();
      const courseChapters = state.chapters.filter(
        (chapter) => chapter.courseId === courseId
      );
      const completedChapters = courseChapters.filter(
        (chapter) => chapter.isCompleted
      ).length;
      const totalChapters = courseChapters.length;
      const progress = totalChapters > 0
        ? Math.round((completedChapters / totalChapters) * 100)
        : 0;
      
      set((state) => ({
        courses: state.courses.map((course) =>
          course.id === courseId
            ? { ...course, progress, updatedAt: new Date().toISOString() }
            : course
        )
      }));
      saveCurrentState();
    },
    
    addStudyRecord: (recordData) => {
      const newRecord: StudyRecord = {
        ...recordData,
        id: `record-${generateId()}`
      };
      set((state) => ({
        studyRecords: [...state.studyRecords, newRecord]
      }));
      saveCurrentState();
    },
    
    addTodayGoal: (goalData) => {
      const newGoal: TodayGoal = {
        ...goalData,
        id: `goal-${generateId()}`,
        completedMinutes: 0,
        isCompleted: false
      };
      set((state) => ({
        todayGoals: [...state.todayGoals, newGoal]
      }));
      saveCurrentState();
    },
    
    updateTodayGoal: (goalId, updates) => {
      set((state) => ({
        todayGoals: state.todayGoals.map((goal) => {
          if (goal.id !== goalId) return goal;
          const updatedGoal = { ...goal, ...updates };
          return {
            ...updatedGoal,
            isCompleted: updatedGoal.completedMinutes >= updatedGoal.targetMinutes
          };
        })
      }));
      saveCurrentState();
    },
    
    adjustTodayGoalMinutes: (goalId, delta) => {
      const state = get();
      const goal = state.todayGoals.find(g => g.id === goalId);
      if (goal) {
        const newCompletedMinutes = Math.max(0, goal.completedMinutes + delta);
        get().updateTodayGoal(goalId, { completedMinutes: newCompletedMinutes });
      }
    },
    
    addStudyTask: (taskData) => {
      const newTask: StudyTask = {
        ...taskData,
        id: `task-${generateId()}`,
        createdAt: new Date().toISOString()
      };
      set((state) => ({
        studyTasks: [...state.studyTasks, newTask]
      }));
      saveCurrentState();
    },
    
    toggleStudyTask: (taskId) => {
      set((state) => ({
        studyTasks: state.studyTasks.map((task) =>
          task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
        )
      }));
      saveCurrentState();
    },
    
    updateStudyTask: (taskId, updates) => {
      set((state) => ({
        studyTasks: state.studyTasks.map((task) =>
          task.id === taskId ? { ...task, ...updates } : task
        )
      }));
      saveCurrentState();
    },
    
    deleteStudyTask: (taskId) => {
      set((state) => ({
        studyTasks: state.studyTasks.filter((task) => task.id !== taskId)
      }));
      saveCurrentState();
    },
    
    getTotalCourses: () => {
      return get().courses.length;
    },
    
    getCompletedCourses: () => {
      return get().courses.filter((course) => course.progress === 100).length;
    },
    
    getTotalStudyTime: () => {
      return get().studyRecords.reduce((total, record) => total + record.durationMinutes, 0);
    },
    
    getTodayStudyTime: () => {
      const todayStr = new Date().toISOString().split('T')[0];
      return get().studyRecords
        .filter((record) => record.date.split('T')[0] === todayStr)
        .reduce((total, record) => total + record.durationMinutes, 0);
    },
    
    getTodayGoalProgress: () => {
      const todayStr = new Date().toISOString().split('T')[0];
      const todayGoals = get().todayGoals.filter((goal) => goal.date === todayStr);
      const totalTarget = todayGoals.reduce((total, goal) => total + goal.targetMinutes, 0);
      const totalCompleted = todayGoals.reduce((total, goal) => total + goal.completedMinutes, 0);
      return totalTarget > 0 ? Math.round((totalCompleted / totalTarget) * 100) : 0;
    },
    
    getRecentCourses: () => {
      return [...get().courses].sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ).slice(0, 4);
    }
  };
});
