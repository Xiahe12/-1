import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Code2, Lightbulb } from 'lucide-react';
import PythonRunner from '../components/PythonRunner';

const dataAnalysisProjects = [
  {
    id: 'project-1',
    chapterId: 'chapter-3',
    title: '电商订单数据清洗与标准化',
    description: '处理乱码日期、负价格、空值等脏数据，为AI模型提供干净数据',
    difficulty: '基础',
    skills: ['Pandas', '数据清洗', '异常值处理', '日期解析'],
    initialCode: `import pandas as pd
import numpy as np
from datetime import datetime

# 创建模拟脏数据
df = pd.DataFrame({
    'order_id': range(1, 11),
    'order_date': ['2023-01-01', '01/15/2023', '2023-02-30', '2023-03-01', 
                   '04-20-2023', '2023.05.10', '', '2023-06-01', '2023-07-01', '2023-07-01'],
    'price': [100, -50, 200, 150, 300, 250, 180, -20, np.nan, 200],
    'quantity': [2, 1, np.nan, 4, 1, 3, 2, 5, 3, 2]
})
print("原始数据：")
print(df)
print()

# 1. 日期统一化处理
def parse_mixed_date(date_str):
    """处理多种日期格式"""
    if pd.isna(date_str) or str(date_str).strip() == '':
        return pd.NaT
    date_str = str(date_str).strip()
    formats = ['%Y-%m-%d', '%m/%d/%Y', '%m-%d-%Y', '%Y.%m.%d', '%d-%m-%Y']
    for fmt in formats:
        try:
            return pd.to_datetime(date_str, format=fmt)
        except:
            continue
    return pd.NaT

df['order_date_clean'] = df['order_date'].apply(parse_mixed_date)

# 2. 异常价格处理
# 过滤负价格
df.loc[df['price'] < 0, 'price'] = np.nan
# 用中位数填充缺失价格
price_median = df['price'].median()
df['price'].fillna(price_median, inplace=True)

# 3. 数量异常处理
# 用中位数填充
qty_median = df['quantity'].median()
df['quantity'].fillna(qty_median, inplace=True)

# 4. 删除日期解析失败和重复行
df.drop_duplicates(inplace=True)
df = df.dropna(subset=['order_date_clean'])

print("\\n清洗后数据：")
print(df[['order_id', 'order_date_clean', 'price', 'quantity']])
print(f"\\n清洗前记录数: 10, 清洗后记录数: {len(df)}")
print(f"价格中位数: {price_median:.2f}, 数量中位数: {qty_median:.2f}")
`,
    tips: ['注意：使用pandas处理数据时，要注意数据类型转换', '清洗数据时要记录每个步骤的处理逻辑', '使用中位数填充缺失值可以避免异常值的影响']
  },
  {
    id: 'project-2',
    chapterId: 'chapter-4',
    title: '用户行为日志解析与Session构建',
    description: '从埋点日志构建用户会话序列，为AI推荐系统提供结构化输入',
    difficulty: '基础',
    skills: ['Session分析', '时间序列', '用户路径', '会话切分'],
    initialCode: `import pandas as pd
import numpy as np

# 模拟用户行为日志
np.random.seed(42)
users = np.repeat(range(1, 6), 5)
timestamps = pd.date_range('2024-01-01 09:00', periods=25, freq='8min')
events = np.random.choice(['page_view', 'add_cart', 'purchase'], 25)

df_log = pd.DataFrame({
    'user_id': users,
    'timestamp': timestamps,
    'event_type': events
}).sort_values(['user_id', 'timestamp']).reset_index(drop=True)

print("原始行为日志：")
print(df_log)
print()

# 构建Session
# 计算同一用户前后操作的时间差（分钟）
df_log['time_diff'] = df_log.groupby('user_id')['timestamp'].diff().dt.total_seconds() / 60
df_log['time_diff'].fillna(0, inplace=True)

# 设定30分钟超时阈值，生成新session标记
SESSION_TIMEOUT = 30
df_log['new_session'] = (df_log['time_diff'] > SESSION_TIMEOUT).astype(int)

# 生成session_id
df_log['session_id'] = df_log.groupby('user_id')['new_session'].cumsum()
df_log['session_id'] = df_log['user_id'].astype(str) + '_' + df_log['session_id'].astype(str)

# 聚合session特征
session_features = df_log.groupby('session_id').agg(
    user_id=('user_id', 'first'),
    start_time=('timestamp', 'min'),
    end_time=('timestamp', 'max'),
    event_count=('event_type', 'count'),
    has_purchase=('event_type', lambda x: (x == 'purchase').any())
).reset_index()

session_features['duration_min'] = (session_features['end_time'] - session_features['start_time']).dt.total_seconds() / 60

print("\\nSession特征表：")
print(session_features)
print(f"\\n总Session数: {len(session_features)}, 含购买行为的Session: {session_features['has_purchase'].sum()}")
`,
    tips: ['Session分析是理解用户行为的关键', '30分钟是常用的会话超时阈值', '可以根据业务需求调整超时时间']
  },
  {
    id: 'project-3',
    chapterId: 'chapter-5',
    title: '销售数据的多维度探索性分析（EDA）',
    description: '直观理解销售规律，为预测建模打基础',
    difficulty: '基础',
    skills: ['Pandas', '透视表', '统计摘要', '数据可视化'],
    initialCode: `import pandas as pd
import numpy as np

# 模拟销售数据
np.random.seed(42)
dates = pd.date_range('2024-01-01', '2024-06-30', freq='D')
categories = ['电子产品', '服装', '食品', '家居']

data = []
for date in dates:
    for cat in categories:
        base_sales = np.random.poisson(
            lam={'电子产品': 50, '服装': 80, '食品': 120, '家居': 40}[cat]
        )
        if date.dayofweek >= 5:  # 周末效应
            base_sales = int(base_sales * 1.3)
        data.append({'date': date, 'category': cat, 'sales_amount': base_sales})

df_sales = pd.DataFrame(data)
print("销售数据预览：")
print(df_sales.head(10))
print()

# 1. 月度销售汇总
df_sales['month'] = df_sales['date'].dt.month
monthly_sales = df_sales.groupby(['month', 'category'])['sales_amount'].sum().unstack()
print("月度销售额汇总（透视表）：")
print(monthly_sales)
print()

# 2. 品类总体占比
category_total = df_sales.groupby('category')['sales_amount'].sum()
category_pct = (category_total / category_total.sum() * 100).sort_values(ascending=False)
print("品类销售占比：")
for cat, pct in category_pct.items():
    print(f"  {cat}: {pct:.1f}%")
print()

# 3. 周末vs工作日分析
df_sales['is_weekend'] = df_sales['date'].dt.dayofweek >= 5
weekend_comparison = df_sales.groupby('is_weekend')['sales_amount'].mean()
print(f"工作日日均销售: {weekend_comparison[False]:.1f}")
print(f"周末日均销售: {weekend_comparison[True]:.1f}")
print(f"周末提升幅度: {((weekend_comparison[True] - weekend_comparison[False]) / weekend_comparison[False] * 100):.1f}%")
print()

# 4. 销售波动分析
daily_total = df_sales.groupby('date')['sales_amount'].sum()
print(f"日销售额统计: 均值={daily_total.mean():.1f}, 标准差={daily_total.std():.1f}")
print(f"最高日: {daily_total.idxmax().strftime('%Y-%m-%d')} ({daily_total.max()}), 最低日: {daily_total.idxmin().strftime('%Y-%m-%d')} ({daily_total.min()})")
`,
    tips: ['EDA是数据分析的第一步', '使用透视表可以快速了解数据', '周末效应在零售数据中很常见']
  },
  {
    id: 'project-4',
    chapterId: 'chapter-6',
    title: '购物车分析——商品关联规则挖掘',
    description: '经典的"啤酒与尿布"分析，通过Apriori算法挖掘捆绑推荐规则',
    difficulty: '进阶',
    skills: ['Apriori', '关联规则', '共现分析', '提升度'],
    initialCode: `import pandas as pd
import numpy as np
from itertools import combinations

# 模拟购物车数据
np.random.seed(42)
transactions = []
patterns = [
    ['牛奶', '面包'], ['牛奶', '面包', '黄油'],
    ['手机壳', '钢化膜'], ['啤酒', '花生'],
    ['洗发水', '沐浴露'], ['咖啡', '咖啡伴侣'],
]

for i in range(50):
    base = patterns[np.random.randint(0, len(patterns))]
    extra = np.random.choice(['牙膏', '毛巾', '垃圾袋'], size=np.random.randint(0, 3), replace=False)
    items = base + list(extra)
    transactions.append(','.join(items))

df_cart = pd.DataFrame({'order_id': range(1, 51), 'items': transactions})
print("购物车数据预览：")
print(df_cart.head(10))
print()

# 将商品拆分为多行
df_exploded = df_cart.assign(item=df_cart['items'].str.split(',')).explode('item')
total_orders = df_exploded['order_id'].nunique()

# 计算每个商品的支持度
item_support = df_exploded.groupby('item')['order_id'].nunique() / total_orders
print("商品支持度（出现概率）：")
print(item_support.sort_values(ascending=False))
print()

# 计算商品对的共现频率（简化版关联规则）
pair_counts = {}
for order_id, group in df_exploded.groupby('order_id'):
    items_in_order = group['item'].tolist()
    for item1, item2 in combinations(sorted(set(items_in_order)), 2):
        pair = (item1, item2)
        pair_counts[pair] = pair_counts.get(pair, 0) + 1

# 计算支持度、置信度、提升度
print("商品关联规则（Top 10）：")
print(f"{'规则':<30} {'支持度':>8} {'置信度':>8} {'提升度':>8}")
print("-" * 60)

for (item_a, item_b), co_count in sorted(pair_counts.items(), key=lambda x: x[1], reverse=True)[:10]:
    support = co_count / total_orders
    support_a = item_support[item_a]
    confidence_a_to_b = support / support_a
    lift = support / (support_a * item_support[item_b])
    print(f"{item_a} -> {item_b:<20} {support:.3f}   {confidence_a_to_b:.3f}   {lift:.3f}")

print()
print("强关联规则（提升度>1.5）：")
for (item_a, item_b), co_count in pair_counts.items():
    support = co_count / total_orders
    lift = support / (item_support[item_a] * item_support[item_b])
    if lift > 1.5:
        print(f"  {item_a} + {item_b}: 提升度={lift:.2f}, 建议捆绑推荐")
`,
    tips: ['提升度>1表示有正相关性', '经典的"啤酒与尿布"就是关联规则的典型案例', '关联规则广泛用于电商推荐系统']
  },
  {
    id: 'project-5',
    chapterId: 'chapter-7',
    title: '基于RFM模型的用户价值分层',
    description: '精细化运营的核心，为AI营销策略提供特征输入',
    difficulty: '进阶',
    skills: ['RFM模型', '用户分层', '价值分析', '运营策略'],
    initialCode: `import pandas as pd
import numpy as np

# 模拟用户购买数据
np.random.seed(42)
n_records = 200
user_ids = np.random.randint(1, 31, n_records)
dates = pd.date_range('2024-01-01', '2024-06-30', freq='D')
order_dates = np.random.choice(dates, n_records)
amounts = np.random.exponential(scale=100, size=n_records) + 20

df_purchase = pd.DataFrame({
    'user_id': user_ids,
    'order_date': order_dates,
    'amount': np.round(amounts, 2)
}).sort_values('order_date')

print("用户购买数据预览：")
print(df_purchase.head(10))
print()

# 计算RFM
REFERENCE_DATE = df_purchase['order_date'].max() + pd.Timedelta(days=1)

rfm = df_purchase.groupby('user_id').agg(
    Recency=('order_date', lambda x: (REFERENCE_DATE - x.max()).days),
    Frequency=('order_date', 'count'),
    Monetary=('amount', 'sum')
).reset_index()

print("RFM原始值：")
print(rfm.head(10))
print()

# RFM打分（1-5分）
# 注意：Recency越小越好，Frequency和Monetary越大越好
rfm['R_score'] = pd.qcut(rfm['Recency'], q=5, labels=[5, 4, 3, 2, 1]).astype(int)
rfm['F_score'] = pd.qcut(rfm['Frequency'].rank(method='first'), q=5, labels=[1, 2, 3, 4, 5]).astype(int)
rfm['M_score'] = pd.qcut(rfm['Monetary'].rank(method='first'), q=5, labels=[1, 2, 3, 4, 5]).astype(int)

# 拼接RFM标签
rfm['RFM_label'] = rfm['R_score'].astype(str) + rfm['F_score'].astype(str) + rfm['M_score'].astype(str)

# 用户分层定义
def classify_user(row):
    """根据RFM总分进行分层"""
    total = row['R_score'] + row['F_score'] + row['M_score']
    if total >= 12:
        return '重要价值客户'
    elif total >= 9:
        return '重要发展客户'
    elif total >= 6:
        return '一般客户'
    else:
        return '流失客户'

rfm['segment'] = rfm.apply(classify_user, axis=1)

print("RFM分层结果：")
print(rfm[['user_id', 'Recency', 'Frequency', 'Monetary', 'RFM_label', 'segment']].head(10))
print()

# 分层统计
segment_stats = rfm.groupby('segment').agg(
    用户数=('user_id', 'count'),
    平均消费金额=('Monetary', 'mean'),
    总消费金额=('Monetary', 'sum'),
    平均购买次数=('Frequency', 'mean')
).round(2)

segment_stats['金额占比'] = (segment_stats['总消费金额'] / segment_stats['总消费金额'].sum() * 100).round(1)
print("用户分层统计：")
print(segment_stats)
`,
    tips: ['RFM是用户价值分层的经典方法', 'Recency越近越好', '可以根据业务场景调整分层规则']
  },
  {
    id: 'project-6',
    chapterId: 'chapter-8',
    title: '用户画像构建——K-Means聚类分析',
    description: '利用AI算法自动划分用户群体，实现自动化分群',
    difficulty: '进阶',
    skills: ['K-Means', '聚类分析', '特征工程', '用户画像'],
    initialCode: `import pandas as pd
import numpy as np

# 构建用户特征数据
np.random.seed(42)
n_users = 100

user_data = pd.DataFrame({
    'user_id': range(1, n_users + 1),
    'age': np.concatenate([
        np.random.normal(40, 5, 30),
        np.random.normal(22, 3, 40),
        np.random.normal(30, 4, 30)
    ]),
    'monthly_orders': np.concatenate([
        np.random.poisson(1, 30),
        np.random.poisson(8, 40),
        np.random.poisson(4, 30)
    ]),
    'avg_order_value': np.concatenate([
        np.random.normal(500, 100, 30),
        np.random.normal(50, 15, 40),
        np.random.normal(150, 40, 30)
    ]),
    'days_since_last_order': np.concatenate([
        np.random.normal(30, 10, 30),
        np.random.normal(3, 2, 40),
        np.random.normal(10, 5, 30)
    ])
})

# 清理不合理值
user_data['age'] = user_data['age'].clip(18, 65)
user_data['monthly_orders'] = user_data['monthly_orders'].clip(0, 30)
user_data['avg_order_value'] = user_data['avg_order_value'].clip(10, 2000)
user_data['days_since_last_order'] = user_data['days_since_last_order'].clip(0, 90)

print("用户特征数据预览：")
print(user_data.head(10))
print()

print("用户统计描述：")
print(user_data.describe())
print()

print("\\n提示：完整的K-Means聚类需要sklearn库。")
print("聚类步骤：")
print("1. 特征选择与标准化")
print("2. 肘部法则确定K值")
print("3. 训练聚类模型")
print("4. 分析每个簇的特征")
print("5. 定义簇的业务含义")
`,
    tips: ['聚类是无监督学习的一种', 'K-Means对初始值敏感', '可以用肘部法则确定最佳K值']
  },
  {
    id: 'project-7',
    chapterId: 'chapter-9',
    title: '时间序列分解与移动平均预测',
    description: '理解销售数据的趋势与季节性，为AI预测模型提供基线',
    difficulty: '进阶',
    skills: ['时间序列', '移动平均', '季节性分解', '异常检测'],
    initialCode: `import pandas as pd
import numpy as np

# 模拟每日销售数据（包含趋势+季节+噪声）
np.random.seed(42)
dates = pd.date_range('2023-01-01', '2023-12-31', freq='D')
n = len(dates)

# 趋势：缓慢上升
trend = np.linspace(100, 150, n)
# 季节性：7天周期
seasonal = 20 * np.sin(2 * np.pi * np.arange(n) / 7)
# 月度效应（月初发工资消费高）
month_effect = np.where(pd.Series(dates).dt.day <= 5, 30, 0)
# 噪声
noise = np.random.normal(0, 10, n)

sales = trend + seasonal + month_effect + noise
sales = np.maximum(sales, 0)

df_ts = pd.DataFrame({'date': dates, 'sales': sales.round(2)})
df_ts.set_index('date', inplace=True)

print("时间序列数据预览：")
print(df_ts.head(10))
print()

# 7天移动平均
df_ts['MA_7'] = df_ts['sales'].rolling(window=7, center=True).mean()

print("\\n提示：完整的季节性分解需要statsmodels库。")
print("分析步骤：")
print("1. 计算移动平均，观察趋势")
print("2. 季节性分解（趋势+季节+残差）")
print("3. 用上周同天做预测")
print("4. 异常检测（基于残差标准差）")
`,
    tips: ['移动平均是最简单的时间序列预测方法', '7天移动平均可以平滑周效应', '残差可以用来检测异常值']
  },
  {
    id: 'project-8',
    chapterId: 'chapter-10',
    title: '评论文本情感分析与销量关联',
    description: '利用NLP将非结构化评论转化为可分析数据，验证口碑效应',
    difficulty: '进阶',
    skills: ['情感分析', 'NLP', '关键词提取', '相关性分析'],
    initialCode: `import pandas as pd
import numpy as np

# 模拟商品评论数据（包含情感倾向）
np.random.seed(42)
positive_templates = [
    "非常好用，质量很棒，值得购买",
    "物流很快，包装完好，很满意",
    "性价比很高，推荐给大家"
]
negative_templates = [
    "质量太差了，用了一次就坏了",
    "跟描述不符，很失望",
    "物流太慢，包装都破了"
]

reviews = []
for _ in range(200):
    product = np.random.choice(['A', 'B', 'C', 'D', 'E'])
    quality_map = {'A': 0.8, 'B': 0.5, 'C': 0.9, 'D': 0.3, 'E': 0.6}
    
    sentiment_roll = np.random.random()
    if sentiment_roll < quality_map[product]:
        template = np.random.choice(positive_templates)
        true_sentiment = 1
    elif sentiment_roll < quality_map[product] + 0.2:
        template = "一般般吧，对得起这个价格"
        true_sentiment = 0
    else:
        template = np.random.choice(negative_templates)
        true_sentiment = -1
    
    reviews.append({
        'product_id': product,
        'review_text': template,
        'true_sentiment': true_sentiment
    })

df_reviews = pd.DataFrame(reviews)
print("评论数据预览：")
print(df_reviews.head(10))
print()

# 简易情感打分（基于关键词）
positive_words = ['好', '棒', '满意', '推荐', '快', '值', '喜欢']
negative_words = ['差', '失望', '慢', '破', '坏', '后悔', '烂', '不行']

def simple_sentiment_score(text):
    """简易情感打分，返回-1到1之间的分数"""
    score = 0
    for word in positive_words:
        score += text.count(word) * 0.25
    for word in negative_words:
        score -= text.count(word) * 0.25
    return max(-1, min(1, score))

df_reviews['sentiment_score'] = df_reviews['review_text'].apply(simple_sentiment_score)

print("各商品情感分析结果：")
product_sentiment = df_reviews.groupby('product_id').agg(
    评论数=('review_text', 'count'),
    平均情感分=('sentiment_score', 'mean')
).round(3)
print(product_sentiment)
`,
    tips: ['情感分析是NLP的重要应用', '可以使用SnowNLP等库做中文情感分析', '口碑与销量通常呈正相关']
  },
  {
    id: 'project-9',
    chapterId: 'chapter-11',
    title: '协同过滤推荐系统实现',
    description: '理解AI推荐算法的底层矩阵运算逻辑',
    difficulty: '综合',
    skills: ['协同过滤', '余弦相似度', '矩阵分解', '推荐算法'],
    initialCode: `import pandas as pd
import numpy as np

# 模拟用户-物品评分矩阵
np.random.seed(42)
ratings_dict = {
    'user_id': [1,1,1,2,2,3,3,3,3,4,4,4,5,5,5,5],
    'item_id': [1,2,3,1,4,2,3,4,5,1,3,5,2,3,4,5],
    'rating': [5,3,4,4,5,2,4,5,3,4,5,2,3,4,5,4]
}
df_ratings = pd.DataFrame(ratings_dict)

print("评分数据：")
print(df_ratings)
print()

# 构建用户-物品矩阵
user_item_matrix = df_ratings.pivot(index='user_id', columns='item_id', values='rating').fillna(0)
print("用户-物品矩阵：")
print(user_item_matrix)
print()

print("\\n提示：完整的协同过滤需要计算余弦相似度。")
print("推荐步骤：")
print("1. 构建用户-物品矩阵")
print("2. 计算物品之间的余弦相似度")
print("3. 对每个用户的已评分物品，找到相似物品")
print("4. 加权求和得到预测评分")
print("5. 推荐预测评分最高的物品")
`,
    tips: ['协同过滤分为基于用户和基于物品的', '余弦相似度是常用的相似度度量', '矩阵分解是现代推荐系统的核心']
  },
  {
    id: 'project-10',
    chapterId: 'chapter-12',
    title: '综合实战——电商全链路数据分析',
    description: '模拟真实工作场景，融合前面所有技术完成完整分析报告',
    difficulty: '综合',
    skills: ['全链路分析', '漏斗分析', '用户聚类', '策略建议'],
    initialCode: `import pandas as pd
import numpy as np

print("=" * 60)
print("电商用户全链路数据分析报告")
print("=" * 60)
print()

# 数据准备
np.random.seed(42)
n_users = 50
n_sessions = 500

df_users = pd.DataFrame({
    'user_id': range(1, n_users + 1),
    'age': np.random.normal(30, 8, n_users).clip(18, 60).astype(int)
})

df_behavior = pd.DataFrame({
    'user_id': np.random.choice(range(1, n_users + 1), n_sessions),
    'event': np.random.choice(['page_view', 'page_view', 'page_view', 'add_cart', 'purchase'], n_sessions),
    'product_price': np.random.choice([50, 100, 200, 500, 1000], n_sessions)
})

print("[Part 1] 数据概览：")
print(f"  用户数: {len(df_users)}")
print(f"  行为记录: {len(df_behavior)}")
print()

# 流量漏斗分析
page_view_users = df_behavior[df_behavior['event'] == 'page_view']['user_id'].nunique()
add_cart_users = df_behavior[df_behavior['event'] == 'add_cart']['user_id'].nunique()
purchase_users = df_behavior[df_behavior['event'] == 'purchase']['user_id'].nunique()

print("[Part 2] 流量漏斗分析：")
funnel_df = pd.DataFrame({
    '阶段': ['浏览', '加购', '支付'],
    '用户数': [page_view_users, add_cart_users, purchase_users]
})
funnel_df['总体转化率'] = (funnel_df['用户数'] / page_view_users * 100).round(1)
print(funnel_df.to_string(index=False))
print()

print("[Part 3-6] 完整分析包括：")
print("  - 购物车放弃率分析")
print("  - 商品关联规则")
print("  - 用户聚类")
print("  - 策略建议")
print()
print("=" * 60)
print("分析结论与AI策略建议")
print("=" * 60)
print("1. 浏览到支付转化率偏低，建议AI部署个性化推荐算法提升加购率")
print("2. 高客单价商品加购放弃率偏高，建议AI触发自动化挽单邮件")
print("3. 聚类识别出沉睡高价值用户群，建议作为AI定向广告的重点投放对象")
print("4. 价格带共现分析为AI捆绑推荐模型提供了特征输入")
`,
    tips: ['综合实战是检验学习成果的最好方式', '实际项目中需要更多的数据清洗', '分析结果要转化为可执行的业务建议']
  }
];

export default function CodePractice() {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  
  const project = dataAnalysisProjects.find(p => p.chapterId === chapterId) || dataAnalysisProjects[0];

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-xl transition-all w-fit"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>返回</span>
      </button>

      <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Code2 className="h-6 w-6 text-emerald-600" />
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                project.difficulty === '基础' ? 'bg-emerald-100 text-emerald-700' :
                project.difficulty === '进阶' ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700'
              }`}>
                {project.difficulty}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{project.title}</h1>
            <p className="text-gray-600">{project.description}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {project.skills.map((skill, idx) => (
            <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
              {skill}
            </span>
          ))}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900 mb-2">学习提示</h3>
              <ul className="space-y-1 text-sm text-amber-800">
                {project.tips.map((tip, idx) => (
                  <li key={idx}>• {tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <PythonRunner initialCode={project.initialCode} />
    </div>
  );
}
