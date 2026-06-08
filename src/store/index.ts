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
  },
  {
    id: 'chapter-13',
    courseId: 'course-5',
    title: '项目1：数据库连接与数据抽取（SQL + Pandas）',
    content: '从数据库中提取销售数据，为分析做准备。使用 SQLite/MySQL 创建订单表、订单明细表、商品表，使用 sqlalchemy + pandas.read_sql 读取数据，验证数据行数与原始表一致。',
    isCompleted: false,
    studyDurationMinutes: 120,
    keyPoints: ['SQLite/MySQL数据库', 'SQLAlchemy', 'pandas.read_sql', '数据验证'],
    hasCodePractice: true
  },
  {
    id: 'chapter-14',
    courseId: 'course-5',
    title: '项目2：数据清洗与缺失值处理',
    content: '掌握真实数据中的缺失值、异常值处理。构造含缺失值的订单表（金额、用户ID缺失），使用 Pandas 进行：删除空行、填充均值、标记缺失，输出清洗前后的统计对比。',
    isCompleted: false,
    studyDurationMinutes: 120,
    keyPoints: ['缺失值处理', '数据清洗', '统计对比', '异常值检测'],
    hasCodePractice: true
  },
  {
    id: 'chapter-15',
    courseId: 'course-5',
    title: '项目3：购物车分析（Market Basket Analysis）',
    content: '使用关联规则挖掘（Apriori / mlxtend）。将订单明细转换为"购物篮"格式（每一行是一个订单的商品清单），计算支持度、置信度、提升度，找出强关联规则（例如 {牛奶} → {面包}）。',
    isCompleted: false,
    studyDurationMinutes: 150,
    keyPoints: ['关联规则', 'Apriori算法', '支持度置信度', '提升度'],
    hasCodePractice: true
  },
  {
    id: 'chapter-16',
    courseId: 'course-5',
    title: '项目4：用户消费行为RFM分析',
    content: '基于最近购买时间、频率、金额进行用户分层。计算每个用户的 R（最近）、F（频率）、M（金额），对每个指标分箱（如1-5分），输出高价值用户名单。',
    isCompleted: false,
    studyDurationMinutes: 150,
    keyPoints: ['RFM模型', '用户分层', '分箱操作', '价值评估'],
    hasCodePractice: true
  },
  {
    id: 'chapter-17',
    courseId: 'course-5',
    title: '项目5：时间序列分析与趋势预测',
    content: '分析销售额随时间变化，使用简单预测模型。将订单数据按日/月聚合，使用 Pandas 重采样与滚动平均，使用 statsmodels 做季节性分解或简单线性回归预测。',
    isCompleted: false,
    studyDurationMinutes: 150,
    keyPoints: ['时间序列', '重采样', '滚动平均', '趋势预测'],
    hasCodePractice: true
  },
  {
    id: 'chapter-18',
    courseId: 'course-5',
    title: '项目6：用户聚类分析（KMeans）',
    content: '基于消费行为将用户分群。选取特征：总消费额、平均客单价、购买品类数，标准化后使用 KMeans 聚类（k=3~5），可视化聚类结果（PCA降维或散点图）。',
    isCompleted: false,
    studyDurationMinutes: 180,
    keyPoints: ['K-Means聚类', '特征工程', 'PCA降维', '可视化'],
    hasCodePractice: true
  },
  {
    id: 'chapter-19',
    courseId: 'course-5',
    title: '项目7：商品价格敏感度分析（价格弹性）',
    content: '分析价格变化对销量的影响。计算不同价格区间的平均销量，拟合对数线性模型估计价格弹性系数，输出价格弹性 > 1 的商品（高敏感）。',
    isCompleted: false,
    studyDurationMinutes: 150,
    keyPoints: ['价格弹性', '销量分析', '对数模型', '敏感度评估'],
    hasCodePractice: true
  },
  {
    id: 'chapter-20',
    courseId: 'course-5',
    title: '项目8：实时数据流模拟与滑动窗口聚合',
    content: '模拟AI场景下的流式数据处理。使用 deque 或 pandas 模拟每5秒到达的订单事件，计算过去1分钟的销售额滑动平均，检测异常峰值（超过均值+3倍标准差）。',
    isCompleted: false,
    studyDurationMinutes: 150,
    keyPoints: ['流式数据', '滑动窗口', '异常检测', '实时聚合'],
    hasCodePractice: true
  },
  {
    id: 'chapter-21',
    courseId: 'course-5',
    title: '项目9：多表关联与特征工程',
    content: '为机器学习模型构建特征表。关联订单表、用户表、商品表、评价表，构造特征：用户历史好评率、商品被购买时段分布，输出可直接用于聚类的特征矩阵。',
    isCompleted: false,
    studyDurationMinutes: 180,
    keyPoints: ['多表关联', '特征工程', '评价分析', '特征矩阵'],
    hasCodePractice: true
  },
  {
    id: 'chapter-22',
    courseId: 'course-5',
    title: '项目10：端到端分析报告自动生成',
    content: '整合所有分析，输出结构化报告。运行以上任意4~6个分析模块，将结果（聚类群体画像、关联规则、RFM表）写入数据库结果表，使用 matplotlib / seaborn 生成图表，并导出为 PDF / HTML。',
    isCompleted: false,
    studyDurationMinutes: 240,
    keyPoints: ['报告生成', '结果保存', '可视化', '端到端'],
    hasCodePractice: true
  },
  {
    id: 'chapter-23',
    courseId: 'course-2',
    title: '项目1：用户购物车弃购原因清洗与统计',
    content: '处理订单表中的时间列格式、缺失支付时间标记弃购，计算弃购率、平均放弃购物车价值。',
    isCompleted: false,
    studyDurationMinutes: 120,
    keyPoints: ['弃购率计算', '缺失值处理', '数据清洗', '统计对比'],
    hasCodePractice: true
  },
  {
    id: 'chapter-24',
    courseId: 'course-2',
    title: '项目2：购物车关联规则挖掘准备（支持→置信度计算）',
    content: '按交易ID聚合为购物篮格式，计算{牛奶}→{面包}的支持度、置信度。',
    isCompleted: false,
    studyDurationMinutes: 120,
    keyPoints: ['购物篮格式', '关联规则', '支持度', '置信度'],
    hasCodePractice: true
  },
  {
    id: 'chapter-25',
    courseId: 'course-2',
    title: '项目3：RFM用户价值分层（不使用现成库）',
    content: '计算R（最近消费天数）、F（频次）、M（总金额），将用户按百分位数分为高中低三档。',
    isCompleted: false,
    studyDurationMinutes: 150,
    keyPoints: ['RFM模型', '用户分层', '百分位数', '价值评估'],
    hasCodePractice: true
  },
  {
    id: 'chapter-26',
    courseId: 'course-2',
    title: '项目4：K-Means用户分群（基于消费行为）',
    content: '使用sklearn.cluster.KMeans进行用户分群，分析不同簇的购物车商品类目偏好。',
    isCompleted: false,
    studyDurationMinutes: 150,
    keyPoints: ['K-Means聚类', '特征工程', '标准化', '消费行为分析'],
    hasCodePractice: true
  },
  {
    id: 'chapter-27',
    courseId: 'course-2',
    title: '项目5：购物车加购→支付转化漏斗分析',
    content: '按session计算加购→支付转化率，识别高加购但低支付的商品。',
    isCompleted: false,
    studyDurationMinutes: 120,
    keyPoints: ['转化漏斗', 'Session分析', '支付转化率', '商品分析'],
    hasCodePractice: true
  },
  {
    id: 'chapter-28',
    courseId: 'course-2',
    title: '项目6：异常购物车行为检测（孤立森林）',
    content: '使用sklearn.ensemble.IsolationForest标记异常购物车（刷单/测试单），输出异常购物车的典型特征。',
    isCompleted: false,
    studyDurationMinutes: 180,
    keyPoints: ['异常检测', 'IsolationForest', '刷单识别', '行为分析'],
    hasCodePractice: true
  },
  {
    id: 'chapter-29',
    courseId: 'course-2',
    title: '项目7：时序购物车趋势预测（移动平均/指数平滑）',
    content: '使用pandas.rolling计算7日均线，识别周末效应及促销日峰值。',
    isCompleted: false,
    studyDurationMinutes: 150,
    keyPoints: ['时间序列', '移动平均', '趋势预测', '周末效应'],
    hasCodePractice: true
  },
  {
    id: 'chapter-30',
    courseId: 'course-2',
    title: '项目8：基于购物车内容的交叉销售推荐验证',
    content: '构建共现矩阵，对给定商品推荐最常一起加购的商品配件。',
    isCompleted: false,
    studyDurationMinutes: 150,
    keyPoints: ['交叉销售', '共现矩阵', '推荐系统', '商品关联'],
    hasCodePractice: true
  },
  {
    id: 'chapter-31',
    courseId: 'course-2',
    title: '项目9：购物车放弃原因归因（决策树/分组均值对比）',
    content: '分组对比弃购/支付用户的平均运费和优惠券金额，使用pandas.cut计算各箱弃购率。',
    isCompleted: false,
    studyDurationMinutes: 150,
    keyPoints: ['归因分析', '决策树', '弃购分析', '价格敏感度'],
    hasCodePractice: true
  },
  {
    id: 'chapter-32',
    courseId: 'course-2',
    title: '项目10：聚类后不同群体的购物车价格弹性测试',
    content: '计算每群用户的平均折扣率，验证高价值用户是否对折扣更不敏感（弹性低）。',
    isCompleted: false,
    studyDurationMinutes: 180,
    keyPoints: ['价格弹性', '用户分群', '折扣分析', '价值验证'],
    hasCodePractice: true
  },
  {
    id: 'chapter-33',
    courseId: 'course-3',
    title: '项目1：电商用户购物车行为数据清洗',
    content: '掌握Pandas处理缺失值、重复值、异常值、格式规范化。处理缺失的用户ID和负数数量，去重，转换时间列，筛选加购但未下单数据。',
    isCompleted: false,
    studyDurationMinutes: 120,
    keyPoints: ['数据清洗', '缺失值处理', '异常值检测', '格式转换'],
    hasCodePractice: true
  },
  {
    id: 'chapter-34',
    courseId: 'course-3',
    title: '项目2：Web爬取动态商品价格数据并清洗',
    content: '使用requests+BeautifulSoup爬取电商网站商品标题、价格、评价数。解析HTML，提取数值，清洗价格，统一评价数单位。',
    isCompleted: false,
    studyDurationMinutes: 150,
    keyPoints: ['网络爬虫', '数据采集', 'HTML解析', '数据清洗'],
    hasCodePractice: true
  },
  {
    id: 'chapter-35',
    courseId: 'course-3',
    title: '项目3：购物车关联规则分析（Apriori算法准备）',
    content: '购物车分析的经典场景——找出"经常一起购买"的商品。按订单ID聚合为购物篮，生成0-1矩阵，计算支持度、置信度、提升度。',
    isCompleted: false,
    studyDurationMinutes: 180,
    keyPoints: ['关联规则', 'Apriori算法', '支持度', '置信度'],
    hasCodePractice: true
  },
  {
    id: 'chapter-36',
    courseId: 'course-3',
    title: '项目4：用户购物车放弃率分析与预测特征构建',
    content: '分析加购后未下单的原因。合并购物车表+用户行为日志，计算加购到下单的时间差，创建特征，按用户聚合统计历史放弃率。',
    isCompleted: false,
    studyDurationMinutes: 150,
    keyPoints: ['放弃率分析', '特征工程', '用户行为分析', '数据合并'],
    hasCodePractice: true
  },
  {
    id: 'chapter-37',
    courseId: 'course-3',
    title: '项目5：RFM用户价值分析（基于购买和加购）',
    content: '将购物车数据转化为用户分层。计算RFM三个维度，分箱并打分，识别高价值用户。',
    isCompleted: false,
    studyDurationMinutes: 150,
    keyPoints: ['RFM模型', '用户分层', '价值分析', '分箱操作'],
    hasCodePractice: true
  },
  {
    id: 'chapter-38',
    courseId: 'course-3',
    title: '项目6：购物车商品价格敏感度分析（聚类前置）',
    content: '发现价格弹性不同的用户群。计算每个用户的平均加购价格vs实际成交价格，计算价格敏感度，清洗极值。',
    isCompleted: false,
    studyDurationMinutes: 150,
    keyPoints: ['价格敏感度', '价格弹性', '用户行为分析', '数据清洗'],
    hasCodePractice: true
  },
  {
    id: 'chapter-39',
    courseId: 'course-3',
    title: '项目7：K-Means聚类分析用户购物行为',
    content: '核心数据分析技术。标准化特征，肘部法则确定K值，K-Means聚类并标记用户群，分析每个簇的特征解读。',
    isCompleted: false,
    studyDurationMinutes: 180,
    keyPoints: ['K-Means聚类', '特征标准化', '肘部法则', '用户分群'],
    hasCodePractice: true
  },
  {
    id: 'chapter-40',
    courseId: 'course-3',
    title: '项目8：DBSCAN聚类识别异常购物车行为',
    content: '核心数据分析技术（异常检测）。使用DBSCAN聚类，标记噪声点为"疑似机器人刷购物车"，对比噪声点与正常用户的行为差异。',
    isCompleted: false,
    studyDurationMinutes: 180,
    keyPoints: ['DBSCAN聚类', '异常检测', '行为分析', '噪声识别'],
    hasCodePractice: true
  },
  {
    id: 'chapter-41',
    courseId: 'course-3',
    title: '项目9：购物车到下单的转化漏斗分析+时间序列聚类',
    content: '分析用户从加购到转化的行为路径，并按时间模式聚类。计算每个session的完成率，提取时间序列特征，使用K-Means对转化速度模式聚类。',
    isCompleted: false,
    studyDurationMinutes: 180,
    keyPoints: ['转化漏斗', '时间序列', '聚类分析', '行为路径'],
    hasCodePractice: true
  },
  {
    id: 'chapter-42',
    courseId: 'course-3',
    title: '项目10：端到端综合项目 - 电商购物车智能分析报告',
    content: '整合所有技术：数据采集→清洗→购物车分析→聚类→业务建议。完成购物车放弃率分析、关联规则挖掘、K-Means聚类，生成带图表的分析报告。',
    isCompleted: false,
    studyDurationMinutes: 240,
    keyPoints: ['端到端分析', '综合项目', '报告生成', '业务建议'],
    hasCodePractice: true
  },
  {
    id: 'chapter-43',
    courseId: 'course-4',
    title: '项目1：订单数据清洗与基础质检',
    content: '用 Pandas 处理缺失值、重复值、异常格式，构建干净的基础订单表。处理日期列的格式统一与超出范围日期，剔除数量≤0或单价≤0的记录，识别并处理订单总价与数量*单价不一致的行，检测并标记重复订单。',
    isCompleted: false,
    studyDurationMinutes: 120,
    keyPoints: ['数据清洗', '缺失值处理', '异常值检测', '数据验证'],
    hasCodePractice: true
  },
  {
    id: 'chapter-44',
    courseId: 'course-4',
    title: '项目2：库存周转与缺货预警分析',
    content: '计算产品库存周转率，识别周转过慢与可能缺货的 SKU。按月计算每个产品的销售数量总和，计算周转率 = 月销量 / 平均库存，标记周转率<0.5（滞销）和>5（高周转但库存低的缺货风险）。',
    isCompleted: false,
    studyDurationMinutes: 150,
    keyPoints: ['库存周转', '缺货预警', '周转率计算'],
    hasCodePractice: true
  },
  {
    id: 'chapter-45',
    courseId: 'course-4',
    title: '项目3：购物车分析——订单内产品组合频次',
    content: '基于订单明细，计算同时购买的产品对（Pair）及其频次。按订单分组，构造每个订单的产品列表，生成所有产品对，统计全量数据中每对产品的共现次数，找出 Top 10 最常一起购买的产品组合。',
    isCompleted: false,
    studyDurationMinutes: 150,
    keyPoints: ['关联规则', '产品组合', '共现频次'],
    hasCodePractice: true
  },
  {
    id: 'chapter-46',
    courseId: 'course-4',
    title: '项目4：客户价值分层（RFM + KMeans 聚类）',
    content: '使用 RFM（最近购买、频率、金额）做客户聚类。计算每个客户的 R / F / M 值，标准化 RFM 特征，使用 KMeans 聚类（elbow 法选 k），解释各群组业务含义。',
    isCompleted: false,
    studyDurationMinutes: 180,
    keyPoints: ['RFM模型', 'KMeans聚类', '客户分层'],
    hasCodePractice: true
  },
  {
    id: 'chapter-47',
    courseId: 'course-4',
    title: '项目5：供应商交货准时率与质量评分聚类',
    content: '对供应商进行基于准时率、不良率、响应时间的聚类。计算准时率、不良率、平均延期天数，去除异常供应商（数据不足），使用 KMeans 聚类（k=3 或 4），识别优秀、一般、高风险供应商。',
    isCompleted: false,
    studyDurationMinutes: 150,
    keyPoints: ['供应商评分', '聚类分析', '风险识别'],
    hasCodePractice: true
  },
  {
    id: 'chapter-48',
    courseId: 'course-4',
    title: '项目6：季节性销售聚类（产品按月销量模式聚类）',
    content: '找出不同销售季节模式的产品群。构建产品 × 月份 销量矩阵，对产品进行聚类（按销量时间序列形状），分析每类产品的峰值月份、低谷月份，建议对应月份的库存策略。',
    isCompleted: false,
    studyDurationMinutes: 180,
    keyPoints: ['时间序列聚类', '季节性分析', '库存策略'],
    hasCodePractice: true
  },
  {
    id: 'chapter-49',
    courseId: 'course-4',
    title: '项目7：仓库选址候选点聚类（基于客户地址经纬度）',
    content: '基于客户分布，聚类出 K 个仓库候选点。清洗无效坐标，使用 KMeans 聚类（按实际业务需求设定 K=5~10），计算每个聚类中心坐标作为候选仓库，统计各仓库覆盖的订单数量。',
    isCompleted: false,
    studyDurationMinutes: 180,
    keyPoints: ['仓库选址', '地理聚类', '订单覆盖'],
    hasCodePractice: true
  },
  {
    id: 'chapter-50',
    courseId: 'course-4',
    title: '项目8：促销效果对比（A/B 类产品购货车分析对比',
    content: '对比促销组与非促销组的购物车关联规则差异。拆分促销订单与非促销订单，分别计算两类订单中的高共现产品对，找出仅在促销组中显著出现的产品对，分析促销是否改变了购买组合习惯。',
    isCompleted: false,
    studyDurationMinutes: 150,
    keyPoints: ['A/B测试', '促销分析', '产品共现'],
    hasCodePractice: true
  },
  {
    id: 'chapter-51',
    courseId: 'course-4',
    title: '项目9：退货原因聚类分析（文本 + 数量特征',
    content: '对退货订单进行聚类，发现主要退货模式。对退货原因文本做 TF-IDF 向量化，结合退货金额与数量特征，一起做 KMeans 聚类，解读每个聚类（如：质量问题退货、数量多发退货、无理由退货）。',
    isCompleted: false,
    studyDurationMinutes: 180,
    keyPoints: ['退货分析', '文本向量化', 'KMeans聚类'],
    hasCodePractice: true
  },
  {
    id: 'chapter-52',
    courseId: 'course-4',
    title: '项目10：预测性补货——结合销量聚类与安全库存计算',
    content: '基于销量波动聚类，对不同类产品设置差异化安全库存公式。计算每个产品的月销量标准差与均值，对产品做聚类（高波动/低波动/季节性波动），为每类产品自动计算安全库存，对比传统固定库存策略与聚类差异化策略的库存成本差异。',
    isCompleted: false,
    studyDurationMinutes: 240,
    keyPoints: ['预测性补货', '安全库存', '成本优化'],
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
