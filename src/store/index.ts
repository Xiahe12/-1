import { create } from 'zustand';
import { Course, Chapter, Note, StudyRecord, TodayGoal, AppState } from '../types';
import { loadState, saveState } from '../utils/storage';

const today = new Date();

const mockCourses: Course[] = [
  {
    id: 'course-1',
    title: 'Python基础',
    description: 'Python编程语言的基础语法、数据类型、控制结构和函数等核心概念',
    category: '编程语言',
    progress: 80,
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
  // Python基础课程章节
  {
    id: 'chapter-1',
    courseId: 'course-1',
    title: 'Python简介与环境搭建',
    content: 'Python的历史、特点、安装方法和开发环境配置。\n\nPython是由Guido van Rossum于1991年创建的高级编程语言，以其简洁易懂的语法和强大的功能而闻名。Python具有以下特点：\n\n1. 简单易学：语法接近自然语言，适合初学者\n2. 功能强大：拥有丰富的第三方库\n3. 应用广泛：Web开发、数据分析、人工智能、自动化等\n4. 跨平台：Windows、Linux、MacOS均可运行\n\n【学习内容】\n• 下载并安装Python\n• 配置环境变量\n• 安装Anaconda发行版\n• 使用VS Code或PyCharm作为IDE\n• 编写并运行第一个Python程序：Hello World',
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
    content: '变量、数据类型、运算符、控制结构等基础语法。\n\n【变量与数据类型】\nPython中的变量不需要声明类型，直接赋值即可。常用数据类型包括：\n\n• 整数(int)：如 10, -5, 0\n• 浮点数(float)：如 3.14, -2.5\n• 字符串(str)：如 "Hello", "Python"\n• 布尔值(bool)：True, False\n• 列表(list)：如 [1, 2, 3]\n• 字典(dict)：如 {"name": "Alice", "age": 20}\n\n【运算符】\n• 算术运算符：+, -, *, /, //, %, **\n• 比较运算符：==, !=, <, >, <=, >=\n• 逻辑运算符：and, or, not\n\n【控制结构】\n条件语句：if-elif-else\n循环语句：for循环、while循环\n\n【实战练习】\n编写一个计算器程序，实现加减乘除运算',
    isCompleted: true,
    completedAt: new Date('2024-09-15').toISOString(),
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
      },
      {
        id: 'ex-2-2',
        type: 'code',
        question: '计算1+2+3+...+100的和',
        codeTemplate: '# 使用循环计算\ntotal = 0\nfor i in range(1, 101):\n    pass  # 删除pass并填入代码\nprint(total)',
        answer: 'total = 0\nfor i in range(1, 101):\n    total += i\nprint(total)',
        explanation: '使用for循环配合range(1, 101)遍历1到100，并累加到total变量中。'
      }
    ]
  },
  {
    id: 'chapter-3',
    courseId: 'course-1',
    title: '函数与模块',
    content: '函数定义、参数传递、返回值、模块导入等。\n\n【函数基础】\n函数是组织代码的基本单元，可以提高代码的复用性和可读性。\n\ndef 函数名(参数):\n    """函数文档字符串"""\n    函数体\n    return 返回值\n\n【参数类型】\n• 位置参数：按顺序传递\n• 关键字参数：指定参数名传递\n• 默认参数：提供默认值\n• 可变参数：*args, **kwargs\n\n【模块】\n模块是包含Python代码的文件，使用import语句导入。\n\nimport 模块名\nfrom 模块名 import 函数名\n\n【常用标准库】\n• os：操作系统相关功能\n• sys：系统相关参数\n• datetime：日期时间处理\n• json：JSON数据处理\n• random：随机数生成\n\n【实战练习】\n创建一个计算矩形面积的函数，并使用模块化管理',
    isCompleted: true,
    completedAt: new Date('2024-09-25').toISOString(),
    studyDurationMinutes: 75,
    keyPoints: ['函数的定义和调用', '四种参数类型', '模块的导入和使用', '创建自定义模块'],
    exercises: [
      {
        id: 'ex-3-1',
        type: 'choice',
        question: 'Python中导入模块的正确方式是？',
        options: ['import os', 'include os', 'using os', 'import "os"'],
        answer: 0,
        explanation: 'Python使用import关键字导入模块，语法为：import 模块名'
      },
      {
        id: 'ex-3-2',
        type: 'code',
        question: '编写一个函数，接收两个参数a和b，返回它们的和、差、积',
        codeTemplate: 'def calculate(a, b):\n    # 返回三个值：和、差、积\n    return sum, diff, product\n\n# 测试\nresult = calculate(10, 5)\nprint(f"和: {result[0]}, 差: {result[1]}, 积: {result[2]}")',
        answer: 'def calculate(a, b):\n    return a+b, a-b, a*b',
        explanation: '函数可以返回多个值（实际上是返回一个元组），使用return语句返回。'
      }
    ]
  },
  {
    id: 'chapter-4',
    courseId: 'course-1',
    title: '面向对象编程',
    content: '类、对象、继承、多态等面向对象编程概念。\n\n【面向对象基础】\n面向对象编程(OOP)是一种编程范式，通过"类"和"对象"来组织代码。\n\n• 类(Class)：抽象的模板，定义对象的属性和方法\n• 对象(Object)：类的实例，具有具体的属性值\n\n【类的定义】\nclass 类名:\n    def __init__(self, 参数):\n        self.属性 = 参数\n    \n    def 方法(self):\n        方法体\n\n【三大特性】\n1. 封装：隐藏内部细节，对外提供接口\n2. 继承：子类继承父类的属性和方法\n3. 多态：不同对象对同一消息的不同响应\n\n【实战练习】\n创建一个学生类，包含姓名、学号、成绩等属性，以及选课、计算平均成绩等方法',
    isCompleted: false,
    keyPoints: ['类和对象的概念', '__init__构造函数', '实例属性和类属性', '继承和方法重写', '多态的实现'],
    exercises: [
      {
        id: 'ex-4-1',
        type: 'choice',
        question: '在类中，__init__方法的作用是？',
        options: ['类的析构函数', '类的构造函数，初始化对象属性', '类的普通方法', '类的静态方法'],
        answer: 1,
        explanation: '__init__是Python类的构造函数，在创建对象时自动调用，用于初始化对象的属性。'
      },
      {
        id: 'ex-4-2',
        type: 'code',
        question: '创建一个Dog类，有名字和年龄属性，以及bark方法',
        codeTemplate: 'class Dog:\n    def __init__(self, name, age):\n        pass\n    \n    def bark(self):\n        return "汪汪！"\n\n# 测试\nmy_dog = Dog("小白", 3)\nprint(f"{my_dog.name}叫: {my_dog.bark()}")',
        answer: 'class Dog:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age\n    \n    def bark(self):\n        return "汪汪！"',
        explanation: '在__init__中使用self.属性名来存储传入的参数，这样每个对象都有自己独立的属性。'
      }
    ]
  },
  
  // 数据分析技术课程章节
  {
    id: 'chapter-5',
    courseId: 'course-2',
    title: '数据分析概述',
    content: '数据分析的概念、流程和常用工具介绍。\n\n【什么是数据分析】\n数据分析是用适当的统计分析方法对收集来的大量数据进行分析，将它们加以汇总和理解并消化，以求最大化地开发数据的功能，发挥数据的作用。\n\n【数据分析流程】\n1. 明确问题：确定分析目标和问题\n2. 数据收集：从各种来源获取数据\n3. 数据清洗：处理缺失值、异常值、重复值\n4. 数据探索：描述性统计、可视化探索\n5. 数据建模：建立预测或分类模型\n6. 结果呈现：可视化展示、报告撰写\n\n【常用工具】\n• Excel：基础数据分析\n• Python：Pandas, NumPy, SciPy\n• SQL：数据查询和处理\n• Tableau/Power BI：数据可视化\n• SPSS/SAS：统计分析和建模\n\n【初学者建议】\n从Excel和Python Pandas开始，掌握基本的数据操作后再学习高级分析技术',
    isCompleted: true,
    completedAt: new Date('2024-09-20').toISOString(),
    studyDurationMinutes: 45,
    keyPoints: ['数据分析的定义和价值', '完整的数据分析流程', '各阶段的核心任务', '常用数据分析工具'],
    exercises: [
      {
        id: 'ex-5-1',
        type: 'choice',
        question: '数据分析流程的第一步是什么？',
        options: ['数据收集', '数据清洗', '明确分析目的', '数据可视化'],
        answer: 2,
        explanation: '数据分析的第一步是明确分析目的，只有清楚了要解决的问题，才能有针对性地进行后续的数据收集和分析工作。'
      },
      {
        id: 'ex-5-2',
        type: 'choice',
        question: '下列哪个不是Python数据分析常用的库？',
        options: ['Pandas', 'NumPy', 'Django', 'Matplotlib'],
        answer: 2,
        explanation: 'Django是Web开发框架，不是数据分析库。Pandas和NumPy是数据处理的基础库，Matplotlib用于数据可视化。'
      }
    ]
  },
  {
    id: 'chapter-6',
    courseId: 'course-2',
    title: '数据清洗与预处理',
    content: '数据质量评估、缺失值处理、异常值检测等。\n\n【数据质量评估】\n在进行数据分析前，需要评估数据质量：\n• 完整性：是否有缺失值\n• 一致性：数据格式是否统一\n• 准确性：数据是否真实可靠\n• 时效性：数据是否在有效期内\n\n【缺失值处理】\n方法1：删除法\n• 删除包含缺失值的行或列\n• 适用于缺失值较少的情况\n\n方法2：填充法\n• 均值填充：适用于数值型数据\n• 中位数填充：不受极端值影响\n• 众数填充：适用于分类数据\n• 前后值填充/插值法\n\n方法3：保留并标记\n• 不填充，标记为缺失\n• 适用于缺失有规律的情况\n\n【异常值检测】\n• 3σ原则：数据在μ±3σ之外为异常\n• IQR方法：Q1-1.5*IQR到Q3+1.5*IQR之外为异常\n• 可视化方法：箱线图、散点图\n\n【数据转换】\n• 数据类型转换\n• 数据标准化/归一化\n• 编码分类变量',
    isCompleted: true,
    completedAt: new Date('2024-10-05').toISOString(),
    studyDurationMinutes: 90,
    keyPoints: ['评估数据质量的四个维度', '三种缺失值处理方法', '两种异常值检测方法', '数据标准化和归一化'],
    exercises: [
      {
        id: 'ex-6-1',
        type: 'choice',
        question: '使用均值填充缺失值的优点是？',
        options: ['计算简单', '不受异常值影响', '保持数据总量不变', '以上都是'],
        answer: 3,
        explanation: '均值填充计算简单，且保持了数据的总量不变（当用均值填充多个相同缺失时）。但需要注意均值会受异常值影响。'
      },
      {
        id: 'ex-6-2',
        type: 'code',
        question: '使用Pandas填充DataFrame中的缺失值为0',
        codeTemplate: 'import pandas as pd\nimport numpy as np\n\ndf = pd.DataFrame({\n    "A": [1, 2, np.nan, 4],\n    "B": [5, np.nan, 7, 8]\n})\n\n# 填充缺失值为0\ndf_filled = ___  # 请填写代码\nprint(df_filled)',
        answer: 'df.fillna(0)',
        explanation: '使用fillna()方法可以填充缺失值，传入0表示用0填充所有缺失值。'
      }
    ]
  },
  {
    id: 'chapter-7',
    courseId: 'course-2',
    title: '数据可视化',
    content: '使用Python库进行数据可视化的方法和技巧。\n\n【为什么需要数据可视化】\n• 直观展示数据规律和趋势\n• 帮助发现数据中的异常\n• 让非技术人员理解数据\n• 支持决策和报告呈现\n\n【常用可视化类型】\n1. 折线图：展示趋势变化\n2. 柱状图：比较不同类别\n3. 饼图：展示占比构成\n4. 散点图：展示两个变量关系\n5. 直方图：展示数据分布\n6. 箱线图：展示统计特征\n\n【Matplotlib基础】\nimport matplotlib.pyplot as plt\n\nplt.figure(figsize=(10, 6))\nplt.plot(x, y)\nplt.title(\'标题\')\nplt.xlabel(\'X轴标签\')\nplt.ylabel(\'Y轴标签\')\nplt.show()\n\n【Seaborn进阶】\nSeaborn基于Matplotlib，提供更美观的默认样式\nimport seaborn as sns\n\nsns.barplot(x=\'category\', y=\'value\', data=df)\nsns.scatterplot(x=\'x\', y=\'y\', hue=\'label\', data=df)\n\n【实战技巧】\n• 选择合适的图表类型\n• 配色要清晰易读\n• 添加必要的标签和图例\n• 避免3D图表（扭曲数据）',
    isCompleted: false,
    keyPoints: ['选择合适的可视化类型', 'Matplotlib基本语法', 'Seaborn的常用图表', '图表优化的技巧'],
    exercises: [
      {
        id: 'ex-7-1',
        type: 'choice',
        question: '如果要展示某个公司一年内的营收变化趋势，应该使用什么图表？',
        options: ['饼图', '折线图', '柱状图', '散点图'],
        answer: 1,
        explanation: '折线图最适合展示数据随时间变化的趋势，营收变化是典型的时间序列数据。'
      },
      {
        id: 'ex-7-2',
        type: 'code',
        question: '使用Matplotlib绘制一个简单的柱状图',
        codeTemplate: 'import matplotlib.pyplot as plt\n\ncategories = ["Python", "Java", "C++", "JavaScript"]\nvalues = [40, 30, 20, 10]\n\n# 绘制柱状图\nplt.___(categories, values)  # 填写函数名\nplt.title("编程语言使用占比")\nplt.show()',
        answer: 'plt.bar',
        explanation: 'plt.bar()函数用于绘制柱状图，第一个参数是类别，第二个参数是对应的数值。'
      }
    ]
  },
  
  // 数据采集与处理课程章节
  {
    id: 'chapter-8',
    courseId: 'course-3',
    title: '网络爬虫基础',
    content: 'HTTP协议、HTML解析、爬虫原理等基础知识。\n\n【HTTP协议基础】\nHTTP（超文本传输协议）是浏览器和服务器之间通信的基础。\n\n• GET请求：获取资源\n• POST请求：提交数据\n• 请求头：User-Agent, Cookie等\n• 响应状态码：200成功、404未找到、403禁止访问\n\n【网页结构】\n• HTML：网页的结构\n• CSS：网页的样式\n• JavaScript：网页的交互\n\n【爬虫原理】\n1. 发送HTTP请求获取网页\n2. 解析HTML提取数据\n3. 存储或处理数据\n\n【robots.txt协议】\n爬虫应该遵守网站的robots.txt规则，查看哪些页面可以爬取。\n\n【法律和伦理】\n• 不要爬取个人信息\n• 控制请求频率\n• 遵守网站的使用条款\n• 仅爬取公开数据\n\n【常用工具】\n• Requests：发送HTTP请求\n• BeautifulSoup：解析HTML\n• Selenium：处理JavaScript渲染\n• Scrapy：专业爬虫框架',
    isCompleted: true,
    completedAt: new Date('2024-10-03').toISOString(),
    studyDurationMinutes: 60,
    keyPoints: ['HTTP协议的基本原理', 'GET和POST请求的区别', 'HTML文档结构', '爬虫的法律和伦理规范'],
    exercises: [
      {
        id: 'ex-8-1',
        type: 'choice',
        question: 'HTTP协议中，GET请求和POST请求的主要区别是？',
        options: ['GET请求更安全', 'POST请求可以将数据发送到服务器', 'GET请求不能带参数', 'POST请求不能带参数'],
        answer: 1,
        explanation: 'POST请求可以将数据放在请求体中发送到服务器，常用于表单提交。GET请求的参数在URL中，有长度限制。'
      },
      {
        id: 'ex-8-2',
        type: 'choice',
        question: '关于网络爬虫的说法，正确的是？',
        options: ['可以爬取任何网站的数据', '应该遵守robots.txt协议', '不需要考虑请求频率', '可以爬取个人信息'],
        answer: 1,
        explanation: '爬虫应该遵守网站的robots.txt协议，尊重网站的爬取规则，控制请求频率，并且不应该爬取个人信息。'
      }
    ]
  },
  {
    id: 'chapter-9',
    courseId: 'course-3',
    title: '使用Python进行数据采集',
    content: 'requests、BeautifulSoup、Scrapy等库的使用。\n\n【Requests库】\n最常用的HTTP库，用于发送各种HTTP请求。\n\nimport requests\n\nresponse = requests.get(url)\nresponse.status_code  # 状态码\nresponse.text  # 响应内容\nresponse.json()  # JSON响应\n\n【BeautifulSoup解析】\n用于从HTML中提取需要的数据。\n\nfrom bs4 import BeautifulSoup\n\nsoup = BeautifulSoup(html, "lxml")\ntitles = soup.find_all("h2", class_="title")\ncontent = soup.select(".article .text")\n\n【CSS选择器】\n• tag：标签选择器\n• .class：类选择器\n• #id：ID选择器\n• tag.class：组合选择器\n\n【数据存储】\n• CSV文件：使用Pandas的to_csv()\n• Excel文件：使用Pandas的to_excel()\n• 数据库：使用SQLAlchemy\n• JSON文件：使用json模块\n\n【实战项目】\n爬取豆瓣电影Top250的电影信息，包括：\n• 电影名称\n• 评分\n• 评论数\n• 上映年份\n• 导演和演员',
    isCompleted: false,
    keyPoints: ['Requests发送HTTP请求', 'BeautifulSoup解析HTML', 'CSS选择器的使用', '数据存储方法'],
    exercises: [
      {
        id: 'ex-9-1',
        type: 'code',
        question: '使用requests库获取网页内容',
        codeTemplate: 'import requests\n\nurl = "https://www.example.com"\n\n# 发送GET请求\nresponse = requests.___(url)  # 填写方法名\n\n# 打印状态码和内容长度\nprint(response.___)  # 填写属性名\nprint(len(response.text))',
        answer: 'get\nstatus_code',
        explanation: 'requests.get()用于发送GET请求，response.status_code返回HTTP状态码。'
      },
      {
        id: 'ex-9-2',
        type: 'choice',
        question: 'BeautifulSoup中，使用哪个解析器解析HTML最常用？',
        options: ['html.parser', 'lxml', 'html5lib', 'xml'],
        answer: 1,
        explanation: 'lxml解析器速度快且容错性好，是实际项目中最常用的选择。html.parser是Python内置解析器，不需要额外安装。'
      }
    ]
  },
  
  // 供应链数据分析课程章节
  {
    id: 'chapter-10',
    courseId: 'course-4',
    title: '供应链管理概述',
    content: '供应链的概念、结构和管理方法。\n\n【什么是供应链】\n供应链是将产品或服务从供应商传递到消费者的完整流程，包括：\n• 供应商 → 制造商 → 分销商 → 零售商 → 消费者\n\n【供应链管理的目标】\n1. 降低成本\n2. 提高效率\n3. 减少库存\n4. 加快响应速度\n5. 提升客户满意度\n\n【供应链中的数据】\n• 采购数据：供应商信息、采购价格、采购量\n• 库存数据：库存水平、库龄、呆滞料\n• 销售数据：订单量、销售额、客户分布\n• 物流数据：配送时间、运输成本、退货率\n\n【数据分析在供应链中的应用】\n1. 需求预测：预测未来销售\n2. 库存优化：确定最佳库存水平\n3. 供应商评估：选择和管理供应商\n4. 物流优化：提高配送效率\n5. 成本分析：识别成本节约机会\n\n【常用分析指标】\n• 库存周转率\n• 订单履行率\n• 准时交货率\n• 客户满意度',
    isCompleted: true,
    completedAt: new Date('2024-10-06').toISOString(),
    studyDurationMinutes: 45,
    keyPoints: ['供应链的基本概念', '供应链管理的目标', '供应链中的数据类型', '数据分析在供应链中的应用'],
    exercises: [
      {
        id: 'ex-10-1',
        type: 'choice',
        question: '供应链管理的主要目标不包括？',
        options: ['降低成本', '提高服务质量', '增加员工数量', '加快响应速度'],
        answer: 2,
        explanation: '供应链管理的目标包括降低成本、提高效率、减少库存、加快响应速度和提升客户满意度，与员工数量无关。'
      },
      {
        id: 'ex-10-2',
        type: 'choice',
        question: '下列哪个不是供应链中的常用数据？',
        options: ['采购数据', '员工考勤数据', '库存数据', '物流数据'],
        answer: 1,
        explanation: '供应链数据分析主要关注采购、库存、销售、物流等数据，员工考勤属于人力资源数据，不是供应链数据。'
      }
    ]
  },
  
  // 数据库原理与应用课程章节
  {
    id: 'chapter-11',
    courseId: 'course-5',
    title: '数据库基础概念',
    content: '数据库的定义、类型、特点和应用场景。\n\n【什么是数据库】\n数据库是按照数据结构来组织、存储和管理数据的仓库。\n\n【数据库的发展】\n• 层次数据库\n• 网状数据库\n• 关系数据库（主流）\n• NoSQL数据库（新型）\n\n【关系型数据库】\n以表格的形式存储数据，表与表之间通过外键关联。\n\n特点：\n• 数据以行和列存储\n• 表之间可以建立关系\n• 支持SQL查询语言\n• 事务支持（ACID）\n\n代表产品：\n• MySQL（开源、应用广泛）\n• PostgreSQL（功能强大）\n• Oracle（企业级）\n• SQL Server（微软）\n\n【NoSQL数据库】\n非关系型数据库，适合大数据场景。\n\n类型：\n• 键值数据库：Redis\n• 文档数据库：MongoDB\n• 列族数据库：HBase\n• 图数据库：Neo4j\n\n【如何选择】\n• 结构化数据、事务需求：关系型\n• 高并发、大数据：NoSQL\n• 复杂查询、报表：数据仓库',
    isCompleted: true,
    completedAt: new Date('2024-09-25').toISOString(),
    studyDurationMinutes: 60,
    keyPoints: ['关系型数据库的特点', '主流关系型数据库', 'NoSQL数据库类型', '根据场景选择数据库'],
    exercises: [
      {
        id: 'ex-11-1',
        type: 'choice',
        question: 'MySQL属于哪种类型的数据库？',
        options: ['层次数据库', '关系型数据库', '文档数据库', '图数据库'],
        answer: 1,
        explanation: 'MySQL是典型的关系型数据库，使用表格形式存储数据，通过SQL进行查询。'
      },
      {
        id: 'ex-11-2',
        type: 'choice',
        question: '下列哪个不属于NoSQL数据库？',
        options: ['Redis', 'MongoDB', 'MySQL', 'HBase'],
        answer: 2,
        explanation: 'MySQL是关系型数据库。Redis是键值数据库，MongoDB是文档数据库，HBase是列族数据库，它们都属于NoSQL数据库。'
      }
    ]
  },
  {
    id: 'chapter-12',
    courseId: 'course-5',
    title: 'SQL基础',
    content: 'SQL语句的基本语法、查询、插入、更新和删除操作。\n\n【SQL是什么】\nSQL（结构化查询语言）是操作关系型数据库的标准语言。\n\n【基本SQL语句】\n\n1. 查询数据（SELECT）\nSELECT 列名 FROM 表名 WHERE 条件;\n\nSELECT * FROM students;\nSELECT name, age FROM students WHERE age > 20;\n\n2. 插入数据（INSERT）\nINSERT INTO 表名(列1, 列2) VALUES (值1, 值2);\n\nINSERT INTO students(name, age) VALUES (\'张三\', 21);\n\n3. 更新数据（UPDATE）\nUPDATE 表名 SET 列=值 WHERE 条件;\n\nUPDATE students SET age=22 WHERE name=\'张三\';\n\n4. 删除数据（DELETE）\nDELETE FROM 表名 WHERE 条件;\n\nDELETE FROM students WHERE age < 18;\n\n【常用子句】\n• ORDER BY：排序\n• GROUP BY：分组\n• HAVING：分组后筛选\n• JOIN：连接表\n• LIMIT：限制返回条数\n\n【实战练习】\n创建学生成绩管理系统，实现：\n• 学生信息管理\n• 成绩录入\n• 成绩查询统计',
    isCompleted: true,
    completedAt: new Date('2024-10-08').toISOString(),
    studyDurationMinutes: 90,
    keyPoints: ['SELECT查询语句', 'INSERT插入数据', 'UPDATE更新数据', 'DELETE删除数据', 'ORDER BY和GROUP BY'],
    exercises: [
      {
        id: 'ex-12-1',
        type: 'code',
        question: '查询年龄大于20岁的学生姓名',
        codeTemplate: '-- 表名: students\n-- 列: id, name, age\n\nSELECT name \nFROM students \nWHERE ___  -- 填写条件',
        answer: 'age > 20',
        explanation: '使用WHERE子句指定查询条件，筛选出年龄大于20的学生。'
      },
      {
        id: 'ex-12-2',
        type: 'choice',
        question: '下列哪个SQL语句用于修改已有数据？',
        options: ['INSERT', 'UPDATE', 'DELETE', 'SELECT'],
        answer: 1,
        explanation: 'UPDATE语句用于修改表中已有的数据，INSERT用于插入新数据，DELETE用于删除数据，SELECT用于查询数据。'
      }
    ]
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
  },
  {
    id: 'note-2',
    courseId: 'course-1',
    chapterId: 'chapter-2',
    title: 'Python数据类型总结',
    content: '基本数据类型：int, float, str, bool\n容器类型：list, tuple, dict, set\n类型转换：int(), float(), str()等',
    createdAt: new Date('2024-09-16').toISOString(),
    updatedAt: new Date('2024-09-16').toISOString()
  },
  {
    id: 'note-3',
    courseId: 'course-2',
    chapterId: 'chapter-5',
    title: '数据分析流程',
    content: '1. 问题定义\n2. 数据收集\n3. 数据清洗\n4. 数据分析\n5. 数据可视化\n6. 结果报告',
    createdAt: new Date('2024-09-21').toISOString(),
    updatedAt: new Date('2024-09-21').toISOString()
  },
  {
    id: 'note-4',
    courseId: 'course-5',
    chapterId: 'chapter-12',
    title: 'SQL基本语句',
    content: 'SELECT: 查询数据\nINSERT: 插入数据\nUPDATE: 更新数据\nDELETE: 删除数据\nCREATE TABLE: 创建表',
    createdAt: new Date('2024-10-09').toISOString(),
    updatedAt: new Date('2024-10-09').toISOString()
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
  },
  {
    id: 'record-3',
    courseId: 'course-3',
    durationMinutes: 75,
    date: new Date(today.setDate(today.getDate() - 1)).toISOString()
  },
  {
    id: 'record-4',
    courseId: 'course-5',
    durationMinutes: 90,
    date: new Date(today.setDate(today.getDate() - 1)).toISOString()
  },
  {
    id: 'record-5',
    courseId: 'course-1',
    durationMinutes: 45,
    date: new Date(today.setDate(today.getDate() - 2)).toISOString()
  },
  {
    id: 'record-6',
    courseId: 'course-4',
    durationMinutes: 60,
    date: new Date(today.setDate(today.getDate() - 2)).toISOString()
  },
  {
    id: 'record-7',
    courseId: 'course-2',
    durationMinutes: 120,
    date: new Date(today.setDate(today.getDate() - 3)).toISOString()
  },
  {
    id: 'record-8',
    courseId: 'course-5',
    durationMinutes: 75,
    date: new Date(today.setDate(today.getDate() - 4)).toISOString()
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

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useAppStore = create<AppState>((set, get) => {
  const initialState = loadState();
  
  const baseState = {
    courses: initialState?.courses || mockCourses,
    chapters: initialState?.chapters || mockChapters,
    notes: initialState?.notes || mockNotes,
    studyRecords: initialState?.studyRecords || mockStudyRecords,
    todayGoals: initialState?.todayGoals || mockTodayGoals
  };
  
  const saveCurrentState = () => {
    const state = get();
    saveState({
      courses: state.courses,
      chapters: state.chapters,
      notes: state.notes,
      studyRecords: state.studyRecords,
      todayGoals: state.todayGoals
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
