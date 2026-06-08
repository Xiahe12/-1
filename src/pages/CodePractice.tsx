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
  },
  {
    id: 'db-project-1',
    chapterId: 'chapter-13',
    title: '数据库连接与数据抽取（SQL + Pandas）',
    description: '从数据库中提取销售数据，为分析做准备。使用 SQLite 创建订单表、订单明细表、商品表，使用 pandas.read_sql 读取数据。',
    difficulty: '基础',
    skills: ['SQLite', 'SQL', 'pandas.read_sql', '数据验证'],
    initialCode: `import sqlite3
import pandas as pd
import numpy as np

# 创建数据库连接
conn = sqlite3.connect("sales.db")
cursor = conn.cursor()

# 创建订单表
cursor.execute("""
    CREATE TABLE IF NOT EXISTS orders (
        order_id INTEGER PRIMARY KEY,
        user_id INTEGER,
        order_date TEXT,
        total_amount REAL
    )
""")

# 创建订单明细表
cursor.execute("""
    CREATE TABLE IF NOT EXISTS order_items (
        item_id INTEGER PRIMARY KEY,
        order_id INTEGER,
        product_id INTEGER,
        quantity INTEGER,
        price REAL,
        FOREIGN KEY (order_id) REFERENCES orders(order_id)
    )
""")

# 创建商品表
cursor.execute("""
    CREATE TABLE IF NOT EXISTS products (
        product_id INTEGER PRIMARY KEY,
        product_name TEXT,
        category TEXT,
        price REAL
    )
""")

# 插入模拟数据
np.random.seed(42)

# 商品数据
products = [
    (1, '牛奶', '食品', 5.5),
    (2, '面包', '食品', 3.0),
    (3, '手机壳', '数码', 20.0),
    (4, '钢化膜', '数码', 15.0),
    (5, '洗发水', '日用品', 25.0)
]
cursor.executemany("INSERT OR REPLACE INTO products VALUES (?, ?, ?, ?)", products)

# 订单数据
orders = []
order_items = []
for i in range(1, 51):
    user_id = np.random.randint(1, 11)
    order_date = f'2024-01-{np.random.randint(1, 29):02d}'
    total_amount = 0
    
    num_items = np.random.randint(1, 4)
    for j in range(num_items):
        product_id = np.random.randint(1, 6)
        quantity = np.random.randint(1, 4)
        price = products[product_id-1][3]
        total_amount += price * quantity
        order_items.append((len(order_items) + 1, i, product_id, quantity, price))
    
    orders.append((i, user_id, order_date, total_amount))

cursor.executemany("INSERT OR REPLACE INTO orders VALUES (?, ?, ?, ?)", orders)
cursor.executemany("INSERT OR REPLACE INTO order_items VALUES (?, ?, ?, ?, ?)", order_items)
conn.commit()

print("数据库创建成功！")
print()

# 使用 pandas.read_sql 读取数据
df_orders = pd.read_sql("SELECT * FROM orders", conn)
df_order_items = pd.read_sql("SELECT * FROM order_items", conn)
df_products = pd.read_sql("SELECT * FROM products", conn)

print("订单表前5行：")
print(df_orders.head())
print()

print("订单明细表前5行：")
print(df_order_items.head())
print()

print("商品表：")
print(df_products)
print()

# 验证数据
assert len(df_orders) > 0, "数据抽取失败"
assert len(df_order_items) > 0, "订单明细数据抽取失败"
assert len(df_products) > 0, "商品数据抽取失败"

print("✓ 数据验证通过！")
print(f"订单数: {len(df_orders)}")
print(f"订单明细数: {len(df_order_items)}")
print(f"商品数: {len(df_products)}")

conn.close()
`,
    tips: ['SQLite 是轻量级数据库，无需安装服务', 'pandas.read_sql 可以直接读取 SQL 查询结果', '记得关闭数据库连接']
  },
  {
    id: 'db-project-2',
    chapterId: 'chapter-14',
    title: '数据清洗与缺失值处理',
    description: '掌握真实数据中的缺失值、异常值处理。构造含缺失值的订单表，使用 Pandas 进行删除空行、填充均值、标记缺失。',
    difficulty: '基础',
    skills: ['缺失值处理', '数据清洗', '统计对比', '异常值检测'],
    initialCode: `import sqlite3
import pandas as pd
import numpy as np

# 创建含缺失值的数据
np.random.seed(42)
n = 100

data = {
    'order_id': range(1, n+1),
    'user_id': np.random.randint(1, 11, n),
    'amount': np.random.normal(100, 30, n).round(2),
    'quantity': np.random.randint(1, 10, n)
}

df = pd.DataFrame(data)

# 引入缺失值
df.loc[np.random.choice(n, 15), 'amount'] = np.nan
df.loc[np.random.choice(n, 10), 'user_id'] = np.nan

# 引入异常值
df.loc[np.random.choice(n, 5), 'amount'] = df['amount'] * 5

print("原始数据统计：")
print(df.describe())
print()
print(f"缺失值情况：")
print(df.isnull().sum())
print()

# 创建副本进行清洗
df_clean = df.copy()

# 方法1：删除含有缺失值的行
df_drop = df.dropna()
print(f"删除缺失值后行数: {len(df_drop)} (原始: {len(df)})")
print()

# 方法2：填充均值
df_clean['amount'] = df_clean['amount'].fillna(df_clean['amount'].mean())
df_clean['user_id'] = df_clean['user_id'].fillna(-1)  # 用特殊值标记

# 标记缺失
df_clean['amount_missing'] = df['amount'].isnull()
df_clean['user_id_missing'] = df['user_id'].isnull()

# 处理异常值：截断在 3σ 范围内
mean_amount = df_clean['amount'].mean()
std_amount = df_clean['amount'].std()
lower_bound = mean_amount - 3 * std_amount
upper_bound = mean_amount + 3 * std_amount
df_clean['amount'] = df_clean['amount'].clip(lower_bound, upper_bound)

print("清洗后数据统计：")
print(df_clean.describe())
print()
print(f"清洗后缺失值情况：")
print(df_clean[['amount', 'user_id']].isnull().sum())
print()

# 验证
assert df_clean["amount"].isnull().sum() == 0, "缺失值未处理"
print("✓ 缺失值处理验证通过！")
`,
    tips: ['处理缺失值有三种方法：删除、填充、标记', '均值填充适合正态分布数据', '异常值可以用截断或 IQR 方法处理']
  },
  {
    id: 'db-project-3',
    chapterId: 'chapter-15',
    title: '购物车分析（Market Basket Analysis）',
    description: '使用关联规则挖掘。将订单明细转换为"购物篮"格式，计算支持度、置信度、提升度，找出强关联规则。',
    difficulty: '进阶',
    skills: ['关联规则', '购物篮分析', '支持度置信度', '提升度'],
    initialCode: `import pandas as pd
import numpy as np
from itertools import combinations

# 创建购物车数据
np.random.seed(42)

products = ['牛奶', '面包', '黄油', '手机壳', '钢化膜', '啤酒', '花生', '洗发水', '沐浴露']
n_orders = 100

transactions = []
for i in range(n_orders):
    # 随机选择商品
    n_items = np.random.randint(1, 5)
    items = np.random.choice(products, n_items, replace=False)
    transactions.append({'order_id': i+1, 'items': ','.join(sorted(items))})

df = pd.DataFrame(transactions)
print("购物车数据前10行：")
print(df.head(10))
print()

# 转换为 one-hot 编码
one_hot = df['items'].str.get_dummies(sep=',')
print("One-hot 编码数据前5行：")
print(one_hot.head())
print()

# 计算单个商品的支持度
support = one_hot.mean().sort_values(ascending=False)
print("商品支持度（出现频率）：")
print(support.round(4))
print()

# 计算商品对的共现（简化版关联规则）
pair_support = {}
total_orders = len(one_hot)

for i, item1 in enumerate(one_hot.columns):
    for item2 in one_hot.columns[i+1:]:
        # 同时购买的订单数
        both = ((one_hot[item1] == 1) & (one_hot[item2] == 1)).sum()
        if both > 0:
            pair_support[(item1, item2)] = both / total_orders

# 计算置信度和提升度
rules = []
for (item_a, item_b), supp in sorted(pair_support.items(), key=lambda x: x[1], reverse=True):
    conf_ab = supp / support[item_a]  # A→B 的置信度
    conf_ba = supp / support[item_b]  # B→A 的置信度
    lift = supp / (support[item_a] * support[item_b])  # 提升度
    
    rules.append({
        'antecedent': item_a,
        'consequent': item_b,
        'support': supp,
        'confidence': conf_ab,
        'lift': lift
    })

rules_df = pd.DataFrame(rules)

print("Top 10 关联规则（按提升度排序）：")
print(rules_df.sort_values('lift', ascending=False).head(10).round(4))
print()

# 找出强关联规则（提升度 > 1.2）
strong_rules = rules_df[rules_df['lift'] > 1.2]
print(f"强关联规则（提升度 > 1.2）数量: {len(strong_rules)}")
if len(strong_rules) > 0:
    print("强关联规则：")
    print(strong_rules[['antecedent', 'consequent', 'lift']].round(4))

assert len(rules_df[rules_df["lift"] > 1]) > 0, "没有找到正相关规则"
print("\\n✓ 关联规则分析完成！")
`,
    tips: ['提升度 > 1 表示正相关，< 1 表示负相关', '置信度表示购买A后购买B的概率', '支持度表示同时购买A和B的概率']
  },
  {
    id: 'db-project-4',
    chapterId: 'chapter-16',
    title: '用户消费行为RFM分析',
    description: '基于最近购买时间、频率、金额进行用户分层。计算每个用户的 R、F、M，对每个指标分箱，输出高价值用户名单。',
    difficulty: '进阶',
    skills: ['RFM模型', '用户分层', '分箱操作', '价值评估'],
    initialCode: `import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# 创建用户消费数据
np.random.seed(42)
n_users = 30
reference_date = datetime(2024, 2, 1)

data = []
for user_id in range(1, n_users + 1):
    n_purchases = np.random.randint(1, 15)
    for i in range(n_purchases):
        days_ago = np.random.randint(0, 60)
        purchase_date = reference_date - timedelta(days=days_ago)
        amount = np.random.normal(100, 30, 1)[0].round(2)
        data.append({
            'user_id': user_id,
            'purchase_date': purchase_date,
            'amount': max(amount, 10)  # 确保金额为正
        })

df = pd.DataFrame(data)
print("消费数据前10行：")
print(df.head(10))
print()

# 计算 RFM
rfm = df.groupby('user_id').agg({
    'purchase_date': lambda x: (reference_date - x.max()).days,  # Recency：最近一次购买距今天数
    'amount': ['count', 'sum']  # Frequency：购买次数，Monetary：总金额
}).round(2)

rfm.columns = ['Recency', 'Frequency', 'Monetary']
print("RFM原始值（前10用户）：")
print(rfm.head(10))
print()

# RFM 打分 (1-5)
# Recency: 越小越好，所以分位数反转
rfm['R_score'] = pd.qcut(rfm['Recency'], q=5, labels=[5, 4, 3, 2, 1]).astype(int)
# Frequency: 越大越好
rfm['F_score'] = pd.qcut(rfm['Frequency'].rank(method='first'), q=5, labels=[1, 2, 3, 4, 5]).astype(int)
# Monetary: 越大越好
rfm['M_score'] = pd.qcut(rfm['Monetary'].rank(method='first'), q=5, labels=[1, 2, 3, 4, 5]).astype(int)

# 计算总分
rfm['RFM_Score'] = rfm['R_score'] + rfm['F_score'] + rfm['M_score']

# 用户分层
def classify_user(row):
    total = row['RFM_Score']
    if total >= 12:
        return '重要价值客户'
    elif total >= 9:
        return '重要发展客户'
    elif total >= 6:
        return '一般客户'
    else:
        return '流失客户'

rfm['segment'] = rfm.apply(classify_user, axis=1)

print("RFM分析结果：")
print(rfm[['Recency', 'Frequency', 'Monetary', 'RFM_Score', 'segment']].head(10))
print()

# 分层统计
segment_stats = rfm.groupby('segment').agg({
    'Recency': 'mean',
    'Frequency': 'mean',
    'Monetary': ['mean', 'count', 'sum']
}).round(2)
segment_stats.columns = ['平均最近天数', '平均购买次数', '平均消费金额', '用户数', '总消费金额']
print("用户分层统计：")
print(segment_stats)
print()

# 高价值用户
high_value = rfm[rfm['RFM_Score'] >= 12]
print(f"高价值用户（RFM_Score >= 12）: {len(high_value)} 人")
print(high_value[['RFM_Score', 'segment']])

assert len(high_value) > 0, "没有找到高价值用户"
print("\\n✓ RFM分析完成！")
`,
    tips: ['R: 最近一次购买（越小越好）', 'F: 购买频率（越大越好）', 'M: 消费金额（越大越好）']
  },
  {
    id: 'db-project-5',
    chapterId: 'chapter-17',
    title: '时间序列分析与趋势预测',
    description: '分析销售额随时间变化，使用简单预测模型。将订单数据按日/月聚合，使用 Pandas 重采样与滚动平均。',
    difficulty: '进阶',
    skills: ['时间序列', '重采样', '滚动平均', '趋势预测'],
    initialCode: `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from datetime import datetime, timedelta

# 创建时间序列数据
np.random.seed(42)
start_date = datetime(2024, 1, 1)
end_date = datetime(2024, 6, 30)
dates = pd.date_range(start_date, end_date, freq='D')

# 构造有趋势和季节性的数据
n_days = len(dates)
trend = np.linspace(100, 150, n_days)  # 上升趋势
seasonal = 20 * np.sin(2 * np.pi * np.arange(n_days) / 7)  # 周周期
monthly_effect = np.where(pd.Series(dates).dt.day <= 5, 30, 0)  # 月初效应
noise = np.random.normal(0, 10, n_days)
sales = trend + seasonal + monthly_effect + noise
sales = np.maximum(sales, 50)  # 确保不为负

df = pd.DataFrame({'date': dates, 'sales': sales.round(2)})
df.set_index('date', inplace=True)

print("时间序列数据前10天：")
print(df.head(10))
print()

# 重采样：按月聚合
monthly_sales = df.resample('M').sum()
print("月度销售数据：")
print(monthly_sales)
print()

# 滚动平均
df['MA_7'] = df['sales'].rolling(window=7, center=True).mean()
df['MA_30'] = df['sales'].rolling(window=30, center=True).mean()

print("统计摘要：")
print(df[['sales', 'MA_7', 'MA_30']].describe().round(2))
print()

# 简单线性回归预测（趋势线）
from sklearn.linear_model import LinearRegression

# 准备数据
df['day_num'] = np.arange(len(df))
X = df[['day_num']].dropna()
y = df['sales'].loc[X.index]

# 拟合模型
model = LinearRegression()
model.fit(X, y)
df['trend'] = model.predict(df[['day_num']])

r2 = model.score(X, y)
print(f"趋势线拟合 R² = {r2:.4f}")
print(f"模型系数: 每天增长 {model.coef_[0]:.4f}")
print()

# 验证模型有一定解释力
assert r2 > 0.3, "模型解释力不足"
print("✓ 时间序列分析完成！")
print()
print("提示：完整的季节性分解可以使用 statsmodels.tsa.seasonal.seasonal_decompose")
`,
    tips: ['滚动平均可以平滑短期波动，看清长期趋势', '重采样可以将数据从日转为周/月', 'R² 表示模型能解释多少数据方差']
  },
  {
    id: 'db-project-6',
    chapterId: 'chapter-18',
    title: '用户聚类分析（KMeans）',
    description: '基于消费行为将用户分群。选取特征：总消费额、平均客单价、购买品类数，标准化后使用 KMeans 聚类。',
    difficulty: '进阶',
    skills: ['K-Means聚类', '特征工程', '标准化', '可视化'],
    initialCode: `import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

# 创建用户特征数据
np.random.seed(42)
n_users = 100

# 构造有聚类结构的数据
user_data = []
for i in range(n_users):
    if i < 30:
        # 群体1：高消费、低频次
        total = np.random.normal(5000, 1000)
        avg_order = np.random.normal(500, 100)
        categories = np.random.randint(2, 5)
    elif i < 70:
        # 群体2：中等消费、中频次
        total = np.random.normal(2000, 500)
        avg_order = np.random.normal(200, 50)
        categories = np.random.randint(3, 7)
    else:
        # 群体3：低消费、高频次
        total = np.random.normal(800, 200)
        avg_order = np.random.normal(80, 20)
        categories = np.random.randint(5, 10)
    
    user_data.append({
        'user_id': i + 1,
        'total_spent': max(total, 100),
        'avg_order_value': max(avg_order, 30),
        'num_categories': categories
    })

df = pd.DataFrame(user_data)
print("用户特征数据前10行：")
print(df.head(10))
print()

# 选取特征
features = ['total_spent', 'avg_order_value', 'num_categories']
X = df[features]

# 标准化
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# K-Means 聚类
kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
df['cluster'] = kmeans.fit_predict(X_scaled)

print("聚类结果统计：")
cluster_stats = df.groupby('cluster').agg({
    'total_spent': ['mean', 'count'],
    'avg_order_value': 'mean',
    'num_categories': 'mean'
}).round(2)
cluster_stats.columns = ['平均总消费', '用户数', '平均客单价', '平均品类数']
print(cluster_stats)
print()

# 为每个群体命名
def name_cluster(row):
    if row['cluster'] == 0:
        return '高价值客户'
    elif row['cluster'] == 1:
        return '大众客户'
    else:
        return '潜力客户'

df['cluster_name'] = df.apply(name_cluster, axis=1)

print("各群体用户数：")
print(df['cluster_name'].value_counts())
print()

# 验证聚类数量
assert len(set(df['cluster'])) == 3, "聚类数量不正确"
print("✓ 用户聚类分析完成！")
print()
print("提示：可以用 PCA 降维后可视化聚类结果")
`,
    tips: ['K-Means 需要先标准化特征', '可以用肘部法则确定最佳 k 值', '聚类后要为每个群体赋予业务含义']
  },
  {
    id: 'db-project-7',
    chapterId: 'chapter-19',
    title: '商品价格敏感度分析（价格弹性）',
    description: '分析价格变化对销量的影响。计算不同价格区间的平均销量，拟合对数线性模型估计价格弹性系数。',
    difficulty: '进阶',
    skills: ['价格弹性', '销量分析', '对数模型', '敏感度评估'],
    initialCode: `import pandas as pd
import numpy as np

# 创建商品价格和销量数据
np.random.seed(42)

products = ['商品A', '商品B', '商品C', '商品D', '商品E']
data = []

for product in products:
    # 为每个商品生成多期价格和销量数据
    base_price = np.random.choice([50, 100, 200, 500, 1000])
    for period in range(1, 13):
        # 价格在基础价格±20%波动
        price = base_price * (1 + np.random.uniform(-0.2, 0.2))
        # 销量与价格负相关，加上随机噪声
        base_quantity = 1000 / price * 10
        quantity = base_quantity * (1 + np.random.normal(-0.5 * (price - base_price)/base_price, 0.1))
        quantity = max(int(quantity), 10)
        
        data.append({
            'product': product,
            'period': period,
            'price': round(price, 2),
            'quantity': quantity
        })

df = pd.DataFrame(data)
print("价格销量数据前15行：")
print(df.head(15))
print()

# 计算价格弹性
elasticities = []

for product in products:
    product_data = df[df['product'] == product].copy()
    
    if len(product_data) >= 2:
        # 计算价格变化率和销量变化率
        product_data['price_change'] = product_data['price'].pct_change()
        product_data['quantity_change'] = product_data['quantity'].pct_change()
        
        # 计算弹性（销量变化% / 价格变化%）
        valid_data = product_data.dropna()
        if len(valid_data) > 0:
            elasticity = (valid_data['quantity_change'] / valid_data['price_change']).mean()
            elasticities.append({
                'product': product,
                'price_elasticity': round(elasticity, 4),
                'avg_price': round(product_data['price'].mean(), 2),
                'avg_quantity': round(product_data['quantity'].mean(), 2)
            })

elasticity_df = pd.DataFrame(elasticities)
print("各商品价格弹性：")
print(elasticity_df)
print()

# 找出高敏感商品（|elasticity| > 1）
high_sensitivity = elasticity_df[abs(elasticity_df['price_elasticity']) > 1]
print(f"高价格敏感商品（|弹性| > 1）: {len(high_sensitivity)} 个")
if len(high_sensitivity) > 0:
    print(high_sensitivity[['product', 'price_elasticity']])

# 验证
assert not elasticity_df['price_elasticity'].isna().all(), "未能计算价格弹性"
print("\\n✓ 价格敏感度分析完成！")
print()
print("提示：|弹性| > 1 表示价格变动对销量影响大（富有弹性）")
print("提示：|弹性| < 1 表示价格变动对销量影响小（缺乏弹性）")
`,
    tips: ['价格弹性 = 销量变化% / 价格变化%', '弹性绝对值 > 1: 富有弹性（价格敏感）', '弹性绝对值 < 1: 缺乏弹性（价格不敏感）']
  },
  {
    id: 'db-project-8',
    chapterId: 'chapter-20',
    title: '实时数据流模拟与滑动窗口聚合',
    description: '模拟AI场景下的流式数据处理。使用 pandas 模拟订单事件，计算过去1分钟的销售额滑动平均，检测异常峰值。',
    difficulty: '进阶',
    skills: ['流式数据', '滑动窗口', '异常检测', '实时聚合'],
    initialCode: `import pandas as pd
import numpy as np
from collections import deque
import time

# 模拟实时数据流
np.random.seed(42)

# 生成历史数据
n_history = 100
timestamps = pd.date_range(end=pd.Timestamp.now(), periods=n_history, freq='5S')
base_sales = 100
sales = base_sales + np.random.normal(0, 20, n_history)

# 引入几个异常峰值
sales[20] = base_sales * 3
sales[50] = base_sales * 2.5
sales[80] = base_sales * 4

stream_data = pd.DataFrame({
    'timestamp': timestamps,
    'sales': sales.round(2)
})

print("模拟流数据前10条：")
print(stream_data.head(10))
print()

# 滑动窗口聚合（窗口大小 = 12 * 5秒 = 1分钟）
window_size = 12
stream_data['rolling_mean'] = stream_data['sales'].rolling(window=window_size).mean()
stream_data['rolling_std'] = stream_data['sales'].rolling(window=window_size).std()

# 异常检测：超过均值 + 3倍标准差
stream_data['is_anomaly'] = (
    stream_data['sales'] > 
    stream_data['rolling_mean'] + 3 * stream_data['rolling_std']
)

print("滑动窗口统计（后15条）：")
print(stream_data[['timestamp', 'sales', 'rolling_mean', 'is_anomaly']].tail(15))
print()

# 统计结果
total_events = len(stream_data)
anomaly_count = stream_data['is_anomaly'].sum()
print(f"总事件数: {total_events}")
print(f"检测到异常: {anomaly_count} 个")
print()

# 使用 deque 实现流式处理（在线版本）
print("模拟在线流式处理（前20个事件）：")
window = deque(maxlen=window_size)

for i, (_, row) in enumerate(stream_data.head(20).iterrows()):
    window.append(row['sales'])
    
    if len(window) == window_size:
        mean_val = np.mean(window)
        std_val = np.std(window)
        is_anomaly = row['sales'] > mean_val + 3 * std_val
        
        status = "⚠️ 异常" if is_anomaly else "✓ 正常"
        print(f"时间 {i+1:2d}: 销售额={row['sales']:6.2f}, 均值={mean_val:6.2f}, {status}")
    
    time.sleep(0.05)  # 模拟延迟

# 验证滑动窗口长度
assert len(stream_data['rolling_mean'].dropna()) == len(stream_data) - window_size + 1, "滑动窗口计算错误"
print("\\n✓ 实时流数据分析完成！")
`,
    tips: ['滑动窗口可以只保留最近N个数据点', '异常检测常用 3σ 原则', 'deque 的 maxlen 可以自动丢弃旧数据']
  },
  {
    id: 'db-project-9',
    chapterId: 'chapter-21',
    title: '多表关联与特征工程',
    description: '为机器学习模型构建特征表。关联订单表、用户表、商品表、评价表，构造特征：用户历史好评率、商品被购买时段分布。',
    difficulty: '进阶',
    skills: ['多表关联', '特征工程', '评价分析', '特征矩阵'],
    initialCode: `import sqlite3
import pandas as pd
import numpy as np
from datetime import datetime

# 创建数据库和表
conn = sqlite3.connect(":memory:")

# 用户表
users = pd.DataFrame({
    'user_id': range(1, 21),
    'age': np.random.randint(18, 60, 20),
    'gender': np.random.choice(['M', 'F'], 20),
    'register_date': pd.date_range('2023-01-01', periods=20)
})
users.to_sql('users', conn, index=False, if_exists='replace')

# 商品表
products = pd.DataFrame({
    'product_id': range(1, 11),
    'product_name': [f'商品{i}' for i in range(1, 11)],
    'category': np.random.choice(['食品', '数码', '服装', '日用品'], 10),
    'price': np.random.uniform(10, 500, 10).round(2)
})
products.to_sql('products', conn, index=False, if_exists='replace')

# 订单表
n_orders = 100
orders = pd.DataFrame({
    'order_id': range(1, n_orders + 1),
    'user_id': np.random.randint(1, 21, n_orders),
    'product_id': np.random.randint(1, 11, n_orders),
    'order_time': pd.date_range('2024-01-01', periods=n_orders, freq='2H'),
    'quantity': np.random.randint(1, 5, n_orders)
})
orders.to_sql('orders', conn, index=False, if_exists='replace')

# 评价表
reviews = pd.DataFrame({
    'review_id': range(1, n_orders + 1),
    'order_id': range(1, n_orders + 1),
    'user_id': orders['user_id'],
    'product_id': orders['product_id'],
    'rating': np.random.randint(1, 6, n_orders),  # 1-5星
    'review_text': np.random.choice(['很好', '不错', '一般', '差'], n_orders)
})
reviews.to_sql('reviews', conn, index=False, if_exists='replace')

print("数据库表创建完成！")
print()

# SQL多表关联
query = """
SELECT 
    u.user_id,
    u.age,
    u.gender,
    o.order_id,
    o.order_time,
    o.quantity,
    p.product_id,
    p.product_name,
    p.category,
    p.price,
    r.rating
FROM users u
JOIN orders o ON u.user_id = o.user_id
JOIN products p ON o.product_id = p.product_id
LEFT JOIN reviews r ON o.order_id = r.order_id
"""
df_full = pd.read_sql(query, conn)
print("关联后的数据前10行：")
print(df_full.head(10))
print()

# 特征工程：用户特征
user_features = df_full.groupby('user_id').agg({
    'order_id': 'count',  # 订单数
    'price': ['sum', 'mean'],  # 总消费、平均消费
    'rating': 'mean',  # 平均评分
    'category': 'nunique'  # 购买品类数
}).round(2)
user_features.columns = ['total_orders', 'total_spent', 'avg_order_value', 'avg_rating', 'num_categories']

# 用户好评率
user_features['good_review_rate'] = (
    df_full[df_full['rating'] >= 4].groupby('user_id').size() / 
    user_features['total_orders']
).round(4).fillna(0)

print("用户特征：")
print(user_features.head(10))
print()

# 商品特征
product_features = df_full.groupby('product_id').agg({
    'quantity': 'sum',
    'price': 'first',
    'rating': 'mean',
    'order_id': 'count'
}).round(2)
product_features.columns = ['total_sold', 'price', 'avg_rating', 'order_count']

print("商品特征：")
print(product_features.head(10))
print()

# 输出可用于聚类的特征矩阵
feature_matrix = user_features[['total_orders', 'total_spent', 'avg_rating', 'num_categories']].fillna(0)

print("特征矩阵形状：", feature_matrix.shape)
print("特征矩阵前5行：")
print(feature_matrix.head())

assert feature_matrix.shape[1] >= 5 or feature_matrix.shape[1] >= 4, "特征数量不足"
print("\\n✓ 多表关联与特征工程完成！")
`,
    tips: ['LEFT JOIN 可以保留左表所有记录', '特征工程是机器学习最重要的步骤', '聚合函数：count, sum, mean, nunique']
  },
  {
    id: 'db-project-10',
    chapterId: 'chapter-22',
    title: '端到端分析报告自动生成',
    description: '整合所有分析，输出结构化报告。运行多个分析模块，将结果写入数据库，生成可视化图表。',
    difficulty: '综合',
    skills: ['报告生成', '结果保存', '可视化', '端到端'],
    initialCode: `import sqlite3
import pandas as pd
import numpy as np
from datetime import datetime

print("=" * 60)
print("电商数据分析报告自动生成系统")
print("=" * 60)
print()

# 创建数据库
conn = sqlite3.connect("analysis_report.db")

# Step 1: 创建模拟数据
print("[Step 1] 创建模拟数据...")
np.random.seed(42)

# 用户表
users = pd.DataFrame({
    'user_id': range(1, 31),
    'age': np.random.randint(18, 55, 30),
    'gender': np.random.choice(['M', 'F'], 30)
})

# 订单表
n_orders = 200
orders = pd.DataFrame({
    'order_id': range(1, n_orders + 1),
    'user_id': np.random.randint(1, 31, n_orders),
    'amount': np.random.normal(150, 50, n_orders).round(2),
    'order_date': pd.date_range('2024-01-01', periods=n_orders, freq='3H')
})
orders['amount'] = orders['amount'].clip(20, 500)

# 保存原始数据
users.to_sql('users', conn, index=False, if_exists='replace')
orders.to_sql('orders', conn, index=False, if_exists='replace')
print("✓ 数据创建完成")
print()

# Step 2: RFM分析
print("[Step 2] 进行RFM分析...")
reference_date = orders['order_date'].max()

rfm = orders.groupby('user_id').agg({
    'order_date': lambda x: (reference_date - x.max()).days,
    'amount': ['count', 'sum']
})
rfm.columns = ['Recency', 'Frequency', 'Monetary']

# 简单评分
rfm['R_score'] = pd.qcut(rfm['Recency'], q=3, labels=[3, 2, 1]).astype(int)
rfm['F_score'] = pd.qcut(rfm['Frequency'].rank(method='first'), q=3, labels=[1, 2, 3]).astype(int)
rfm['M_score'] = pd.qcut(rfm['Monetary'].rank(method='first'), q=3, labels=[1, 2, 3]).astype(int)
rfm['RFM_Score'] = rfm['R_score'] + rfm['F_score'] + rfm['M_score']

# 保存RFM结果
rfm.reset_index().to_sql('rfm_results', conn, index=False, if_exists='replace')
print("✓ RFM分析完成并保存")
print()

# Step 3: 销售趋势分析
print("[Step 3] 分析销售趋势...")
orders['date'] = orders['order_date'].dt.date
daily_sales = orders.groupby('date')['amount'].agg(['sum', 'count']).round(2)
daily_sales.columns = ['total_sales', 'order_count']

# 保存销售趋势
daily_sales.reset_index().to_sql('daily_sales', conn, index=False, if_exists='replace')
print("✓ 销售趋势分析完成并保存")
print()

# Step 4: 生成报告
print("[Step 4] 生成分析报告...")
print()
print("=" * 60)
print("电商数据分析报告")
print("=" * 60)
print(f"报告生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print()

print("1. 数据概览")
print("-" * 40)
print(f"   用户数: {len(users)}")
print(f"   订单数: {len(orders)}")
print(f"   总销售额: {orders['amount'].sum():.2f}")
print(f"   平均订单金额: {orders['amount'].mean():.2f}")
print()

print("2. RFM用户分层")
print("-" * 40)
print(f"   高价值用户 (RFM>=7): {len(rfm[rfm['RFM_Score'] >=7])} 人")
print(f"   中等用户 (4<=RFM<7): {len(rfm[(rfm['RFM_Score'] >=4) & (rfm['RFM_Score'] <7)])} 人")
print(f"   低价值用户 (RFM<4): {len(rfm[rfm['RFM_Score'] <4])} 人")
print()

print("3. 销售趋势")
print("-" * 40)
print(f"   日均销售额: {daily_sales['total_sales'].mean():.2f}")
print(f"   日均订单数: {daily_sales['order_count'].mean():.1f}")
print(f"   最高日销售额: {daily_sales['total_sales'].max():.2f}")
print()

print("4. 策略建议")
print("-" * 40)
print("   1. 对高价值用户推出专属优惠，提高忠诚度")
print("   2. 对中等价值用户进行交叉销售推荐")
print("   3. 对低价值用户设计唤醒活动")
print("   4. 关注销售峰值日期，提前做好库存准备")
print()

print("=" * 60)
print("分析结果已保存到数据库 analysis_report.db")
print("表名: rfm_results, daily_sales")
print("=" * 60)

# 验证报告文件
cursor = conn.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()
assert len(tables) >= 3, "报告表未正确保存"

# 关闭连接
conn.close()
print()
print("✓ 端到端分析报告生成完成！")
`,
    tips: ['可以用 matplotlib/seaborn 生成图表', '报告可以导出为 HTML 或 PDF', '结果保存到数据库方便后续查询']
  },
  {
    id: 'cart-project-1',
    chapterId: 'chapter-23',
    title: '用户购物车弃购原因清洗与统计',
    description: '处理订单表中的时间列格式、缺失支付时间标记弃购，计算弃购率、平均放弃购物车价值。',
    difficulty: '基础',
    skills: ['弃购率', '缺失值处理', '数据清洗', '统计对比'],
    initialCode: `import pandas as pd
import numpy as np
from datetime import datetime

# 创建模拟购物车数据
np.random.seed(42)
n = 200

data = {
    '订单ID': range(1, n+1),
    '用户ID': np.random.randint(1, 51, n),
    '商品ID': np.random.randint(1, 21, n),
    '加购时间': pd.date_range('2024-01-01', periods=n, freq='30T'),
    '是否支付': np.random.choice([0, 1], n, p=[0.35, 0.65]),  # 65%支付率
    '商品价格': np.random.uniform(20, 500, n).round(2)
}

df = pd.DataFrame(data)

# 生成支付时间（仅对已支付的订单）
df['支付时间'] = pd.NaT
paid_orders = df[df['是否支付'] == 1].index
df.loc[paid_orders, '支付时间'] = df.loc[paid_orders, '加购时间'] + pd.to_timedelta(
    np.random.randint(5, 120, len(paid_orders)), unit='m'
)

# 模拟缺失的支付时间（部分已支付订单忘记记录）
missing_payment = np.random.choice(paid_orders, size=int(len(paid_orders)*0.1), replace=False)
df.loc[missing_payment, '支付时间'] = pd.NaT

print("原始数据前10行：")
print(df.head(10))
print()
print("数据类型：")
print(df.dtypes)
print()
print(f"缺失值统计：")
print(df.isnull().sum())
print()

# 数据清洗
# 1. 标记弃购订单（未支付或支付时间缺失）
df['是否弃购'] = ((df['是否支付'] == 0) | (df['支付时间'].isna())).astype(int)

# 2. 计算弃购时间差
df['弃购等待时长_分钟'] = (
    pd.to_datetime('2024-01-31 23:59:59') - df['加购时间']
).dt.total_seconds() / 60

# 处理时间列格式
df['加购时间_格式'] = df['加购时间'].dt.strftime('%Y-%m-%d %H:%M')
df['支付时间_格式'] = df['支付时间'].dt.strftime('%Y-%m-%d %H:%M')

print("清洗后数据前10行：")
print(df[['订单ID', '用户ID', '商品价格', '是否弃购', '弃购等待时长_分钟']].head(10))
print()

# 统计分析
# 计算弃购率
abandon_rate = df[df['是否弃购'] == 1].shape[0] / df.shape[0]
print(f"整体弃购率: {abandon_rate:.2%}")
print()

# 计算平均放弃购物车价值
avg_abandon_value = df[df['是否弃购'] == 1]['商品价格'].mean()
print(f"平均放弃购物车价值: ¥{avg_abandon_value:.2f}")
print()

# 按商品统计弃购情况
product_stats = df.groupby('商品ID').agg({
    '是否弃购': ['sum', 'count', 'mean'],
    '商品价格': 'mean'
}).round(2)
product_stats.columns = ['弃购订单数', '总订单数', '弃购率', '平均价格']
product_stats = product_stats.sort_values('弃购率', ascending=False)

print("高弃购率商品（Top 10）：")
print(product_stats.head(10))
print()

# 验证
assert df[df['是否弃购'] == 1].shape[0] > 0, "没有弃购订单"
assert not pd.isna(avg_abandon_value), "未能计算平均弃购价值"
print("✓ 弃购数据分析完成！")
`,
    tips: ['弃购率 = 弃购订单数 / 总订单数', '支付时间缺失不等于弃购，需要结合是否支付字段', '弃购等待时长可以分析用户决策时间']
  },
  {
    id: 'cart-project-2',
    chapterId: 'chapter-24',
    title: '购物车关联规则挖掘准备（支持→置信度计算）',
    description: '按交易ID聚合为购物篮格式，计算{牛奶}→{面包}的支持度、置信度。',
    difficulty: '基础',
    skills: ['购物篮格式', '关联规则', '支持度', '置信度'],
    initialCode: `import pandas as pd
import numpy as np

# 创建模拟交易数据
np.random.seed(42)
n_transactions = 100

products = ['牛奶', '面包', '黄油', '鸡蛋', '酸奶', '可乐', '薯片', '饼干', '咖啡', '啤酒']

transactions = []
for trans_id in range(1, n_transactions+1):
    # 每个交易1-5个商品
    n_items = np.random.randint(1, 6)
    items = np.random.choice(products, n_items, replace=False)
    for item in items:
        transactions.append({
            '交易ID': trans_id,
            '商品名': item
        })

df = pd.DataFrame(transactions)
print("交易明细数据前15行：")
print(df.head(15))
print()

# 按交易ID聚合为购物篮格式
basket = df.groupby('交易ID')['商品名'].apply(list).reset_index()
basket.columns = ['交易ID', '购物篮']
print("购物篮格式（前10个）：")
print(basket.head(10))
print()

total_trans = len(basket)
print(f"总交易数: {total_trans}")
print()

# 计算单个商品的支持度
item_support = df.groupby('商品名')['交易ID'].nunique() / total_trans
print("商品支持度（出现频率）：")
print(item_support.sort_values(ascending=False).round(4))
print()

# 计算商品共现集合
def get_item_transactions(item):
    """获取包含指定商品的交易ID集合"""
    return set(df[df['商品名'] == item]['交易ID'])

# 计算 {牛奶} 和 {面包} 的支持度和置信度
milk_trans = get_item_transactions('牛奶')
bread_trans = get_item_transactions('面包')
both_trans = milk_trans & bread_trans  # 同时购买牛奶和面包的交易

# 计算支持度
support_milk = len(milk_trans) / total_trans
support_bread = len(bread_trans) / total_trans
support_both = len(both_trans) / total_trans

# 计算置信度 {牛奶} → {面包}
confidence_milk_to_bread = support_both / support_milk if support_milk > 0 else 0

print("关联规则分析：{牛奶} → {面包}")
print("-" * 40)
print(f"牛奶出现次数: {len(milk_trans)}")
print(f"面包出现次数: {len(bread_trans)}")
print(f"同时出现次数: {len(both_trans)}")
print()
print(f"Support(牛奶) = {support_milk:.4f}")
print(f"Support(面包) = {support_bread:.4f}")
print(f"Support(牛奶, 面包) = {support_both:.4f}")
print(f"Confidence(牛奶→面包) = {confidence_milk_to_bread:.4f}")
print()

# 找出所有强关联规则
print("Top 10 关联规则（按置信度）：")
rules = []
for item1 in products:
    for item2 in products:
        if item1 != item2:
            set1 = get_item_transactions(item1)
            set2 = get_item_transactions(item2)
            both = set1 & set2
            
            if len(set1) > 0:
                supp1 = len(set1) / total_trans
                supp_both = len(both) / total_trans
                conf = supp_both / supp1
                
                if conf > 0.3:  # 只显示置信度>30%的规则
                    rules.append({
                        '前项': item1,
                        '后项': item2,
                        '支持度': round(supp_both, 4),
                        '置信度': round(conf, 4)
                    })

rules_df = pd.DataFrame(rules)
if len(rules_df) > 0:
    print(rules_df.sort_values('置信度', ascending=False).head(10))

assert len(both_trans) > 0, "没有找到共现商品"
print("\\n✓ 关联规则计算完成！")
`,
    tips: ['支持度 = 同时包含A和B的交易数 / 总交易数', '置信度 = Support(A,B) / Support(A)', '提升度 = Confidence(A→B) / Support(B)']
  },
  {
    id: 'cart-project-3',
    chapterId: 'chapter-25',
    title: 'RFM用户价值分层（不使用现成库）',
    description: '计算R（最近消费天数）、F（频次）、M（总金额），将用户按百分位数分为高中低三档。',
    difficulty: '进阶',
    skills: ['RFM模型', '用户分层', '百分位数', '价值评估'],
    initialCode: `import pandas as pd
import numpy as np
from datetime import datetime

# 创建模拟销售数据
np.random.seed(42)
n_users = 50
reference_date = datetime(2024, 2, 1)

data = []
for user_id in range(1, n_users+1):
    n_purchases = np.random.randint(1, 20)
    for _ in range(n_purchases):
        days_ago = np.random.randint(1, 60)
        purchase_date = reference_date - pd.Timedelta(days=days_ago)
        amount = np.random.normal(150, 50, 1)[0].round(2)
        data.append({
            '用户ID': user_id,
            '消费日期': purchase_date,
            '金额': max(amount, 20)
        })

df = pd.DataFrame(data)
print("销售明细数据前10行：")
print(df.head(10))
print()

# 计算 RFM
rfm = df.groupby('用户ID').agg({
    '消费日期': lambda x: (reference_date - x.max()).days,  # R: 最近消费天数
    '用户ID': 'count',  # F: 频次
    '金额': 'sum'  # M: 总金额
}).reset_index()

rfm.columns = ['用户ID', 'R', 'F', 'M']
print("RFM原始值（前15用户）：")
print(rfm.head(15))
print()

# 使用百分位数分层（不分档，使用qcut直接分3档）
# R: 越小越好（越近越好），所以标签反转
rfm['R_score'] = pd.qcut(rfm['R'], 3, labels=[3, 2, 1]).astype(int)
# F: 越大越好
rfm['F_score'] = pd.qcut(rfm['F'].rank(method='first'), 3, labels=[1, 2, 3]).astype(int)
# M: 越大越好
rfm['M_score'] = pd.qcut(rfm['M'].rank(method='first'), 3, labels=[1, 2, 3]).astype(int)

# 计算总分
rfm['总分'] = rfm['R_score'].astype(int) + rfm['F_score'].astype(int) + rfm['M_score'].astype(int)

print("RFM分层结果（前15用户）：")
print(rfm.head(15))
print()

# 用户分层
def classify_user(row):
    total = row['总分']
    if total >= 7:
        return '高价值用户'
    elif total >= 5:
        return '中价值用户'
    else:
        return '低价值用户'

rfm['用户分层'] = rfm.apply(classify_user, axis=1)

# 分层统计
print("用户分层统计：")
layer_stats = rfm.groupby('用户分层').agg({
    '用户ID': 'count',
    'R': 'mean',
    'F': 'mean',
    'M': 'mean',
    '总分': 'mean'
}).round(2)
layer_stats.columns = ['用户数', '平均R(最近天数)', '平均F(频次)', '平均M(金额)', '平均总分']
print(layer_stats)
print()

# 高价值用户明细
high_value = rfm[rfm['总分'] >= 7]
print(f"高价值用户（总分>=7）: {len(high_value)} 人")
print(high_value[['用户ID', 'R', 'F', 'M', '总分', '用户分层']].sort_values('总分', ascending=False))
print()

# 验证
assert '高价值用户' in rfm['用户分层'].values, "没有高价值用户"
assert rfm['总分'].max() <= 9, "总分计算错误"
print("✓ RFM用户分层完成！")
`,
    tips: ['R越小（F分数越高）、F越大（F分数越高）、M越大（M分数越高）', '总分范围是3-9分', '可以使用qcut自动将数据分成若干等份']
  },
  {
    id: 'cart-project-4',
    chapterId: 'chapter-26',
    title: 'K-Means用户分群（基于消费行为）',
    description: '使用sklearn.cluster.KMeans进行用户分群，分析不同簇的购物车商品类目偏好。',
    difficulty: '进阶',
    skills: ['K-Means聚类', '特征工程', '标准化', '消费行为分析'],
    initialCode: `import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

# 创建模拟用户消费数据
np.random.seed(42)
n_users = 100

# 构造有明显分群特征的数据
data = []
for i in range(n_users):
    if i < 35:
        # 群体1：高消费、低频次、折扣敏感度低
        monthly_amount = np.random.normal(5000, 800)
        monthly_freq = np.random.normal(3, 1)
        discount_sensitivity = np.random.normal(0.1, 0.05)  # 低折扣敏感
    elif i < 70:
        # 群体2：中等消费、中等频次
        monthly_amount = np.random.normal(2000, 400)
        monthly_freq = np.random.normal(8, 2)
        discount_sensitivity = np.random.normal(0.25, 0.08)  # 中等折扣敏感
    else:
        # 群体3：低消费、高频次、折扣敏感度高
        monthly_amount = np.random.normal(600, 150)
        monthly_freq = np.random.normal(15, 3)
        discount_sensitivity = np.random.normal(0.4, 0.1)  # 高折扣敏感
    
    data.append({
        '用户ID': i + 1,
        '月消费额': max(monthly_amount, 200),
        '月均频次': max(monthly_freq, 1),
        '折扣敏感度': max(discount_sensitivity, 0.01)
    })

df = pd.DataFrame(data)
print("用户消费行为数据（前10行）：")
print(df.head(10))
print()

# 特征标准化
features = ['月消费额', '月均频次', '折扣敏感度']
X = df[features]

scaler = StandardScaler()
scaled = scaler.fit_transform(X)
print("标准化后的特征统计：")
print(pd.DataFrame(scaled, columns=features).describe().round(2))
print()

# K-Means 聚类
n_clusters = 3
kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
df['cluster'] = kmeans.fit_predict(scaled)

print(f"K-Means 聚类结果（k={n_clusters}）：")
print()

# 分析每个簇的特征
cluster_stats = df.groupby('cluster').agg({
    '用户ID': 'count',
    '月消费额': 'mean',
    '月均频次': 'mean',
    '折扣敏感度': 'mean'
}).round(2)
cluster_stats.columns = ['用户数', '平均月消费额', '平均月频次', '平均折扣敏感度']
print(cluster_stats)
print()

# 为每个簇命名
cluster_names = {}
for cluster_id in range(n_clusters):
    cluster_data = cluster_stats.loc[cluster_id]
    if cluster_data['平均月消费额'] > 4000:
        cluster_names[cluster_id] = '高价值低频用户'
    elif cluster_data['平均月消费额'] > 1500:
        cluster_names[cluster_id] = '中等价值用户'
    else:
        cluster_names[cluster_id] = '高频低额用户'

df['用户群名称'] = df['cluster'].map(cluster_names)

print("各用户群特征：")
for cluster_id, name in cluster_names.items():
    cluster_data = df[df['cluster'] == cluster_id]
    print(f"\\n{name}（簇{cluster_id}）：")
    print(f"  用户数: {len(cluster_data)}")
    print(f"  平均月消费: ¥{cluster_data['月消费额'].mean():.2f}")
    print(f"  平均月频次: {cluster_data['月均频次'].mean():.1f}次")
    print(f"  折扣敏感度: {cluster_data['折扣敏感度'].mean():.2%}")

# 验证
assert len(set(df['cluster'])) == n_clusters, "聚类数量不正确"
print("\\n✓ K-Means用户分群完成！")
`,
    tips: ['K-Means前需要先标准化特征', '可以用肘部法则确定最佳k值', '聚类后要为每个群体赋予业务含义']
  },
  {
    id: 'cart-project-5',
    chapterId: 'chapter-27',
    title: '购物车加购→支付转化漏斗分析',
    description: '按session计算加购→支付转化率，识别高加购但低支付的商品。',
    difficulty: '进阶',
    skills: ['转化漏斗', 'Session分析', '支付转化率', '商品分析'],
    initialCode: `import pandas as pd
import numpy as np

# 创建模拟用户行为日志
np.random.seed(42)
n_sessions = 200

data = []
for session_id in range(1, n_sessions+1):
    user_id = np.random.randint(1, 51)
    n_events = np.random.randint(1, 8)
    
    events = []
    for i in range(n_events):
        event_type = np.random.choice(['加购', '支付', '删除'], p=[0.6, 0.3, 0.1])
        events.append({
            'session_id': session_id,
            '用户ID': user_id,
            '事件类型': event_type,
            '商品ID': np.random.randint(1, 21)
        })
    data.extend(events)

df = pd.DataFrame(data)
print("用户行为日志前20行：")
print(df.head(20))
print()

# 按session和事件类型统计
funnel = df.groupby(['session_id', '事件类型']).size().unstack(fill_value=0)
print("转化漏斗统计（每session各事件数量）：")
print(funnel.head(10))
print()

# 计算每个session的转化率
funnel['总加购数'] = funnel.get('加购', 0)
funnel['总支付数'] = funnel.get('支付', 0)
funnel['转化率'] = (funnel['总支付数'] / funnel['总加购数']).replace([np.inf, -np.inf], 0).fillna(0)

print("转化率统计（前15个session）：")
print(funnel[['总加购数', '总支付数', '转化率']].head(15))
print()

# 整体转化漏斗
total_add_to_cart = (df['事件类型'] == '加购').sum()
total_purchase = (df['事件类型'] == '支付').sum()
total_abandon = (df['事件类型'] == '删除').sum()

print("=" * 50)
print("整体转化漏斗")
print("=" * 50)
print(f"加购总数: {total_add_to_cart}")
print(f"支付总数: {total_purchase}")
print(f"删除总数: {total_abandon}")
print(f"加购→支付转化率: {total_purchase/total_add_to_cart:.2%}")
print()

# 按商品分析转化率
product_funnel = df.groupby(['商品ID', '事件类型']).size().unstack(fill_value=0)
product_funnel['加购数'] = product_funnel.get('加购', 0)
product_funnel['支付数'] = product_funnel.get('支付', 0)
product_funnel['转化率'] = (product_funnel['支付数'] / product_funnel['加购数']).replace([np.inf, -np.inf], 0).fillna(0)

product_funnel = product_funnel.sort_values('转化率', ascending=False)

print("商品转化率排名（Top 15）：")
print(product_funnel[['加购数', '支付数', '转化率']].head(15).round(4))
print()

# 识别高加购但低支付的商品
high_cart_low_pay = product_funnel[
    (product_funnel['加购数'] > product_funnel['加购数'].median()) & 
    (product_funnel['转化率'] < product_funnel['转化率'].median())
]

print("高加购但低支付商品（需要优化）：")
print(high_cart_low_pay[['加购数', '支付数', '转化率']].sort_values('转化率'))
print()

# 验证
assert total_add_to_cart > 0, "没有加购数据"
assert total_purchase >= 0, "支付数据异常"
print("✓ 转化漏斗分析完成！")
`,
    tips: ['转化率 = 支付数 / 加购数', '高加购低支付商品可能需要优化价格或详情页', '可以用漏斗图可视化转化路径']
  },
  {
    id: 'cart-project-6',
    chapterId: 'chapter-28',
    title: '异常购物车行为检测（孤立森林）',
    description: '使用sklearn.ensemble.IsolationForest标记异常购物车，输出异常购物车的典型特征。',
    difficulty: '进阶',
    skills: ['异常检测', 'IsolationForest', '刷单识别', '行为分析'],
    initialCode: `import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest

# 创建模拟购物车数据（包含正常和异常）
np.random.seed(42)
n_carts = 500

data = []

# 正常购物车（95%）
for i in range(int(n_carts * 0.95)):
    data.append({
        '购物车ID': i + 1,
        '商品数': np.random.randint(1, 8),
        '总价': np.random.uniform(50, 800),
        '优惠券使用次数': np.random.randint(0, 3)
    })

# 异常购物车（5%）：刷单/测试单
for i in range(int(n_carts * 0.03)):
    # 极端高价
    data.append({
        '购物车ID': len(data) + 1,
        '商品数': np.random.randint(1, 5),
        '总价': np.random.uniform(5000, 10000),  # 异常高价
        '优惠券使用次数': np.random.randint(0, 2)
    })

# 更多异常类型
for i in range(int(n_carts * 0.02)):
    # 大量使用优惠券
    data.append({
        '购物车ID': len(data) + 1,
        '商品数': np.random.randint(1, 3),
        '总价': np.random.uniform(100, 300),
        '优惠券使用次数': np.random.randint(5, 10)  # 异常高优惠券
    })

df = pd.DataFrame(data)
print(f"购物车数据总数: {len(df)}")
print("购物车数据前10行：")
print(df.head(10))
print()
print("数据统计：")
print(df.describe().round(2))
print()

# 使用 IsolationForest 进行异常检测
features = ['商品数', '总价', '优惠券使用次数']
X = df[features]

model = IsolationForest(contamination=0.05, random_state=42, n_estimators=100)
df['异常分'] = model.fit_predict(X)  # -1 表示异常, 1 表示正常
df['异常概率'] = model.decision_function(X)

print("IsolationForest 异常检测结果：")
print(f"正常购物车数: {(df['异常分'] == 1).sum()}")
print(f"异常购物车数: {(df['异常分'] == -1).sum()}")
print()

# 异常购物车详情
anomalies = df[df['异常分'] == -1]
print("异常购物车典型特征：")
print(anomalies.describe().round(2))
print()

# 分析异常类型
print("异常购物车样本（前20个）：")
print(anomalies.head(20).sort_values('异常概率'))
print()

# 按异常特征分类
high_price_anomalies = anomalies[anomalies['总价'] > 1000]
high_coupon_anomalies = anomalies[anomalies['优惠券使用次数'] >= 5]

print(f"高总价异常: {len(high_price_anomalies)} 个")
print(f"高优惠券异常: {len(high_coupon_anomalies)} 个")
print()

# 计算异常得分分布
print("异常概率分布：")
print(f"最低异常概率: {df['异常概率'].min():.4f}")
print(f"最高异常概率: {df['异常概率'].max():.4f}")
print(f"平均异常概率: {df['异常概率'].mean():.4f}")
print()

# 验证
assert len(anomalies) > 0, "没有检测到异常"
assert len(anomalies) / len(df) < 0.1, "异常比例过高"
print("✓ 异常购物车行为检测完成！")
`,
    tips: ['contamination参数表示预期的异常比例', '异常分=-1表示异常，1表示正常', '可以用decision_function查看异常程度']
  },
  {
    id: 'cart-project-7',
    chapterId: 'chapter-29',
    title: '时序购物车趋势预测（移动平均/指数平滑）',
    description: '使用pandas.rolling计算7日均线，识别周末效应及促销日峰值。',
    difficulty: '进阶',
    skills: ['时间序列', '移动平均', '趋势预测', '周末效应'],
    initialCode: `import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# 创建模拟时间序列数据（包含趋势、周末效应、促销日）
np.random.seed(42)
n_days = 90
start_date = datetime(2024, 1, 1)

dates = []
carts_created = []
purchases = []

base_cart = 100
base_purchase_rate = 0.6

for i in range(n_days):
    current_date = start_date + timedelta(days=i)
    dates.append(current_date)
    
    # 基础趋势（缓慢增长）
    trend = 100 + i * 0.5
    
    # 周末效应（周末高20%）
    if current_date.weekday() >= 5:  # 周六、周日
        weekend_effect = 1.2
    else:
        weekend_effect = 1.0
    
    # 促销日效应（每月10号、20号打9折）
    if current_date.day in [10, 20]:
        promotion_effect = 1.5
    else:
        promotion_effect = 1.0
    
    # 计算购物车创建数
    daily_cart = int(base_cart * trend / 100 * weekend_effect * promotion_effect + np.random.normal(0, 10))
    carts_created.append(max(daily_cart, 50))
    
    # 计算支付数（受转化率影响）
    purchase_rate = base_purchase_rate * (0.9 if current_date.weekday() >= 5 else 1.0)
    daily_purchase = int(daily_cart * purchase_rate + np.random.normal(0, 5))
    purchases.append(max(daily_purchase, 20))

df = pd.DataFrame({
    '日期': dates,
    '购物车创建数': carts_created,
    '支付数': purchases
})
df.set_index('日期', inplace=True)

print("时序数据前20天：")
print(df.head(20))
print()

# 计算7日移动平均
df['车量_7d_avg'] = df['购物车创建数'].rolling(7, center=True).mean()
df['支付_7d_avg'] = df['支付数'].rolling(7, center=True).mean()

# 计算支付率
df['支付率'] = df['支付数'] / df['购物车创建数']
df['支付率_7d'] = df['支付率'].rolling(7, center=True).mean()

print("移动平均统计（最近20天）：")
print(df[['购物车创建数', '车量_7d_avg', '支付数', '支付率', '支付率_7d']].tail(20).round(4))
print()

# 周末效应分析
df['星期'] = df.index.dayofweek
weekend_data = df[df['星期'] >= 5]
weekday_data = df[df['星期'] < 5]

print("周末 vs 工作日效应：")
print(f"工作日平均购物车创建数: {weekday_data['购物车创建数'].mean():.1f}")
print(f"周末平均购物车创建数: {weekend_data['购物车创建数'].mean():.1f}")
print(f"周末提升幅度: {(weekend_data['购物车创建数'].mean() / weekday_data['购物车创建数'].mean() - 1) * 100:.1f}%")
print()

# 促销日识别
df['是否促销日'] = df.index.day.isin([10, 20])
promotion_data = df[df['是否促销日']]
normal_data = df[~df['是否促销日']]

print("促销日 vs 普通日：")
print(f"普通日平均购物车创建数: {normal_data['购物车创建数'].mean():.1f}")
print(f"促销日平均购物车创建数: {promotion_data['购物车创建数'].mean():.1f}")
print()

# 识别峰值日期
threshold = df['购物车创建数'].mean() + 2 * df['购物车创建数'].std()
peak_days = df[df['购物车创建数'] > threshold]

print(f"峰值日期识别（>均值+2σ = {threshold:.0f}）：")
print(peak_days[['购物车创建数', '车量_7d_avg']].sort_values('购物车创建数', ascending=False))
print()

# 验证
assert len(df['车量_7d_avg'].dropna()) > 0, "移动平均计算失败"
assert df['支付率'].mean() > 0, "支付率计算失败"
print("✓ 时序趋势分析完成！")
`,
    tips: ['rolling(7)计算7日移动平均', 'center=True让均值居中', '可以用shift()做预测而不是平滑']
  },
  {
    id: 'cart-project-8',
    chapterId: 'chapter-30',
    title: '基于购物车内容的交叉销售推荐验证',
    description: '构建共现矩阵，对给定商品推荐最常一起加购的商品配件。',
    difficulty: '进阶',
    skills: ['交叉销售', '共现矩阵', '推荐系统', '商品关联'],
    initialCode: `import pandas as pd
import numpy as np

# 创建模拟购物车数据
np.random.seed(42)
n_carts = 300

# 定义商品关联
product_rules = {
    '手机': ['手机壳', '钢化膜', '充电宝', '蓝牙耳机'],
    '笔记本电脑': ['鼠标', '键盘', '电脑包'],
    'T恤': ['牛仔裤', '运动鞋'],
    '奶粉': ['奶瓶', '纸尿裤']
}

# 生成购物车数据
data = []
for cart_id in range(1, n_carts+1):
    # 70%的购物车包含关联商品对
    if np.random.random() < 0.7:
        base_product = np.random.choice(list(product_rules.keys()))
        related_products = product_rules[base_product]
        n_related = np.random.randint(1, len(related_products)+1)
        items = [base_product] + list(np.random.choice(related_products, n_related, replace=False))
    else:
        # 30%随机商品
        all_products = ['手机', '手机壳', '钢化膜', '充电宝', '蓝牙耳机', 
                       '笔记本电脑', '鼠标', '键盘', '电脑包', 'T恤', 
                       '牛仔裤', '运动鞋', '奶粉', '奶瓶', '纸尿裤']
        n_items = np.random.randint(1, 4)
        items = np.random.choice(all_products, n_items, replace=False)
    
    for item in items:
        data.append({
            '购物车ID': cart_id,
            '商品名': item
        })

df = pd.DataFrame(data)
print("购物车商品明细数据（前20行）：")
print(df.head(20))
print()

# 构建共现矩阵
co_occur = df.pivot_table(index='购物车ID', columns='商品名', aggfunc='size', fill_value=0)
print(f"共现矩阵形状: {co_occur.shape}")
print("共现矩阵（前5个购物车）：")
print(co_occur.head())
print()

# 计算商品共现次数矩阵
co_occur_T = co_occur.T.dot(co_occur)
print("商品共现矩阵（Top 5）：")
print(co_occur_T.iloc[:5, :5])
print()

# 交叉销售推荐：为指定商品推荐配件
def recommend_accessories(target_product, co_occur_matrix, top_n=3):
    """为目标商品推荐配件"""
    if target_product not in co_occur_matrix.columns:
        return []
    
    # 获取与目标商品共现的次数
    co_counts = co_occur_matrix[target_product].copy()
    
    # 排除自身
    co_counts = co_counts.drop(target_product, errors='ignore')
    
    # 获取目标商品的出现次数
    target_count = co_occur_matrix[target_product][target_product]
    
    # 计算共现率
    co_rate = (co_counts / target_count).sort_values(ascending=False)
    
    # 返回Top N推荐
    recommendations = co_rate.head(top_n)
    return recommendations

# 为"手机"推荐配件
target = '手机'
recommendations = recommend_accessories(target, co_occur_T, top_n=3)

print(f"为 '{target}' 推荐的配件（Top 3）：")
for product, rate in recommendations.items():
    print(f"  {product}: 共现率 {rate:.2%}")

# 完整推荐列表
print(f"\\n'{target}' 的完整配件推荐：")
all_recommendations = recommend_accessories(target, co_occur_T, top_n=len(co_occur_T))
for product, rate in all_recommendations.items():
    print(f"  {product}: {rate:.2%}")

# 多商品推荐示例
print("\\n其他商品推荐：")
for product in ['笔记本电脑', 'T恤', '奶粉']:
    recs = recommend_accessories(product, co_occur_T, top_n=3)
    if len(recs) > 0:
        print(f"  {product} → {', '.join(recs.index[:3])}")

# 验证
assert target in co_occur_T.columns, "目标商品不在共现矩阵中"
assert len(recommendations) > 0, "没有找到推荐"
print("\\n✓ 交叉销售推荐完成！")
`,
    tips: ['共现率 = A和B同时出现的次数 / A出现的次数', '可以按共现次数或共现率排序', '关联商品对可以用于商品捆绑销售']
  },
  {
    id: 'cart-project-9',
    chapterId: 'chapter-31',
    title: '购物车放弃原因归因（决策树/分组均值对比）',
    description: '分组对比弃购/支付用户的平均运费和优惠券金额，使用pandas.cut计算各箱弃购率。',
    difficulty: '进阶',
    skills: ['归因分析', '决策树', '弃购分析', '价格敏感度'],
    initialCode: `import pandas as pd
import numpy as np

# 创建模拟购物车数据
np.random.seed(42)
n_carts = 500

# 生成运费数据（0-100元）
freight = np.random.exponential(scale=15, size=n_carts).clip(0, 100)

# 生成优惠券金额（0-50元，与运费负相关）
coupon = (50 - freight * 0.3 + np.random.normal(0, 10)).clip(0, 50)

# 页面停留时间（秒）
stay_time = np.random.exponential(scale=120, size=n_carts)

# 生成是否弃购（与多个因素相关）
# 高运费、高页面停留时间更容易弃购
# 高优惠券更容易支付
prob_abandon = (
    0.4 +  # 基础弃购率
    freight / 200 +  # 运费越高越可能弃购
    (stay_time > 300).astype(float) * 0.2 -  # 停留太久可能放弃
    coupon / 100 -  # 优惠券越高越可能支付
    0.1
)
is_abandon = (np.random.random(n_carts) < prob_abandon).astype(int)

df = pd.DataFrame({
    '购物车ID': range(1, n_carts+1),
    '运费': freight.round(2),
    '优惠券金额': coupon.round(2),
    '页面停留时间': stay_time.round(0).astype(int),
    '是否弃购': is_abandon
})

print("购物车数据前10行：")
print(df.head(10))
print()

# 分组对比分析
abandon_group = df[df['是否弃购'] == 1]
pay_group = df[df['是否弃购'] == 0]

print("弃购用户 vs 支付用户对比：")
print("-" * 50)
print(f"{'指标':<15} {'弃购用户':<15} {'支付用户':<15}")
print("-" * 50)
print(f"{'平均运费':<15} ¥{abandon_group['运费'].mean():>10.2f}  ¥{pay_group['运费'].mean():>10.2f}")
print(f"{'平均优惠券':<15} ¥{abandon_group['优惠券金额'].mean():>10.2f}  ¥{pay_group['优惠券金额'].mean():>10.2f}")
print(f"{'平均停留时间':<15} {abandon_group['页面停留时间'].mean():>10.0f}秒 {pay_group['页面停留时间'].mean():>10.0f}秒")
print(f"{'人数':<15} {len(abandon_group):>10}  {len(pay_group):>10}")
print()

# 使用pd.cut将运费分箱
bins = [0, 5, 10, 20, 50, 100]
labels = ['0-5元', '5-10元', '10-20元', '20-50元', '50-100元']
df['运费区间'] = pd.cut(df['运费'], bins=bins, labels=labels)

# 计算各箱的弃购率
abandon_rate_by_freight = df.groupby('运费区间', observed=True)['是否弃购'].mean()

print("各运费区间的弃购率：")
for freight_range, rate in abandon_rate_by_freight.items():
    print(f"  {freight_range}: {rate:.2%}")

# 同样对优惠券分箱
coupon_bins = [0, 10, 20, 30, 50]
coupon_labels = ['0-10元', '10-20元', '20-30元', '30-50元']
df['优惠券区间'] = pd.cut(df['优惠券金额'], bins=coupon_bins, labels=coupon_labels)

abandon_rate_by_coupon = df.groupby('优惠券区间', observed=True)['是否弃购'].mean()

print("\\n各优惠券区间的弃购率：")
for coupon_range, rate in abandon_rate_by_coupon.items():
    print(f"  {coupon_range}: {rate:.2%}")
print()

# 交叉分析：运费 × 优惠券
cross_analysis = df.groupby(['运费区间', '优惠券区间'], observed=True)['是否弃购'].agg(['mean', 'count'])
cross_analysis.columns = ['弃购率', '订单数']
cross_analysis = cross_analysis[cross_analysis['订单数'] >= 10]  # 过滤样本少的

print("运费 × 优惠券 交叉分析（样本数>=10）：")
print(cross_analysis.sort_values('弃购率', ascending=False).head(10).round(4))
print()

# 识别高弃购原因
print("=" * 50)
print("弃购原因归因结论")
print("=" * 50)
max_abandon_freight = abandon_rate_by_freight.idxmax()
max_abandon_coupon = abandon_rate_by_coupon.idxmax()
print(f"1. 最高弃购率运费区间: {max_abandon_freight} ({abandon_rate_by_freight[max_abandon_freight]:.2%})")
print(f"2. 最高弃购率优惠券区间: {max_abandon_coupon} ({abandon_rate_by_coupon[max_abandon_coupon]:.2%})")
print(f"3. 建议: 重点优化{labels.index(max_abandon_freight)}元运费区间的用户")
print()

# 验证
assert len(abandon_group) > 0, "没有弃购用户"
assert len(pay_group) > 0, "没有支付用户"
print("✓ 弃购原因归因分析完成！")
`,
    tips: ['弃购率 = 弃购数 / 总订单数', 'pd.cut可以自动将连续变量分箱', '交叉分析可以发现组合因素的影响']
  },
  {
    id: 'cart-project-10',
    chapterId: 'chapter-32',
    title: '聚类后不同群体的购物车价格弹性测试',
    description: '计算每群用户的平均折扣率，验证高价值用户是否对折扣更不敏感（弹性低）。',
    difficulty: '进阶',
    skills: ['价格弹性', '用户分群', '折扣分析', '价值验证'],
    initialCode: `import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

# 创建模拟用户购物车数据
np.random.seed(42)
n_users = 200

# 生成用户特征
data = []
for user_id in range(1, n_users+1):
    # 生成历史购物车数据
    n_carts = np.random.randint(3, 15)
    
    total_original_price = 0
    total_actual_price = 0
    
    for _ in range(n_carts):
        # 原价和实付价
        original_price = np.random.uniform(100, 1000)
        # 高价值用户折扣少，低价值用户折扣多
        if user_id < 60:  # 高价值用户
            discount = np.random.uniform(0.95, 1.0)  # 几乎不打折
        elif user_id < 140:  # 中等价值用户
            discount = np.random.uniform(0.8, 0.95)  # 9折左右
        else:  # 低价值用户
            discount = np.random.uniform(0.6, 0.8)  # 7-8折
        
        actual_price = original_price * discount
        total_original_price += original_price
        total_actual_price += actual_price
    
    data.append({
        '用户ID': user_id,
        '购物车数': n_carts,
        '历史原价总额': total_original_price,
        '历史实付总额': total_actual_price
    })

df = pd.DataFrame(data)

# 计算折扣率
df['折扣率'] = df['历史实付总额'] / df['历史原价总额']

print("用户购物车数据（前10行）：")
print(df.head(10))
print()

# 计算每群用户的平均折扣率
def calculate_group_discount_rate(df_group):
    """计算群组的平均折扣率"""
    total_original = df_group['历史原价总额'].sum()
    total_actual = df_group['历史实付总额'].sum()
    return total_actual / total_original

# 使用K-Means对用户进行分群
features = ['购物车数', '历史原价总额']
X = df[features]
scaler = StandardScaler()
scaled = scaler.fit_transform(X)

kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
df['cluster'] = kmeans.fit_predict(scaled)

# 按簇计算统计信息
cluster_stats = df.groupby('cluster').agg({
    '用户ID': 'count',
    '购物车数': 'mean',
    '历史原价总额': 'mean',
    '历史实付总额': 'mean'
}).round(2)

# 计算每个簇的平均折扣率
cluster_stats['平均折扣率'] = cluster_stats.apply(
    lambda row: row['历史实付总额'] / row['历史原价总额'], axis=1
).round(4)

# 为簇命名
cluster_stats = cluster_stats.sort_values('平均折扣率', ascending=False)
cluster_names = {}
for rank, cluster_id in enumerate(cluster_stats.index):
    if rank == 0:
        cluster_names[cluster_id] = '低折扣用户（高价值）'
    elif rank == 1:
        cluster_names[cluster_id] = '中等折扣用户'
    else:
        cluster_names[cluster_id] = '高折扣用户（价格敏感）'

df['用户群'] = df['cluster'].map(cluster_names)
cluster_stats['用户群名称'] = cluster_stats.index.map(cluster_names)

print("用户群特征分析：")
print(cluster_stats[['用户群名称', '用户ID', '购物车数', '平均折扣率']].rename(
    columns={'用户ID': '用户数', '购物车数': '平均购物车数'}
))
print()

# 验证：高价值用户是否对折扣更不敏感
group_discount_rates = df.groupby('用户群')['折扣率'].mean().sort_values(ascending=False)

print("各用户群平均折扣率排名：")
for group, rate in group_discount_rates.items():
    print(f"  {group}: {rate:.2%}")

print()

# 计算价格敏感度
df['价格敏感'] = df['折扣率'].apply(
    lambda x: '高敏感' if x < 0.8 else ('中敏感' if x < 0.9 else '低敏感')
)

sensitivity_stats = df.groupby('价格敏感').agg({
    '用户ID': 'count',
    '折扣率': 'mean'
}).round(4)
sensitivity_stats.columns = ['用户数', '平均折扣率']

print("价格敏感度分布：")
print(sensitivity_stats.sort_values('平均折扣率'))
print()

# 验证假设
high_value_group = group_discount_rates.index[0]  # 折扣率最高的群
high_value_users = df[df['用户群'] == high_value_group]
other_users = df[df['用户群'] != high_value_group]

print("=" * 50)
print("价格弹性假设验证")
print("=" * 50)
print(f"高价值用户组: {high_value_group}")
print(f"  平均折扣率: {high_value_users['折扣率'].mean():.2%}")
print(f"  平均购物车数: {high_value_users['购物车数'].mean():.1f}")
print()
print(f"其他用户组:")
print(f"  平均折扣率: {other_users['折扣率'].mean():.2%}")
print(f"  平均购物车数: {other_users['购物车数'].mean():.1f}")
print()

# 结论
if high_value_users['折扣率'].mean() > other_users['折扣率'].mean():
    print("✓ 验证通过：高价值用户确实对折扣更不敏感（弹性低）")
    print("  建议：减少对高价值用户的折扣投入，转向价格敏感用户")
else:
    print("⚠️ 验证失败：数据显示相反趋势，需要进一步分析")

# 验证
assert len(set(df['cluster'])) == 3, "聚类数量不正确"
assert df['折扣率'].mean() > 0, "折扣率计算错误"
print("\\n✓ 价格弹性测试完成！")
`,
    tips: ['折扣率 = 实付金额 / 原价金额', '折扣率越高说明打折越少（价格不敏感）', '可以用回归分析量化价格弹性系数']
  },
  {
    id: 'dcp-project-1',
    chapterId: 'chapter-33',
    title: '电商用户购物车行为数据清洗',
    description: '掌握Pandas处理缺失值、重复值、异常值、格式规范化。处理缺失的用户ID和负数数量，去重，转换时间列，筛选加购但未下单数据。',
    difficulty: '基础',
    skills: ['数据清洗', '缺失值处理', '异常值检测', '格式转换'],
    initialCode: `import pandas as pd
import numpy as np
from datetime import datetime

# 生成模拟购物车数据
np.random.seed(42)
n = 1000

data = {
    '用户ID': np.random.randint(1, 51, n),
    '商品ID': np.random.randint(1, 21, n),
    '加购时间': pd.date_range('2024-01-01', periods=n, freq='30min'),
    '数量': np.random.randint(1, 6, n),
    '价格': np.random.uniform(10, 500, n).round(2),
    '是否下单': np.random.choice([0, 1], n, p=[0.3, 0.7])
}

df = pd.DataFrame(data)

# 引入噪声：缺失值、负数、重复、错误格式
df.loc[np.random.choice(n, 50), '用户ID'] = np.nan  # 50个缺失用户ID
df.loc[np.random.choice(n, 30), '数量'] = -np.random.randint(1, 4, 30)  # 30个负数数量
df = pd.concat([df, df.sample(100, random_state=42)], ignore_index=True)  # 重复100行

print("="*60)
print("原始数据统计")
print("="*60)
print(f"原始行数：{len(df)}")
print(f"缺失值统计：")
print(df.isnull().sum())
print()

# 任务1：处理缺失的用户ID - 直接删除
print("="*60)
print("任务1：处理缺失的用户ID")
print("="*60)
df_clean = df.dropna(subset=['用户ID']).copy()
df_clean['用户ID'] = df_clean['用户ID'].astype(int)
print(f"删除缺失后行数：{len(df_clean)}")
print()

# 任务2：处理负数数量 - 设置为1
print("="*60)
print("任务2：处理负数数量")
print("="*60)
negative_count = (df_clean['数量'] < 0).sum()
print(f"负数数量行数：{negative_count}")
df_clean['数量'] = df_clean['数量'].apply(lambda x: max(x, 1))
print()

# 任务3：去重
print("="*60)
print("任务3：去重")
print("="*60)
duplicates = df_clean.duplicated().sum()
df_clean = df_clean.drop_duplicates()
print(f"删除重复后行数：{len(df_clean)}")
print()

# 任务4：转换时间列
print("="*60)
print("任务4：转换时间列")
print("="*60)
df_clean['加购时间'] = pd.to_datetime(df_clean['加购时间'])
print(f"加购时间列类型：{df_clean['加购时间'].dtype}")
print()

# 任务5：筛选加购但未下单数据
print("="*60)
print("任务5：筛选加购但未下单数据")
print("="*60)
df_abandon = df_clean[df_clean['是否下单'] == 0].copy()
print(f"加购但未下单订单数：{len(df_abandon)}")
print(f"整体放弃率：{len(df_abandon)/len(df_clean)*100:.2f}%")
print()

# 输出清洗前后对比
print("="*60)
print("清洗前后对比")
print("="*60)
print(f"清洗前行数：{len(df)}")
print(f"清洗后行数：{len(df_clean)}")
print(f"删除行数：{len(df) - len(df_clean)}")
print()

print("="*60)
print("清洗后数据前10行：")
print(df_clean.head(10))
print()

# 验证
assert df_clean['用户ID'].isnull().sum() == 0, "仍有缺失用户ID"
assert (df_clean['数量'] < 0).sum() == 0, "仍有负数数量"
assert df_clean.duplicated().sum() == 0, "仍有重复行"
print("✓ 数据清洗完成！")
`,
    tips: ['处理缺失值时，考虑业务含义：用户ID缺失直接删除，商品数量缺失可以填充', '异常值处理可以用截断、填充或删除', '时间列一定要转换为datetime类型方便后续分析']
  },
  {
    id: 'dcp-project-2',
    chapterId: 'chapter-34',
    title: 'Web爬取动态商品价格数据并清洗',
    description: '使用requests+BeautifulSoup爬取电商网站商品标题、价格、评价数。解析HTML，提取数值，清洗价格，统一评价数单位。',
    difficulty: '基础',
    skills: ['网络爬虫', '数据采集', 'HTML解析', '数据清洗'],
    initialCode: `import pandas as pd
import numpy as np
import re
from bs4 import BeautifulSoup
import requests

print("="*60)
print("模拟电商网站数据采集")
print("="*60)
print()

# 模拟商品数据（实际项目中通过requests请求真实页面）
products_html = '''
<div class="product-item">
    <h3 class="product-title">iPhone 15 Pro Max 256GB</h3>
    <span class="price">¥8,999.00</span>
    <span class="reviews">12.5万评价</span>
</div>
<div class="product-item">
    <h3 class="product-title">MacBook Air M2 15英寸</h3>
    <span class="price">¥12,499</span>
    <span class="reviews">5.2万评价</span>
</div>
<div class="product-item">
    <h3 class="product-title">AirPods Pro (第二代)</h3>
    <span class="price">¥1,899</span>
    <span class="reviews">35,600评价</span>
</div>
<div class="product-item">
    <h3 class="product-title">iPad Pro 12.9英寸</h3>
    <span class="price">¥9,299.00</span>
    <span class="reviews">8,900评价</span>
</div>
<div class="product-item">
    <h3 class="product-title">Apple Watch Series 9</h3>
    <span class="price">¥3,199</span>
    <span class="reviews">2.1万评价</span>
</div>
'''

soup = BeautifulSoup(products_html, 'html.parser')
product_items = soup.find_all('div', class_='product-item')

data = []
for item in product_items:
    title = item.find('h3', class_='product-title').text.strip()
    price_str = item.find('span', class_='price').text.strip()
    reviews_str = item.find('span', class_='reviews').text.strip()
    
    data.append({
        '商品标题': title,
        '价格': price_str,
        '评价数': reviews_str
    })

df = pd.DataFrame(data)
print("原始数据：")
print(df)
print()
print("原始数据类型：")
print(df.dtypes)
print()

# 任务1：清洗价格
print("="*60)
print("任务1：清洗价格")
print("="*60)
def clean_price(price_str):
    # 移除¥符号和逗号
    cleaned = price_str.replace('¥', '').replace(',', '')
    return float(cleaned)

df['价格_clean'] = df['价格'].apply(clean_price)
print(df[['商品标题', '价格', '价格_clean']])
print()

# 任务2：统一评价数单位
print("="*60)
print("任务2：统一评价数单位")
print("="*60)
def clean_reviews(review_str):
    review_str = review_str.replace('评价', '')
    if '万' in review_str:
        # 处理如 "12.5万" 这样的格式
        num = float(review_str.replace('万', ''))
        return int(num * 10000)
    else:
        # 处理如 "35,600" 这样的格式
        return int(review_str.replace(',', ''))

df['评价数_clean'] = df['评价数'].apply(clean_reviews)
print(df[['商品标题', '评价数', '评价数_clean']])
print()

# 输出清洗后完整数据
print("="*60)
print("清洗后完整数据：")
print(df)
print()
print("清洗后数据类型：")
print(df.dtypes)
print()

# 简单统计
print("="*60)
print("简单统计：")
print("="*60)
print(f"商品平均价格：¥{df['价格_clean'].mean():.2f}")
print(f"总评价数：{df['评价数_clean'].sum():,}")
print(f"最多评价商品：{df.loc[df['评价数_clean'].idxmax(), '商品标题']} ({df['评价数_clean'].max():,}评价)")
print()

# 验证
assert df['价格_clean'].isnull().sum() == 0, "价格清洗存在缺失"
assert df['评价数_clean'].isnull().sum() == 0, "评价数清洗存在缺失"
print("✓ 数据采集与清洗完成！")
`,
    tips: ['实际爬虫时要遵守网站robots.txt协议', '价格清洗要注意货币符号、千分位逗号、小数点等', "评价数经常有'万'这样的单位，需要统一转换"]
  },
  {
    id: 'dcp-project-3',
    chapterId: 'chapter-35',
    title: '购物车关联规则分析（Apriori算法准备）',
    description: '购物车分析的经典场景——找出"经常一起购买"的商品。按订单ID聚合为购物篮，生成0-1矩阵，计算支持度、置信度、提升度。',
    difficulty: '进阶',
    skills: ['关联规则', 'Apriori算法', '支持度', '置信度'],
    initialCode: `import pandas as pd
import numpy as np
from itertools import combinations

np.random.seed(42)

# 商品列表
products = ['牛奶', '面包', '黄油', '鸡蛋', '酸奶', '啤酒', '花生', '纸尿裤', '巧克力', '饼干']

# 生成模拟订单数据
order_data = []
n_orders = 500

for order_id in range(1, n_orders + 1):
    # 随机选择1-5个商品
    num_items = np.random.randint(1, 6)
    items = np.random.choice(products, num_items, replace=False)
    for item in items:
        order_data.append({
            '订单ID': order_id,
            '商品名': item
        })

df = pd.DataFrame(order_data)
print("订单明细（前20行）：")
print(df.head(20))
print()

# 任务1：按订单ID聚合为购物篮
print("="*60)
print("任务1：按订单ID聚合为购物篮")
print("="*60)
basket = df.groupby('订单ID')['商品名'].apply(list).reset_index()
basket.columns = ['订单ID', '购物篮']
print(f"总订单数：{len(basket)}")
print("购物篮格式（前10个）：")
for i in range(min(10, len(basket))):
    print(f"订单{basket.iloc[i]['订单ID']}: {basket.iloc[i]['购物篮']}")
print()

# 任务2：生成0-1矩阵
print("="*60)
print("任务2：生成0-1矩阵")
print("="*60)
matrix = df.pivot_table(index='订单ID', columns='商品名', aggfunc='size', fill_value=0)
print(f"0-1矩阵形状：{matrix.shape}")
print("0-1矩阵（前10行，前6列）：")
print(matrix.iloc[:10, :6])
print()

# 任务3：计算单个商品支持度
print("="*60)
print("任务3：计算单个商品支持度")
print("="*60)
support_single = matrix.mean().sort_values(ascending=False)
print("商品支持度排序：")
print(support_single.round(4))
print()

# 任务4：计算商品对支持度、置信度、提升度
print("="*60)
print("任务4：计算商品对关联规则")
print("="*60)

# 计算两两共现次数
co_occur = matrix.T.dot(matrix)
np.fill_diagonal(co_occur.values, 0)  # 对角线设为0，不考虑自关联

rules = []
for item1 in products:
    for item2 in products:
        if item1 != item2:
            support_both = co_occur.loc[item1, item2] / n_orders
            if support_both > 0:
                support_a = support_single[item1]
                support_b = support_single[item2]
                confidence = support_both / support_a
                lift = confidence / support_b
                
                rules.append({
                    '前件': item1,
                    '后件': item2,
                    '支持度': support_both,
                    '置信度': confidence,
                    '提升度': lift
                })

rules_df = pd.DataFrame(rules)
rules_df = rules_df.sort_values('提升度', ascending=False).reset_index(drop=True)

print("Top 20 关联规则（按提升度排序）：")
print(rules_df[['前件', '后件', '支持度', '置信度', '提升度']].head(20).round(4))
print()

# 输出支持度>0.02的规则
print("="*60)
print("支持度 > 0.02 的强关联规则：")
print("="*60)
strong_rules = rules_df[rules_df['支持度'] > 0.02].sort_values('提升度', ascending=False)
print(strong_rules[['前件', '后件', '支持度', '置信度', '提升度']].round(4))
print()

# 验证
assert len(rules_df) > 0, "没有生成有效规则"
assert len(rules_df[rules_df['提升度'] > 1]) > 0, "没有找到正向关联规则"
print("✓ 关联规则分析完成！")
`,
    tips: ['支持度：商品组合出现的频率', '置信度：购买了A后购买B的概率', '提升度：关联强度，>1表示正相关，<1表示负相关']
  },
  {
    id: 'dcp-project-4',
    chapterId: 'chapter-36',
    title: '用户购物车放弃率分析与预测特征构建',
    description: '分析加购后未下单的原因。合并购物车表+用户行为日志，计算加购到下单的时间差，创建特征，按用户聚合统计历史放弃率。',
    difficulty: '进阶',
    skills: ['放弃率分析', '特征工程', '用户行为分析', '数据合并'],
    initialCode: `import pandas as pd
import numpy as np
from datetime import datetime, timedelta

np.random.seed(42)

# 生成购物车表
cart_data = []
user_ids = list(range(1, 51))
n_cart = 1000

for cart_id in range(1, n_cart + 1):
    user_id = np.random.choice(user_ids)
    add_time = datetime(2024, 1, 1) + timedelta(minutes=np.random.randint(0, 60*24*30))
    quantity = np.random.randint(1, 6)
    price = np.random.uniform(10, 500)
    is_abandon = np.random.choice([0, 1], p=[0.65, 0.35])
    
    # 下单时间（如果不下单则为空）
    order_time = None
    if is_abandon == 0:
        order_time = add_time + timedelta(minutes=np.random.randint(5, 120))
    
    cart_data.append({
        '购物车ID': cart_id,
        '用户ID': user_id,
        '加购时间': add_time,
        '下单时间': order_time,
        '是否放弃': is_abandon,
        '商品数量': quantity,
        '商品价格': price
    })

cart_df = pd.DataFrame(cart_data)

# 生成用户行为日志
behavior_data = []
for cart in cart_data:
    cart_id = cart['购物车ID']
    user_id = cart['用户ID']
    add_time = cart['加购时间']
    
    # 每个购物车会话有若干行为记录
    n_events = np.random.randint(3, 8)
    for i in range(n_events):
        event_time = add_time - timedelta(minutes=np.random.randint(0, 30))
        event_type = np.random.choice(['浏览商品', '加入购物车', '查看购物车', '修改数量'], 
                                     p=[0.5, 0.2, 0.2, 0.1])
        behavior_data.append({
            '会话ID': cart_id,
            '用户ID': user_id,
            '事件时间': event_time,
            '事件类型': event_type
        })

behavior_df = pd.DataFrame(behavior_data)
behavior_df = behavior_df.sort_values(['会话ID', '事件时间']).reset_index(drop=True)

print("="*60)
print("购物车表（前10行）：")
print("="*60)
print(cart_df.head(10))
print()
print("用户行为日志（前20行）：")
print("="*60)
print(behavior_df.head(20))
print()

# 任务1：计算加购到下单的时间差
print("="*60)
print("任务1：计算加购到下单的时间差")
print("="*60)
cart_df['加购时间'] = pd.to_datetime(cart_df['加购时间'])
cart_df['下单时间'] = pd.to_datetime(cart_df['下单时间'])
cart_df['决策时间(分钟)'] = (cart_df['下单时间'] - cart_df['加购时间']).dt.total_seconds() / 60

print(f"放弃订单数：{cart_df['是否放弃'].sum()}")
print(f"完成订单数：{len(cart_df) - cart_df['是否放弃'].sum()}")
print(f"整体放弃率：{cart_df['是否放弃'].mean()*100:.2f}%")
print()

completed_df = cart_df[cart_df['是否放弃'] == 0]
print(f"平均决策时间：{completed_df['决策时间(分钟)'].mean():.1f}分钟")
print()

# 任务2：按时间段分析放弃率
print("="*60)
print("任务2：按时间段分析放弃率")
print("="*60)
cart_df['加购时段'] = pd.cut(
    cart_df['加购时间'].dt.hour,
    bins=[0, 6, 12, 18, 24],
    labels=['凌晨', '上午', '下午', '晚上']
)

abandon_by_hour = cart_df.groupby('加购时段')['是否放弃'].agg(['count', 'mean'])
abandon_by_hour.columns = ['订单数', '放弃率']
print(abandon_by_hour.round(4))
print()

# 任务3：按用户聚合统计历史放弃率
print("="*60)
print("任务3：按用户聚合统计历史放弃率")
print("="*60)
user_features = cart_df.groupby('用户ID').agg({
    '购物车ID': 'count',  # 总购物车次数
    '是否放弃': 'mean',  # 历史放弃率
    '商品数量': 'mean',  # 平均加购数量
    '商品价格': 'mean'  # 平均加购价格
}).reset_index()
user_features.columns = ['用户ID', '总购物车次数', '历史放弃率', '平均加购数量', '平均加购价格']

print("用户特征（前10名）：")
print(user_features.head(10).round(4))
print()

# 输出放弃率最高的用户
print("历史放弃率最高的5个用户：")
top_abandon_users = user_features.sort_values('历史放弃率', ascending=False).head()
print(top_abandon_users.round(4))
print()

# 验证
assert '历史放弃率' in user_features.columns, "特征缺失"
print("✓ 特征工程完成！")
`,
    tips: ['合并表时要注意主键是否对应', '特征工程要考虑业务含义：历史放弃率很可能是预测用户是否放弃的重要特征', '可以按时间维度（小时、周几、月份）来分析用户行为规律']
  },
  {
    id: 'dcp-project-5',
    chapterId: 'chapter-37',
    title: 'RFM用户价值分析（基于购买和加购）',
    description: '将购物车数据转化为用户分层。计算RFM三个维度，分箱并打分，识别高价值用户。',
    difficulty: '进阶',
    skills: ['RFM模型', '用户分层', '价值分析', '分箱操作'],
    initialCode: `import pandas as pd
import numpy as np
from datetime import datetime, timedelta

np.random.seed(42)

# 生成模拟数据：同时包含购买记录和加购记录
n_users = 100
n_records = 2000

# 购买记录
purchase_data = []
for _ in range(n_records):
    user_id = np.random.randint(1, n_users + 1)
    purchase_date = datetime(2024, 1, 1) + timedelta(days=np.random.randint(0, 90))
    amount = np.random.normal(200, 80)
    purchase_data.append({
        '用户ID': user_id,
        '日期': purchase_date,
        '金额': max(amount, 10),
        '类型': '购买'
    })

# 加购记录
cart_data = []
for _ in range(n_records * 2):
    user_id = np.random.randint(1, n_users + 1)
    cart_date = datetime(2024, 1, 1) + timedelta(days=np.random.randint(0, 90))
    amount = np.random.normal(150, 60)
    cart_data.append({
        '用户ID': user_id,
        '日期': cart_date,
        '金额': max(amount, 5),
        '类型': '加购'
    })

df = pd.DataFrame(purchase_data + cart_data)
df['日期'] = pd.to_datetime(df['日期'])
print(f"总记录数：{len(df)}")
print("数据前10行：")
print(df.head(10))
print()

reference_date = datetime(2024, 4, 1)
print(f"参考日期：{reference_date}")
print()

# 任务1：基于购买记录计算RFM
print("="*60)
print("任务1：基于购买记录计算RFM")
print("="*60)
purchase_df = df[df['类型'] == '购买'].copy()

rfm_purchase = purchase_df.groupby('用户ID').agg({
    '日期': lambda x: (reference_date - x.max()).days,  # R：最近消费天数
    '金额': ['count', 'sum']  # F：消费频次，M：消费金额
}).reset_index()

rfm_purchase.columns = ['用户ID', 'R_购买', 'F_购买', 'M_购买']
print("购买RFM（前15名）：")
print(rfm_purchase.head(15).round(2))
print()

# 任务2：基于加购记录计算RFM
print("="*60)
print("任务2：基于加购记录计算RFM")
print("="*60)
cart_only_df = df[df['类型'] == '加购'].copy()

rfm_cart = cart_only_df.groupby('用户ID').agg({
    '日期': lambda x: (reference_date - x.max()).days,  # R：最近加购天数
    '金额': ['count', 'sum']  # F：加购频次，M：加购金额
}).reset_index()

rfm_cart.columns = ['用户ID', 'R_加购', 'F_加购', 'M_加购']
print("加购RFM（前15名）：")
print(rfm_cart.head(15).round(2))
print()

# 任务3：合并两个RFM
print("="*60)
print("任务3：合并RFM并分箱打分")
print("="*60)
rfm_combined = pd.merge(rfm_purchase, rfm_cart, on='用户ID', how='outer').fillna(0)

# 对R分箱（R越小越好，所以标签反转）
rfm_combined['R_购买_score'] = pd.qcut(rfm_combined['R_购买'], q=4, labels=[4, 3, 2, 1]).astype(int)
# 对F分箱（F越大越好）
rfm_combined['F_购买_score'] = pd.qcut(rfm_combined['F_购买'].rank(method='first'), q=4, labels=[1, 2, 3, 4]).astype(int)
# 对M分箱（M越大越好）
rfm_combined['M_购买_score'] = pd.qcut(rfm_combined['M_购买'].rank(method='first'), q=4, labels=[1, 2, 3, 4]).astype(int)

# 计算总分
rfm_combined['RFM总分'] = rfm_combined['R_购买_score'] + rfm_combined['F_购买_score'] + rfm_combined['M_购买_score']

print("合并后的RFM（前20名）：")
print(rfm_combined.head(20).round(2))
print()

# 任务4：识别高价值用户（RFM总分>=10）
print("="*60)
print("任务4：识别高价值用户")
print("="*60)
high_value_users = rfm_combined[rfm_combined['RFM总分'] >= 10]
print(f"高价值用户数：{len(high_value_users)}")
print(f"高价值用户占比：{len(high_value_users)/len(rfm_combined)*100:.2f}%")
print()
print("高价值用户列表（前10名）：")
print(high_value_users[['用户ID', 'R_购买_score', 'F_购买_score', 'M_购买_score', 'RFM总分']].sort_values('RFM总分', ascending=False).head(10))
print()

# 高价值用户统计
print("高价值用户平均特征：")
print(high_value_users[['R_购买', 'F_购买', 'M_购买']].mean().round(2))
print()

# 验证
assert 'RFM总分' in rfm_combined.columns, "总分计算缺失"
print("✓ RFM用户价值分析完成！")
`,
    tips: ['R(Recency)：最近一次消费/加购时间，越近越好', 'F(Frequency)：消费/加购频次，越频繁越好', 'M(Monetary)：消费/加购金额，越多越好']
  },
  {
    id: 'dcp-project-6',
    chapterId: 'chapter-38',
    title: '购物车商品价格敏感度分析（聚类前置）',
    description: '发现价格弹性不同的用户群。计算每个用户的平均加购价格vs实际成交价格，计算价格敏感度，清洗极值。',
    difficulty: '进阶',
    skills: ['价格敏感度', '价格弹性', '用户行为分析', '数据清洗'],
    initialCode: `import pandas as pd
import numpy as np

np.random.seed(42)

# 生成商品数据
products = pd.DataFrame({
    '商品ID': range(1, 21),
    '商品名称': [f'商品{i}' for i in range(1, 21)],
    '原价': np.random.uniform(50, 500, 20).round(2),
    '品类': np.random.choice(['食品', '电子产品', '服装', '家居'], 20)
})

# 生成加购和成交数据
user_ids = list(range(1, 101))
n_cart_records = 3000

cart_records = []
for _ in range(n_cart_records):
    user_id = np.random.choice(user_ids)
    product = products.sample(1).iloc[0]
    product_id = product['商品ID']
    original_price = product['原价']
    
    # 模拟不同用户对价格敏感度不同：有些用户经常等打折
    if user_id < 30:
        # 高价格敏感型：经常以高折扣购买
        discount_factor = np.random.uniform(0.6, 0.8)
    elif user_id < 70:
        # 中等敏感：偶尔打折
        discount_factor = np.random.uniform(0.8, 0.95)
    else:
        # 低敏感：基本不关心折扣
        discount_factor = np.random.uniform(0.95, 1.0)
    
    actual_price = original_price * discount_factor
    
    # 是否最终购买
    purchased = np.random.choice([0, 1], p=[0.2, 0.8])
    
    cart_records.append({
        '用户ID': user_id,
        '商品ID': product_id,
        '原价': original_price,
        '实付价': actual_price if purchased else np.nan,
        '是否购买': purchased,
        '折扣率': discount_factor if purchased else np.nan
    })

cart_df = pd.DataFrame(cart_records)
print("购物车记录（前20行）：")
print(cart_df.head(20))
print()

# 任务1：计算每个用户的平均加购价格vs实际成交价格
print("="*60)
print("任务1：按用户聚合统计价格信息")
print("="*60)
user_price_stats = cart_df.groupby('用户ID').agg({
    '原价': ['count', 'mean'],  # 加购次数，平均加购原价
    '实付价': ['count', 'mean'],  # 购买次数，平均实付价
    '折扣率': 'mean'  # 平均折扣率
}).reset_index()

user_price_stats.columns = ['用户ID', '加购次数', '平均加购原价', '购买次数', '平均实付价', '平均折扣率']
user_price_stats['购买率'] = user_price_stats['购买次数'] / user_price_stats['加购次数']
user_price_stats = user_price_stats.fillna(0)

print("用户价格统计（前20名）：")
print(user_price_stats.head(20).round(4))
print()

# 任务2：计算价格敏感度
print("="*60)
print("任务2：计算价格敏感度")
print("="*60)
# 价格敏感度 = (平均加购原价 - 平均实付价) / 平均加购原价
# 当没有购买记录时敏感度设为0.5（中等敏感）
user_price_stats['价格敏感度'] = (user_price_stats['平均加购原价'] - user_price_stats['平均实付价']) / user_price_stats['平均加购原价']
user_price_stats.loc[user_price_stats['购买次数'] == 0, '价格敏感度'] = 0.5

print("用户价格敏感度（前20名）：")
print(user_price_stats[['用户ID', '价格敏感度', '平均折扣率', '购买率']].head(20).round(4))
print()

# 任务3：清洗极值
print("="*60)
print("任务3：清洗极值")
print("="*60)
print(f"价格敏感度统计（清洗前）：")
print(user_price_stats['价格敏感度'].describe())
print()

# 将价格敏感度限制在[0, 1]范围内
user_price_stats['价格敏感度_clean'] = user_price_stats['价格敏感度'].clip(0, 1)
print(f"价格敏感度统计（清洗后）：")
print(user_price_stats['价格敏感度_clean'].describe())
print()

# 任务4：划分价格敏感度用户群
print("="*60)
print("任务4：划分价格敏感度用户群")
print("="*60)
user_price_stats['敏感度等级'] = pd.cut(
    user_price_stats['价格敏感度_clean'],
    bins=[-0.001, 0.2, 0.4, 0.6, 0.8, 1.001],
    labels=['极不敏感', '较不敏感', '中等敏感', '较敏感', '极敏感']
)

sensitivity_distribution = user_price_stats['敏感度等级'].value_counts().sort_index()
print("敏感度等级分布：")
print(sensitivity_distribution)
print()

# 每个等级的平均购买率
rate_by_sensitivity = user_price_stats.groupby('敏感度等级')['购买率'].mean().round(4)
print("各敏感度等级的平均购买率：")
print(rate_by_sensitivity)
print()

# 验证
assert '价格敏感度_clean' in user_price_stats.columns, "敏感度清洗结果缺失"
print("✓ 价格敏感度分析完成！")
`,
    tips: ['价格敏感度 = (原价 - 实付价) / 原价', '高敏感用户可能会等待促销才下单', '可以用敏感度来做个性化定价策略']
  },
  {
    id: 'dcp-project-7',
    chapterId: 'chapter-39',
    title: 'K-Means聚类分析用户购物行为',
    description: '核心数据分析技术。标准化特征，肘部法则确定K值，K-Means聚类并标记用户群，分析每个簇的特征解读。',
    difficulty: '进阶',
    skills: ['K-Means聚类', '特征标准化', '肘部法则', '用户分群'],
    initialCode: `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

np.random.seed(42)

# 生成用户购物特征数据
n_users = 200
features = []

for i in range(n_users):
    if i < 50:
        # 群体1：高消费、高放弃率、高价格敏感
        total_spent = np.random.normal(3000, 500)
        abandon_rate = np.random.uniform(0.5, 0.8)
        avg_cart_items = np.random.normal(5, 1)
        price_sensitivity = np.random.normal(0.7, 0.1)
    elif i < 120:
        # 群体2：中等消费、中等放弃率、中等敏感
        total_spent = np.random.normal(1500, 300)
        abandon_rate = np.random.uniform(0.2, 0.5)
        avg_cart_items = np.random.normal(3, 0.8)
        price_sensitivity = np.random.normal(0.4, 0.12)
    else:
        # 群体3：低消费、低放弃率、低敏感
        total_spent = np.random.normal(500, 150)
        abandon_rate = np.random.uniform(0.05, 0.2)
        avg_cart_items = np.random.normal(2, 0.5)
        price_sensitivity = np.random.normal(0.15, 0.08)
    
    features.append({
        '用户ID': i + 1,
        '购物车放弃率': max(abandon_rate, 0),
        '平均加购数量': max(avg_cart_items, 1),
        '价格敏感度': max(price_sensitivity, 0),
        '总消费金额': max(total_spent, 100)
    })

df = pd.DataFrame(features)
print("用户购物行为特征（前20行）：")
print(df.head(20).round(4))
print()

# 任务1：标准化特征
print("="*60)
print("任务1：标准化特征")
print("="*60)
feature_cols = ['购物车放弃率', '平均加购数量', '价格敏感度', '总消费金额']
X = df[feature_cols]

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
print("标准化后特征（前10行）：")
print(pd.DataFrame(X_scaled, columns=feature_cols).head(10).round(4))
print()

# 任务2：肘部法则确定最佳K
print("="*60)
print("任务2：肘部法则确定最佳K")
print("="*60)
inertias = []
k_range = range(2, 11)
for k in k_range:
    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    kmeans.fit(X_scaled)
    inertias.append(kmeans.inertia_)

print(f"K值对应的inertia：")
for k, inertia in zip(k_range, inertias):
    print(f"K={k}, inertia={inertia:.2f}")
print()

# 我们选择K=3
# 任务3：K-Means聚类
print("="*60)
print("任务3：K-Means聚类（K=3）")
print("="*60)
best_k = 3
kmeans = KMeans(n_clusters=best_k, random_state=42, n_init=10)
df['簇标签'] = kmeans.fit_predict(X_scaled)
df['簇标签'] = df['簇标签'].astype(int)

print(f"各簇样本数：")
print(df['簇标签'].value_counts().sort_index())
print()

# 任务4：分析每个簇的特征
print("="*60)
print("任务4：分析每个簇的特征")
print("="*60)
cluster_centers = pd.DataFrame(
    scaler.inverse_transform(kmeans.cluster_centers_),
    columns=feature_cols,
    index=[f'簇{i}' for i in range(best_k)]
)
print("簇中心特征：")
print(cluster_centers.round(4))
print()

# 为每个簇命名
cluster_names = {}
for cluster_id in range(best_k):
    center = cluster_centers.iloc[cluster_id]
    if center['总消费金额'] > 2000:
        cluster_names[cluster_id] = '高价值高敏感型'
    elif center['总消费金额'] > 800:
        cluster_names[cluster_id] = '中等价值平衡型'
    else:
        cluster_names[cluster_id] = '低价值价格不敏感型'

df['用户群名称'] = df['簇标签'].map(cluster_names)
print("用户群分布：")
print(df['用户群名称'].value_counts())
print()

# 输出每个用户群的平均特征
print("各用户群平均特征：")
cluster_means = df.groupby('用户群名称')[feature_cols].mean().round(4)
print(cluster_means)
print()

# 验证
assert '簇标签' in df.columns, "聚类结果缺失"
assert len(df['簇标签'].unique()) == best_k, "簇数量不正确"
print("✓ K-Means聚类分析完成！")
`,
    tips: ['聚类前一定要标准化特征，否则量纲不同会导致结果偏差', '肘部法则通过inertia随K变化找到拐点确定最佳K', '聚类后一定要给每个簇赋予业务含义，解释各个群的特点']
  },
  {
    id: 'dcp-project-8',
    chapterId: 'chapter-40',
    title: 'DBSCAN聚类识别异常购物车行为',
    description: '核心数据分析技术（异常检测）。使用DBSCAN聚类，标记噪声点为"疑似机器人刷购物车"，对比噪声点与正常用户的行为差异。',
    difficulty: '进阶',
    skills: ['DBSCAN聚类', '异常检测', '行为分析', '噪声识别'],
    initialCode: `import pandas as pd
import numpy as np
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler

np.random.seed(42)

# 生成购物车会话数据：包含正常用户和机器人/刷单用户
n_normal = 500
n_bot = 30

# 正常用户特征
normal_sessions = []
for i in range(n_normal):
    # 正常用户：加购频率适中，间隔适中
    cart_count = np.random.poisson(lam=5)  # 平均加购5次
    avg_interval = np.random.normal(loc=15, scale=5)  # 平均间隔15分钟
    max_cart_size = np.random.randint(1, 8)  # 单次加购最多8件
    
    normal_sessions.append({
        '会话ID': i + 1,
        '加购频率': cart_count,
        '平均加购间隔(分钟)': max(avg_interval, 1),
        '单次最大加购数量': max_cart_size,
        '是否异常': 0
    })

# 机器人用户特征
bot_sessions = []
for i in range(n_bot):
    # 机器人用户：加购频率极高，间隔极短，每次加购数量巨大
    cart_count = np.random.poisson(lam=25)  # 平均加购25次
    avg_interval = np.random.normal(loc=2, scale=1)  # 平均间隔2分钟
    max_cart_size = np.random.randint(50, 200)  # 单次加购50-200件
    
    bot_sessions.append({
        '会话ID': n_normal + i + 1,
        '加购频率': cart_count,
        '平均加购间隔(分钟)': max(avg_interval, 0.1),
        '单次最大加购数量': max_cart_size,
        '是否异常': 1
    })

df = pd.DataFrame(normal_sessions + bot_sessions)
print("购物车会话数据（前20行）：")
print(df.head(20))
print()
print("数据统计：")
print(df.describe().round(2))
print()

# 任务1：使用DBSCAN聚类
print("="*60)
print("任务1：使用DBSCAN聚类识别异常")
print("="*60)

feature_cols = ['加购频率', '平均加购间隔(分钟)', '单次最大加购数量']
X = df[feature_cols]

# 标准化
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# DBSCAN聚类（eps=0.5, min_samples=5）
dbscan = DBSCAN(eps=0.5, min_samples=5)
df['簇标签'] = dbscan.fit_predict(X_scaled)

print(f"DBSCAN聚类结果：")
print(f"噪声点标记为-1：{ (df['簇标签'] == -1).sum() } 个")
print(f"簇分配情况：")
print(df['簇标签'].value_counts())
print()

# 任务2：标记可疑用户
print("="*60)
print("任务2：标记疑似机器人刷购物车行为")
print("="*60)
df['是否可疑'] = (df['簇标签'] == -1).astype(int)

print("可疑用户标记结果：")
print(df.groupby('是否可疑').agg({
    '会话ID': 'count',
    '加购频率': 'mean',
    '平均加购间隔(分钟)': 'mean',
    '单次最大加购数量': 'mean'
}).round(2))
print()

# 任务3：对比噪声点与正常用户的行为差异
print("="*60)
print("任务3：对比可疑用户与正常用户的差异")
print("="*60)

# 按DBSCAN标记分组
group_stats = df.groupby('是否可疑').agg({
    '加购频率': ['mean', 'min', 'max'],
    '平均加购间隔(分钟)': ['mean', 'min', 'max'],
    '单次最大加购数量': ['mean', 'min', 'max']
}).round(2)

print("各群体特征对比：")
print(group_stats)
print()

# 输出可疑会话详情
print("可疑会话详情（全部）：")
suspicious_df = df[df['是否可疑'] == 1].sort_values('加购频率', ascending=False)
print(suspicious_df[['会话ID', '加购频率', '平均加购间隔(分钟)', '单次最大加购数量', '簇标签']])
print()

# 验证
print("="*60)
print("验证结果")
print("="*60)
true_positives = ((df['是否异常'] == 1) & (df['是否可疑'] == 1)).sum()
false_positives = ((df['是否异常'] == 0) & (df['是否可疑'] == 1)).sum()
true_negatives = ((df['是否异常'] == 0) & (df['是否可疑'] == 0)).sum()
false_negatives = ((df['是否异常'] == 1) & (df['是否可疑'] == 0)).sum()

print(f"真正例（真异常且被标记为可疑）：{true_positives}")
print(f"假正例（正常但被误判为可疑）：{false_positives}")
print(f"真负例（正常且未误判）：{true_negatives}")
print(f"假负例（真异常但未被标记）：{false_negatives}")
print()

precision = true_positives / (true_positives + false_positives) if (true_positives + false_positives) > 0 else 0
recall = true_positives / (true_positives + false_negatives) if (true_positives + false_negatives) > 0 else 0

print(f"精确率：{precision:.2%}")
print(f"召回率：{recall:.2%}")
print()

assert '是否可疑' in df.columns, "异常标记结果缺失"
print("✓ DBSCAN异常检测完成！")
`,
    tips: ['DBSCAN不需要预先指定聚类数量，可以自动发现任意形状的簇', 'DBSCAN将噪声点标记为-1，这对于异常检测特别有用', 'eps和min_samples是DBSCAN的两个重要参数，需要根据数据分布调整']
  },
  {
    id: 'dcp-project-9',
    chapterId: 'chapter-41',
    title: '购物车到下单的转化漏斗分析+时间序列聚类',
    description: '分析用户从加购到转化的行为路径，并按时间模式聚类。计算每个session的完成率，提取时间序列特征，使用K-Means对转化速度模式聚类。',
    difficulty: '进阶',
    skills: ['转化漏斗', '时间序列', '聚类分析', '行为路径'],
    initialCode: `import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

np.random.seed(42)

# 生成用户会话行为数据
n_sessions = 500

sessions_data = []
events_data = []

for session_id in range(1, n_sessions + 1):
    user_id = np.random.randint(1, 101)
    start_time = datetime(2024, 1, 1) + timedelta(minutes=np.random.randint(0, 60*24*60))
    
    # 生成事件序列
    events = []
    
    # 路径1：快速决策型（快速完成转化）
    if session_id <= 150:
        path = ['浏览商品', '加入购物车', '查看购物车', '结算', '支付成功']
        path_times = [0, 1, 2, 5, 7]
        path_taken = True
    
    # 路径2：犹豫型（多次查看、多次修改数量）
    elif session_id <= 350:
        path = ['浏览商品', '加入购物车', '查看购物车', '加入购物车', '修改数量', 
                '查看购物车', '浏览其他商品', '返回购物车', '结算', '支付成功']
        path_times = [0, 2, 3, 5, 6, 8, 12, 14, 18, 20]
        path_taken = np.random.choice([True, False], p=[0.8, 0.2])
    
    # 路径3：流失型（加购后放弃）
    else:
        path = ['浏览商品', '加入购物车', '查看购物车']
        path_times = [0, 2, 5]
        path_taken = False
    
    for step, (event_type, minutes) in enumerate(zip(path, path_times)):
        event_time = start_time + timedelta(minutes=minutes)
        events_data.append({
            '会话ID': session_id,
            '用户ID': user_id,
            '事件时间': event_time,
            '事件类型': event_type,
            '步骤': step + 1
        })
    
    sessions_data.append({
        '会话ID': session_id,
        '用户ID': user_id,
        '开始时间': start_time,
        '总步骤': len(path),
        '完成时间': timedelta(minutes=path_times[-1]) if path_taken else None,
        '是否完成转化': path_taken,
        '真实类型': '快速决策' if session_id <= 150 else ('犹豫型' if session_id <=350 else '流失型')
    })

sessions_df = pd.DataFrame(sessions_data)
events_df = pd.DataFrame(events_data)

print("会话数据（前20行）：")
print(sessions_df.head(20))
print()
print("事件数据（前30行）：")
print(events_df.head(30))
print()

# 任务1：计算每个session的完成率和转化漏斗
print("="*60)
print("任务1：计算转化漏斗")
print("="*60)
funnel_counts = events_df['事件类型'].value_counts().reindex([
    '浏览商品', '加入购物车', '查看购物车', '修改数量', 
    '浏览其他商品', '返回购物车', '结算', '支付成功'
]).fillna(0)

print("转化漏斗：")
print(funnel_counts)
print()

# 任务2：转化分析
print("="*60)
print("任务2：整体转化分析")
print("="*60)
total_add_cart = (events_df['事件类型'] == '加入购物车').sum()
total_payment = (events_df['事件类型'] == '支付成功').sum()

print(f"加购 → 支付转化率：{total_payment / total_add_cart * 100:.2f}%")
print(f"会话级完成率：{sessions_df['是否完成转化'].mean() * 100:.2f}%")
print()

# 任务3：提取时间序列特征并聚类
print("="*60)
print("任务3：提取特征并聚类")
print("="*60)
session_features = sessions_df.groupby('会话ID').agg({
    '总步骤': 'first',
    '是否完成转化': 'first'
}).reset_index()

# 计算每个会话的时长
def calculate_session_duration(session_id):
    session_events = events_df[events_df['会话ID'] == session_id].sort_values('事件时间')
    if len(session_events) > 1:
        first_time = session_events.iloc[0]['事件时间']
        last_time = session_events.iloc[-1]['事件时间']
        return (last_time - first_time).total_seconds() / 60
    else:
        return 0

session_features['会话时长(分钟)'] = session_features['会话ID'].apply(calculate_session_duration)
session_features['完成转化'] = session_features['是否完成转化'].astype(int)

print("会话特征（前15名）：")
print(session_features.head(15).round(2))
print()

# 使用K-Means对转化速度模式聚类
feature_cols = ['总步骤', '会话时长(分钟)', '完成转化']
X = session_features[feature_cols]
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
session_features['簇标签'] = kmeans.fit_predict(X_scaled)
session_features['簇标签'] = session_features['簇标签'].astype(int)

# 任务4：分析不同聚类组的转化情况
print("="*60)
print("任务4：分析不同聚类组的转化情况")
print("="*60)
cluster_stats = session_features.groupby('簇标签').agg({
    '会话ID': 'count',
    '总步骤': 'mean',
    '会话时长(分钟)': 'mean',
    '完成转化': 'mean'
}).round(2)
cluster_stats.columns = ['会话数', '平均步骤数', '平均会话时长(分钟)', '平均转化率']

print("各聚类组统计：")
print(cluster_stats)
print()

# 验证
assert '簇标签' in session_features.columns, "聚类结果缺失"
print("✓ 转化漏斗与时间序列聚类分析完成！")
`,
    tips: ['转化漏斗可以清晰看到用户在哪个环节流失最多', '可以通过聚类找到不同的用户行为模式', '对于不同的行为模式，可能需要不同的干预策略']
  },
  {
    id: 'dcp-project-10',
    chapterId: 'chapter-42',
    title: '端到端综合项目 - 电商购物车智能分析报告',
    description: '整合所有技术：数据采集→清洗→购物车分析→聚类→业务建议。完成购物车放弃率分析、关联规则挖掘、K-Means聚类，生成带图表的分析报告。',
    difficulty: '综合',
    skills: ['端到端分析', '综合项目', '报告生成', '业务建议'],
    initialCode: `import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score

print("="*70)
print("电商购物车智能分析报告")
print("="*70)
print()
print(f"报告生成时间：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print()

# ===================== 1. 数据生成与加载 =====================
print("="*70)
print("1. 数据生成与加载")
print("="*70)

np.random.seed(42)
n_users = 300
n_records = 5000

# 商品表
products = pd.DataFrame({
    '商品ID': range(1, 21),
    '商品名称': [f'商品{i}' for i in range(1, 21)],
    '原价': np.random.uniform(50, 800, 20).round(2),
    '品类': np.random.choice(['食品', '电子产品', '服装', '家居'], 20)
})

# 用户行为记录表
behavior_records = []
for _ in range(n_records):
    user_id = np.random.randint(1, n_users + 1)
    product = products.sample(1).iloc[0]
    action_time = datetime(2024, 1, 1) + timedelta(minutes=np.random.randint(0, 60*24*60))
    action_type = np.random.choice(['浏览', '加购', '结算', '支付成功'], p=[0.4, 0.3, 0.15, 0.15])
    
    behavior_records.append({
        '用户ID': user_id,
        '商品ID': product['商品ID'],
        '行为时间': action_time,
        '行为类型': action_type,
        '商品价格': product['原价']
    })

df_behavior = pd.DataFrame(behavior_records)

print(f"加载数据完成，共{len(df_behavior)}条记录")
print("数据前15行：")
print(df_behavior.head(15))
print()

# ===================== 2. 数据清洗与预处理 =====================
print("="*70)
print("2. 数据清洗与预处理")
print("="*70)

initial_count = len(df_behavior)
df_clean = df_behavior.dropna().copy()
duplicates = df_clean.duplicated().sum()
df_clean = df_clean.drop_duplicates()

print(f"原始行数：{initial_count}")
print(f"删除缺失值后：{len(df_clean)}")
print(f"删除重复值后：{len(df_clean)}")
print(f"删除行数：{initial_count - len(df_clean)}")
print()

# ===================== 3. 购物车放弃率分析 =====================
print("="*70)
print("3. 购物车放弃率分析")
print("="*70)

# 按用户统计
user_summary = df_clean.groupby('用户ID').agg({
    '行为类型': lambda x: list(x),
    '商品价格': ['count', 'sum']
}).reset_index()
user_summary.columns = ['用户ID', '行为序列', '总操作数', '总商品价格']

# 简化：如果一个用户有加购记录但没有支付记录则视为放弃
def has_abandon(actions):
    has_cart = '加购' in actions
    has_payment = '支付成功' in actions
    return has_cart and not has_payment

user_summary['是否放弃'] = user_summary['行为序列'].apply(has_abandon)

abandon_rate = user_summary['是否放弃'].mean()
print(f"整体用户放弃率：{abandon_rate*100:.2f}%")
print()

# 时间分析
df_clean['小时'] = df_clean['行为时间'].dt.hour
hour_abandon = df_clean[df_clean['行为类型'] == '加购'].groupby('小时').agg({
    '用户ID': 'count'
})
hour_purchase = df_clean[df_clean['行为类型'] == '支付成功'].groupby('小时').agg({
    '用户ID': 'count'
})

hour_stats = pd.DataFrame({
    '加购数': hour_abandon['用户ID'],
    '支付数': hour_purchase['用户ID']
}).fillna(0)
hour_stats['放弃率'] = 1 - hour_stats['支付数'] / hour_stats['加购数']

print("小时级放弃率（前12小时）：")
print(hour_stats.head(12).round(4))
print()

# ===================== 4. 关联规则挖掘 =====================
print("="*70)
print("4. 关联规则挖掘（简化版）")
print("="*70)

# 获取有支付记录的用户
paid_users = df_clean[df_clean['行为类型'] == '支付成功']['用户ID'].unique()
cart_for_paid = df_clean[(df_clean['用户ID'].isin(paid_users)) & 
                          (df_clean['行为类型'] == '加购')]

product_baskets = cart_for_paid.groupby('用户ID')['商品ID'].apply(list).reset_index()
product_baskets.columns = ['用户ID', '商品ID列表']

# 计算共现
co_occur = np.zeros((20, 20), dtype=int)
for items in product_baskets['商品ID列表']:
    for i in range(len(items)):
        for j in range(i + 1, len(items)):
            prod_i = items[i] - 1
            prod_j = items[j] - 1
            co_occur[prod_i][prod_j] += 1
            co_occur[prod_j][prod_i] += 1

print("商品共现矩阵（前10x10）：")
print(co_occur[:10, :10])
print()

# ===================== 5. K-Means用户聚类 =====================
print("="*70)
print("5. K-Means用户聚类")
print("="*70)

# 构建特征
user_features = df_clean.groupby('用户ID').agg({
    '商品ID': 'nunique',  # 浏览商品数
    '行为类型': 'count',   # 总行为数
    '商品价格': 'sum'     # 总金额
}).reset_index()
user_features.columns = ['用户ID', '浏览商品数', '总行为数', '总金额']

# 计算放弃率（简化版）
abandon_dict = dict(zip(user_summary['用户ID'], user_summary['是否放弃'].astype(int)))
user_features['放弃率'] = user_features['用户ID'].map(abandon_dict).fillna(0)

# 标准化与聚类
feature_cols = ['浏览商品数', '总行为数', '总金额', '放弃率']
X = user_features[feature_cols]
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
user_features['簇标签'] = kmeans.fit_predict(X_scaled)

# 计算轮廓系数
sil_score = silhouette_score(X_scaled, user_features['簇标签'])
print(f"聚类轮廓系数：{sil_score:.4f}")
print()

# 聚类结果统计
cluster_stats = user_features.groupby('簇标签').agg({
    '用户ID': 'count',
    '浏览商品数': 'mean',
    '总行为数': 'mean',
    '总金额': 'mean',
    '放弃率': 'mean'
}).round(2)
cluster_stats.columns = ['用户数', '平均浏览商品数', '平均行为数', '平均金额', '平均放弃率']

print("各簇统计：")
print(cluster_stats)
print()

# ===================== 6. 业务建议 =====================
print("="*70)
print("6. 业务建议")
print("="*70)

print("基于分析结果，我们建议：")
print("1. 针对高放弃率时段（如凌晨和深夜）进行优化，提供限时折扣")
print("2. 利用关联规则结果，进行购物车推荐和捆绑销售")
print("3. 针对不同聚类用户群体进行个性化营销和定价策略")
print("4. 对高价值低敏感群体减少促销活动，对高敏感群体增加促销通知")
print()

print("="*70)
print("✓ 端到端分析报告生成完成！")
print("="*70)
`,
    tips: ['端到端项目要注意整个流程的完整性和可复现性', '报告要简洁明了，结论要有数据支持', '业务建议要具体且可落地']
  },
  {
    id: 'scm-project-1',
    chapterId: 'chapter-43',
    title: '订单数据清洗与基础质检',
    description: '用 Pandas 处理缺失值、重复值、异常格式，构建干净的基础订单表。处理日期列的格式统一与超出范围日期，剔除数量≤0或单价≤0的记录，识别并处理订单总价与数量*单价不一致的行，检测并标记重复订单。',
    difficulty: '基础',
    skills: ['数据清洗', '缺失值处理', '异常值检测', '数据验证'],
    initialCode: `import pandas as pd
import numpy as np
from datetime import datetime

# 1. 生成模拟订单数据（包含各种错误）
np.random.seed(42)
n = 500

# 基础数据
order_ids = range(1, n+1)
dates = pd.date_range('2024-01-01', periods=n, freq='3H')
customer_ids = np.random.randint(1, 51, n)
product_ids = np.random.randint(1, 21, n)
quantities = np.random.randint(-2, 10, n)
unit_prices = np.random.uniform(10, 500, n).round(2)
total_amounts = quantities * unit_prices

# 构造DataFrame
df = pd.DataFrame({
    '订单ID': order_ids,
    '日期': dates,
    '客户ID': customer_ids,
    '产品ID': product_ids,
    '数量': quantities,
    '单价': unit_prices,
    '总金额': total_amounts
})

# 引入错误
# 1. 缺失日期
df.loc[np.random.choice(n, 30), '日期'] = pd.NaT
# 2. 缺失客户ID
df.loc[np.random.choice(n, 25), '客户ID'] = np.nan
# 3. 错误的总金额（手动篡改50行）
df.loc[np.random.choice(n, 50), '总金额'] = df.loc[np.random.choice(n, 50), '总金额'] * np.random.uniform(0.8, 1.2, 50)
# 4. 添加重复行
df = pd.concat([df, df.sample(50, random_state=42)], ignore_index=True)

print("="*60)
print("原始数据概览")
print("="*60)
print(f"原始行数：{len(df)}")
print("\\n数据类型：")
print(df.dtypes)
print("\\n缺失值统计：")
print(df.isnull().sum())
print("\\n前20行数据：")
print(df.head(20))
print()

# 2. 数据清洗函数
def clean_order_data(df):
    """订单数据清洗"""
    df_clean = df.copy()
    
    # 任务1：处理日期列
    # 移除缺失日期行
    df_clean = df_clean.dropna(subset=['日期'])
    # 转换日期格式
    df_clean['日期'] = pd.to_datetime(df_clean['日期'])
    # 移除超出范围的日期（只保留2024年的）
    df_clean = df_clean[(df_clean['日期'] >= '2024-01-01') & (df_clean['日期'] <= '2024-12-31')]
    print(f"日期清洗后行数：{len(df_clean)}")
    
    # 任务2：处理数量和单价
    # 剔除数量<=0的记录
    initial_count = len(df_clean)
    df_clean = df_clean[df_clean['数量'] > 0]
    print(f"剔除数量<=0后：{len(df_clean)}（删除{initial_count - len(df_clean)}行）")
    
    # 剔除单价<=0的记录
    initial_count = len(df_clean)
    df_clean = df_clean[df_clean['单价'] > 0]
    print(f"剔除单价<=0后：{len(df_clean)}（删除{initial_count - len(df_clean)}行）")
    
    # 任务3：处理订单总价不一致
    # 计算理论总金额
    df_clean['理论金额'] = df_clean['数量'] * df_clean['单价']
    df_clean['金额差异'] = abs(df_clean['总金额'] - df_clean['理论金额'])
    # 标记不一致的订单
    df_clean['金额不一致'] = df_clean['金额差异'] > 0.01
    inconsistent_count = df_clean['金额不一致'].sum()
    print(f"金额不一致订单数：{inconsistent_count}")
    # 可以选择修正或删除，这里我们用理论金额替换
    df_clean.loc[df_clean['金额不一致'], '总金额'] = df_clean.loc[df_clean['金额不一致'], '理论金额']
    
    # 任务4：检测重复订单（同一客户同一天同一产品）
    duplicate_mask = df_clean.duplicated(subset=['客户ID', '日期', '产品ID'], keep='first')
    df_clean['是否重复'] = duplicate_mask
    duplicate_count = duplicate_mask.sum()
    print(f"重复订单数：{duplicate_count}")
    # 删除重复订单（保留第一条）
    df_clean = df_clean[~duplicate_mask]
    
    return df_clean

print("\\n" + "="*60)
print("执行数据清洗")
print("="*60)
df_cleaned = clean_order_data(df)

# 3. 清洗前后对比
print("\\n" + "="*60)
print("清洗前后对比")
print("="*60)
print(f"清洗前行数：{len(df)}")
print(f"清洗后行数：{len(df_cleaned)}")
print(f"删除总行数：{len(df) - len(df_cleaned)}")
print(f"删除比例：{(len(df) - len(df_cleaned))/len(df)*100:.2f}%")

# 4. 异常记录明细
print("\\n" + "="*60)
print("异常记录统计")
print("="*60)
if '是否重复' in df_cleaned.columns:
    print(f"重复订单数：{df_cleaned['是否重复'].sum()}")
if '金额不一致' in df_cleaned.columns:
    print(f"金额不一致订单数：{df_cleaned['金额不一致'].sum()}")
    
print("\\n清洗后数据前20行：")
print(df_cleaned.head(20))
print()

# 5. 数据验证
assert len(df_cleaned) > 0, "清洗后数据为空"
assert df_cleaned['数量'].min() > 0, "仍有无效数量"
assert df_cleaned['单价'].min() > 0, "仍有无效单价"
assert df_cleaned['日期'].isnull().sum() == 0, "仍有缺失日期"
print("✓ 数据清洗完成，验证通过！")
`,
    tips: ['日期要先转换为datetime类型再进行范围筛选', '金额不一致可以用理论金额替换或标记后手动处理', '重复检测要选择合适的关键字段组合']
  },
  {
    id: 'scm-project-2',
    chapterId: 'chapter-44',
    title: '库存周转与缺货预警分析',
    description: '计算产品库存周转率，识别周转过慢与可能缺货的 SKU。按月计算每个产品的销售数量总和，计算周转率 = 月销量 / 平均库存，标记周转率<0.5（滞销）和>5（高周转但库存低的缺货风险）。',
    difficulty: '基础',
    skills: ['库存周转', '缺货预警', '周转率计算'],
    initialCode: `import pandas as pd
import numpy as np

# 1. 生成模拟数据
np.random.seed(42)
n_months = 12
n_products = 30

# 产品表
products = pd.DataFrame({
    '产品ID': range(1, n_products + 1),
    '产品名称': [f'产品{i}' for i in range(1, n_products + 1)],
    '品类': np.random.choice(['电子产品', '服装', '食品', '家居'], n_products),
    '当前库存': np.random.randint(50, 500, n_products),
    '补货周期_天': np.random.randint(7, 30, n_products)
})

# 月度销售数据（12个月）
sales_data = []
for month in range(1, n_months + 1):
    for product_id in range(1, n_products + 1):
        # 模拟销量（考虑季节性）
        base_sales = np.random.randint(20, 100)
        # 电子产品在年底销量更高
        if products.loc[products['产品ID'] == product_id, '品类'].values[0] == '电子产品' and month in [11, 12]:
            base_sales = int(base_sales * 1.5)
        sales_data.append({
            '月份': month,
            '产品ID': product_id,
            '销售数量': base_sales
        })

sales_df = pd.DataFrame(sales_data)

# 平均库存（简化：假设每月末库存稳定）
inventory_df = products[['产品ID', '当前库存']].copy()
inventory_df['平均库存'] = inventory_df['当前库存'] * 0.9  # 假设平均为当前的90%

print("="*60)
print("数据概览")
print("="*60)
print(f"产品数：{len(products)}")
print(f"月度销售记录数：{len(sales_df)}")
print("\\n产品表：")
print(products.head(10))
print("\\n月度销售数据（前20行）：")
print(sales_df.head(20))
print()

# 2. 按月计算每个产品的销售数量总和
print("="*60)
print("月度销量统计")
print("="*60)
monthly_sales = sales_df.groupby(['月份', '产品ID'])['销售数量'].sum().reset_index()
print("月度销量（前20行）：")
print(monthly_sales.head(20))
print()

# 3. 计算周转率
print("="*60)
print("计算库存周转率")
print("="*60)

# 月度总销量
product_monthly_total = sales_df.groupby('产品ID')['销售数量'].sum().reset_index()
product_monthly_total.columns = ['产品ID', '月度总销量']

# 合并库存数据
turnover_df = product_monthly_total.merge(inventory_df[['产品ID', '平均库存']], on='产品ID')

# 计算周转率 = 月销量 / 平均库存
turnover_df['周转率'] = turnover_df['月度总销量'] / turnover_df['平均库存']

print("周转率计算结果：")
print(turnover_df.round(2))
print()

# 4. 标记风险产品
print("="*60)
print("风险产品识别")
print("="*60)

# 周转率 < 0.5：滞销
turnover_df['滞销风险'] = turnover_df['周转率'] < 0.5
# 周转率 > 5：缺货风险（高周转但库存可能不足）
turnover_df['缺货风险'] = turnover_df['周转率'] > 5

print(f"滞销产品数（周转率<0.5）：{turnover_df['滞销风险'].sum()}")
print(f"缺货风险产品数（周转率>5）：{turnover_df['缺货风险'].sum()}")

print("\\n滞销产品清单：")
slow_moving = turnover_df[turnover_df['滞销风险']].sort_values('周转率')
print(slow_moving[['产品ID', '月度总销量', '平均库存', '周转率']].round(2))

print("\\n缺货风险产品清单：")
stockout_risk = turnover_df[turnover_df['缺货风险']].sort_values('周转率', ascending=False)
print(stockout_risk[['产品ID', '月度总销量', '平均库存', '周转率']].round(2))
print()

# 5. 结合补货周期计算预警
print("="*60)
print("缺货预警分析")
print("="*60)
turnover_df = turnover_df.merge(products[['产品ID', '补货周期_天']], on='产品ID')

# 计算安全库存（简化版）
# 安全库存 = 日均销量 × 补货周期 × 1.5（安全系数）
turnover_df['日均销量'] = turnover_df['月度总销量'] / 30
turnover_df['建议安全库存'] = (turnover_df['日均销量'] * turnover_df['补货周期_天'] * 1.5).round(0)
turnover_df['库存是否充足'] = turnover_df['当前库存'] >= turnover_df['建议安全库存']

print("缺货预警详情：")
risk_warning = turnover_df[(turnover_df['缺货风险']) | (~turnover_df['库存是否充足'])]
print(risk_warning[['产品ID', '月度总销量', '当前库存', '建议安全库存', '库存是否充足']].round(2))
print()

# 6. 验证
assert '周转率' in turnover_df.columns, "周转率计算缺失"
assert len(turnover_df) == n_products, "产品数量不匹配"
print("✓ 库存周转与缺货预警分析完成！")
`,
    tips: ['周转率 = 月销量 / 平均库存', '周转率过低表示滞销，周转率过高可能缺货', '安全库存要结合补货周期和日均销量计算']
  },
  {
    id: 'scm-project-3',
    chapterId: 'chapter-45',
    title: '购物车分析——订单内产品组合频次',
    description: '基于订单明细，计算同时购买的产品对（Pair）及其频次。按订单分组，构造每个订单的产品列表，生成所有产品对，统计全量数据中每对产品的共现次数，找出 Top 10 最常一起购买的产品组合。',
    difficulty: '基础',
    skills: ['关联规则', '产品组合', '共现频次'],
    initialCode: `import pandas as pd
import numpy as np
from itertools import combinations

# 1. 生成模拟订单数据
np.random.seed(42)
n_orders = 1000
n_products = 20

# 产品列表
products = {
    i: f'产品{i}' for i in range(1, n_products + 1)
}

# 生成订单（每个订单包含1-5个产品）
order_data = []
for order_id in range(1, n_orders + 1):
    # 随机选择1-5个产品
    n_items = np.random.randint(1, 6)
    product_ids = np.random.choice(range(1, n_products + 1), n_items, replace=False)
    
    for product_id in product_ids:
        order_data.append({
            '订单ID': order_id,
            '产品ID': product_id,
            '产品名称': products[product_id]
        })

order_df = pd.DataFrame(order_data)

print("="*60)
print("订单明细数据")
print("="*60)
print(f"总订单数：{order_df['订单ID'].nunique()}")
print(f"总记录数：{len(order_df)}")
print("\\n订单明细（前30行）：")
print(order_df.head(30))
print()

# 2. 按订单分组，构造产品列表
print("="*60)
print("构造产品购物篮")
print("="*60)
baskets = order_df.groupby('订单ID')['产品ID'].apply(list).reset_index()
baskets.columns = ['订单ID', '产品列表']
print(f"购物篮数量：{len(baskets)}")
print("\\n购物篮示例（前10个）：")
for i in range(10):
    print(f"订单{baskets.iloc[i]['订单ID']}: {[products[p] for p in baskets.iloc[i]['产品列表']]}")
print()

# 3. 生成所有产品对
print("="*60)
print("生成产品对组合")
print("="*60)

pair_counts = {}
for _, row in baskets.iterrows():
    products_in_basket = row['产品列表']
    # 生成所有两两组合
    if len(products_in_basket) >= 2:
        for pair in combinations(sorted(products_in_basket), 2):
            pair_key = (min(pair), max(pair))  # 确保顺序一致
            pair_counts[pair_key] = pair_counts.get(pair_key, 0) + 1

# 转换为DataFrame
pair_df = pd.DataFrame([
    {'产品1_ID': pair[0], '产品2_ID': pair[1], 
     '产品1': products[pair[0]], '产品2': products[pair[1]], 
     '共现次数': count}
    for pair, count in pair_counts.items()
])

# 添加产品名称列
pair_df = pair_df.sort_values('共现次数', ascending=False)

print(f"总产品对数：{len(pair_df)}")
print("\\n产品对共现统计（前20个）：")
print(pair_df.head(20))
print()

# 4. 找出Top 10最常一起购买的产品组合
print("="*60)
print("Top 10 最常一起购买的产品组合")
print("="*60)
top_10_pairs = pair_df.head(10)
print(top_10_pairs[['产品1', '产品2', '共现次数']])
print()

# 计算支持度
total_orders = len(baskets)
top_10_pairs['支持度'] = top_10_pairs['共现次数'] / total_orders

print("Top 10 产品对的详细分析：")
for idx, row in top_10_pairs.iterrows():
    print(f"\\n产品组合：{row['产品1']} + {row['产品2']}")
    print(f"  共现次数：{row['共现次数']}")
    print(f"  支持度：{row['支持度']:.2%}")
    
    # 判断是否适合捆绑促销
    if row['支持度'] > 0.05:
        recommendation = "强烈建议捆绑促销"
    elif row['支持度'] > 0.02:
        recommendation = "可以考虑捆绑促销"
    else:
        recommendation = "暂不推荐捆绑促销"
    print(f"  建议：{recommendation}")
print()

# 5. 按品类分析产品对
print("="*60)
print("品类间产品组合分析")
print("="*60)

# 获取产品品类信息
product_category = {i: np.random.choice(['电子产品', '服装', '食品', '家居']) for i in range(1, n_products + 1)}
pair_df['品类1'] = pair_df['产品1_ID'].map(product_category)
pair_df['品类2'] = pair_df['产品2_ID'].map(product_category)

# 统计品类间组合
cross_category = pair_df[pair_df['品类1'] != pair_df['品类2']].groupby(['品类1', '品类2'])['共现次数'].sum().reset_index()
cross_category = cross_category.sort_values('共现次数', ascending=False)

print("跨品类产品组合（Top 10）：")
print(cross_category.head(10))
print()

# 6. 验证
assert len(pair_df) > 0, "没有生成有效产品对"
assert pair_df['共现次数'].max() > 0, "共现次数为0"
print("✓ 购物车产品组合分析完成！")
`,
    tips: ['共现次数表示两个产品同时出现在同一订单的次数', '支持度 = 共现次数 / 总订单数', '支持度高的产品对适合捆绑促销']
  },
  {
    id: 'scm-project-4',
    chapterId: 'chapter-46',
    title: '客户价值分层（RFM + KMeans 聚类）',
    description: '使用 RFM（最近购买、频率、金额）做客户聚类。计算每个客户的 R / F / M 值，标准化 RFM 特征，使用 KMeans 聚类（elbow 法选 k），解释各群组业务含义。',
    difficulty: '进阶',
    skills: ['RFM模型', 'KMeans聚类', '客户分层'],
    initialCode: `import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

# 1. 生成模拟订单数据
np.random.seed(42)
n_customers = 200
n_orders = 3000
reference_date = datetime(2024, 3, 1)

# 客户表
customers = pd.DataFrame({
    '客户ID': range(1, n_customers + 1),
    '客户名称': [f'客户{i}' for i in range(1, n_customers + 1)],
    '注册日期': [reference_date - timedelta(days=np.random.randint(30, 365)) for _ in range(n_customers)]
})

# 订单表
order_data = []
for _ in range(n_orders):
    customer_id = np.random.randint(1, n_customers + 1)
    order_date = reference_date - timedelta(days=np.random.randint(0, 90))
    amount = np.random.normal(500, 200)
    order_data.append({
        '客户ID': customer_id,
        '订单ID': len(order_data) + 1,
        '订单日期': order_date,
        '订单金额': max(amount, 50)
    })

orders_df = pd.DataFrame(order_data)

print("="*60)
print("数据概览")
print("="*60)
print(f"客户数：{len(customers)}")
print(f"订单数：{len(orders_df)}")
print("\\n订单数据（前20行）：")
print(orders_df.head(20))
print()

# 2. 计算RFM值
print("="*60)
print("计算RFM值")
print("="*60)

rfm = orders_df.groupby('客户ID').agg({
    '订单日期': lambda x: (reference_date - x.max()).days,  # R：最近消费天数
    '订单ID': 'count',  # F：订单频次
    '订单金额': 'sum'  # M：总消费金额
}).reset_index()

rfm.columns = ['客户ID', 'R（最近消费天数）', 'F（订单频次）', 'M（总消费金额）']

print("RFM计算结果（前20行）：")
print(rfm.head(20).round(2))
print()

# 3. 标准化RFM特征
print("="*60)
print("标准化RFM特征")
print("="*60)

features = ['R（最近消费天数）', 'F（订单频次）', 'M（总消费金额）']
X = rfm[features]

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

print("标准化后的RFM特征（前10行）：")
print(pd.DataFrame(X_scaled, columns=features, index=rfm['客户ID']).head(10).round(4))
print()

# 4. 使用肘部法则确定K值
print("="*60)
print("肘部法则确定K值")
print("="*60)

inertias = []
k_range = range(2, 11)

for k in k_range:
    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    kmeans.fit(X_scaled)
    inertias.append(kmeans.inertia_)
    print(f"K={k}: Inertia={kmeans.inertia_:.2f}")

# 选择K=4（业务通常将客户分为4层）
best_k = 4
print(f"\\n选择K={best_k}（高价值、重要发展、一般、流失边缘）")
print()

# 5. KMeans聚类
print("="*60)
print("KMeans客户聚类")
print("="*60)

kmeans = KMeans(n_clusters=best_k, random_state=42, n_init=10)
rfm['簇标签'] = kmeans.fit_predict(X_scaled)
rfm['簇标签'] = rfm['簇标签'].astype(int)

print("聚类结果分布：")
print(rfm['簇标签'].value_counts().sort_index())
print()

# 6. 分析各簇特征
print("="*60)
print("各簇业务含义解读")
print("="*60)

cluster_stats = rfm.groupby('簇标签').agg({
    '客户ID': 'count',
    'R（最近消费天数）': 'mean',
    'F（订单频次）': 'mean',
    'M（总消费金额）': 'mean'
}).round(2)

cluster_stats.columns = ['客户数', '平均R值', '平均F值', '平均M值']

# 为各簇命名
cluster_names = {}
for cluster_id in range(best_k):
    stats = cluster_stats.loc[cluster_id]
    if stats['平均R值'] < 15 and stats['平均F值'] > 15 and stats['平均M值'] > 600:
        name = '高价值活跃客户'
    elif stats['平均R值'] < 30 and stats['平均F值'] > 10:
        name = '重要发展客户'
    elif stats['平均R值'] > 50:
        name = '流失边缘客户'
    else:
        name = '一般价值客户'
    cluster_names[cluster_id] = name

cluster_stats['业务含义'] = cluster_stats.index.map(cluster_names)
print(cluster_stats)
print()

# 为每个客户标注群体
rfm['客户群体'] = rfm['簇标签'].map(cluster_names)

# 7. 输出各群体客户明细
print("="*60)
print("各群体客户明细")
print("="*60)

for cluster_id in range(best_k):
    cluster_name = cluster_names[cluster_id]
    cluster_customers = rfm[rfm['簇标签'] == cluster_id]
    print(f"\\n【{cluster_name}】（共{len(cluster_customers)}人）")
    print(cluster_customers[['客户ID', 'R（最近消费天数）', 'F（订单频次）', 'M（总消费金额）']].sort_values('M（总消费金额）', ascending=False).head(5))
print()

# 8. 验证
assert '簇标签' in rfm.columns, "聚类结果缺失"
assert len(rfm['簇标签'].unique()) == best_k, "簇数量不正确"
print("✓ RFM客户分层完成！")
`,
    tips: ['R值越小（最近消费越近）越好', 'F值和M值越大越好', '聚类后要给每个簇赋予业务含义，便于制定差异化策略']
  },
  {
    id: 'scm-project-5',
    chapterId: 'chapter-47',
    title: '供应商交货准时率与质量评分聚类',
    description: '对供应商进行基于准时率、不良率、响应时间的聚类。计算准时率、不良率、平均延期天数，去除异常供应商（数据不足），使用 KMeans 聚类（k=3 或 4），识别优秀、一般、高风险供应商。',
    difficulty: '进阶',
    skills: ['供应商评分', '聚类分析', '风险识别'],
    initialCode: `import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

# 1. 生成模拟采购数据
np.random.seed(42)
n_suppliers = 50
n_orders = 500

# 供应商表
suppliers = pd.DataFrame({
    '供应商ID': range(1, n_suppliers + 1),
    '供应商名称': [f'供应商{i}' for i in range(1, n_suppliers + 1)],
    '供应商类型': np.random.choice(['原材料', '零部件', '包装'], n_suppliers)
})

# 采购订单表
purchase_data = []
for order_id in range(1, n_orders + 1):
    supplier_id = np.random.randint(1, n_suppliers + 1)
    planned_date = datetime(2024, 1, 1) + timedelta(days=np.random.randint(0, 90))
    # 模拟延期（有些供应商经常延期）
    if supplier_id <= 15:
        delay_days = np.random.normal(0, 2)  # 准时型
    elif supplier_id <= 35:
        delay_days = np.random.normal(5, 3)  # 轻微延期
    else:
        delay_days = np.random.normal(15, 5)  # 严重延期
    
    actual_date = planned_date + timedelta(days=max(delay_days, 0))
    
    # 模拟不良品
    if supplier_id <= 20:
        defect_rate = np.random.uniform(0, 0.02)  # 优质
    elif supplier_id <= 40:
        defect_rate = np.random.uniform(0.02, 0.05)  # 一般
    else:
        defect_rate = np.random.uniform(0.05, 0.15)  # 较差
    
    total_items = np.random.randint(100, 1000)
    defect_items = int(total_items * defect_rate)
    
    purchase_data.append({
        '订单ID': order_id,
        '供应商ID': supplier_id,
        '计划交货日': planned_date,
        '实际交货日': actual_date,
        '延期天数': max(delay_days, 0),
        '总件数': total_items,
        '不良品数': defect_items
    })

purchase_df = pd.DataFrame(purchase_data)

print("="*60)
print("采购数据概览")
print("="*60)
print(f"供应商数：{n_suppliers}")
print(f"订单数：{len(purchase_df)}")
print("\\n采购订单数据（前20行）：")
print(purchase_df.head(20))
print()

# 2. 计算供应商绩效指标
print("="*60)
print("计算供应商绩效指标")
print("="*60)

supplier_stats = purchase_df.groupby('供应商ID').agg({
    '订单ID': 'count',  # 订单数
    '延期天数': ['mean', 'sum'],  # 平均延期、总延期
    '总件数': 'sum',  # 总供货量
    '不良品数': 'sum'  # 总不良品数
}).reset_index()

supplier_stats.columns = ['供应商ID', '订单数', '平均延期天数', '总延期天数', '总供货量', '总不良品数']

# 计算准时率和不良率
supplier_stats['准时率'] = ((supplier_stats['平均延期天数'] <= 0) | (supplier_stats['平均延期天数'].isna())).astype(int)
supplier_stats['准时率'] = 1 - (supplier_stats['平均延期天数'] / supplier_stats['平均延期天数'].max()).clip(0, 1)
supplier_stats['不良率'] = supplier_stats['总不良品数'] / supplier_stats['总供货量']

print("供应商绩效统计（前20行）：")
print(supplier_stats.head(20).round(4))
print()

# 3. 去除异常供应商（数据不足）
print("="*60)
print("数据质量筛选")
print("="*60)
MIN_ORDERS = 5
supplier_stats_filtered = supplier_stats[supplier_stats['订单数'] >= MIN_ORDERS].copy()
print(f"原始供应商数：{len(supplier_stats)}")
print(f"订单数>={MIN_ORDERS}的供应商数：{len(supplier_stats_filtered)}")
print()

# 4. KMeans聚类
print("="*60)
print("供应商聚类分析")
print("="*60)

features = ['准时率', '不良率', '平均延期天数']
X = supplier_stats_filtered[features]

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 选择K=3
best_k = 3
kmeans = KMeans(n_clusters=best_k, random_state=42, n_init=10)
supplier_stats_filtered['簇标签'] = kmeans.fit_predict(X_scaled)

print(f"聚类数量K={best_k}")
print("聚类结果分布：")
print(supplier_stats_filtered['簇标签'].value_counts().sort_index())
print()

# 5. 分析各簇特征
print("="*60)
print("各簇供应商特征分析")
print("="*60)

cluster_stats = supplier_stats_filtered.groupby('簇标签').agg({
    '供应商ID': 'count',
    '准时率': 'mean',
    '不良率': 'mean',
    '平均延期天数': 'mean'
}).round(4)

cluster_stats.columns = ['供应商数', '平均准时率', '平均不良率', '平均延期天数']

# 为各簇命名
cluster_names = {}
for cluster_id in range(best_k):
    stats = cluster_stats.loc[cluster_id]
    if stats['平均准时率'] > 0.9 and stats['平均不良率'] < 0.02:
        name = '优秀供应商'
    elif stats['平均准时率'] > 0.7 and stats['平均不良率'] < 0.05:
        name = '一般供应商'
    else:
        name = '高风险供应商'
    cluster_names[cluster_id] = name

cluster_stats['供应商类别'] = cluster_stats.index.map(cluster_names)
print(cluster_stats)
print()

# 6. 为供应商分类
supplier_stats_filtered['供应商类别'] = supplier_stats_filtered['簇标签'].map(cluster_names)

print("="*60)
print("各类别供应商明细")
print("="*60)

for category in ['优秀供应商', '一般供应商', '高风险供应商']:
    category_suppliers = supplier_stats_filtered[supplier_stats_filtered['供应商类别'] == category]
    print(f"\\n【{category}】（共{len(category_suppliers)}家）")
    if len(category_suppliers) > 0:
        print(category_suppliers[['供应商ID', '订单数', '准时率', '不良率', '平均延期天数']].sort_values('准时率', ascending=False).head(10).round(4))
print()

# 7. 验证
assert '簇标签' in supplier_stats_filtered.columns, "聚类结果缺失"
print("✓ 供应商交货准时率与质量评分聚类完成！")
`,
    tips: ['准时率越高、不良率越低表示供应商越好', '聚类可以自动发现供应商的分层', '高风险供应商需要重点关注和改进']
  },
  {
    id: 'scm-project-6',
    chapterId: 'chapter-48',
    title: '季节性销售聚类（产品按月销量模式聚类）',
    description: '找出不同销售季节模式的产品群。构建产品 × 月份 销量矩阵，对产品进行聚类（按销量时间序列形状），分析每类产品的峰值月份、低谷月份，建议对应月份的库存策略。',
    difficulty: '进阶',
    skills: ['时间序列聚类', '季节性分析', '库存策略'],
    initialCode: `import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

# 1. 生成模拟月度销量数据
np.random.seed(42)
n_products = 30
n_months = 12

# 产品信息
products = pd.DataFrame({
    '产品ID': range(1, n_products + 1),
    '产品名称': [f'产品{i}' for i in range(1, n_products + 1)],
    '品类': np.random.choice(['服装', '电子产品', '食品', '家居'], n_products)
})

# 生成月度销量（考虑季节性）
sales_data = []
for product_id in range(1, n_products + 1):
    # 基础销量
    base_sales = np.random.randint(100, 500)
    
    # 根据品类设置季节性模式
    if products.loc[products['产品ID'] == product_id, '品类'].values[0] == '服装':
        # 服装：春秋季高，夏季低
        seasonal_pattern = [0.6, 0.7, 0.9, 1.2, 1.5, 0.8, 0.7, 0.8, 1.3, 1.2, 0.9, 0.5]
    elif products.loc[products['产品ID'] == product_id, '品类'].values[0] == '电子产品':
        # 电子产品：年底促销高
        seasonal_pattern = [0.7, 0.8, 0.9, 1.0, 1.0, 1.1, 0.9, 1.0, 1.1, 1.2, 1.5, 2.0]
    elif products.loc[products['产品ID'] == product_id, '品类'].values[0] == '食品':
        # 食品：全年稳定，节假日略高
        seasonal_pattern = [1.0, 1.0, 1.0, 1.0, 1.1, 1.0, 1.0, 1.0, 1.1, 1.0, 1.2, 1.3]
    else:
        # 家居：春季和年底高
        seasonal_pattern = [0.8, 0.9, 1.2, 1.3, 1.0, 0.9, 0.8, 0.9, 1.0, 1.1, 1.4, 1.2]
    
    for month in range(1, n_months + 1):
        # 添加随机波动
        sales = base_sales * seasonal_pattern[month-1] * np.random.uniform(0.9, 1.1)
        sales_data.append({
            '产品ID': product_id,
            '月份': month,
            '销量': int(sales)
        })

sales_df = pd.DataFrame(sales_data)

print("="*60)
print("月度销量数据")
print("="*60)
print(f"产品数：{n_products}")
print(f"月度记录数：{len(sales_df)}")
print("\\n销量数据（前30行）：")
print(sales_df.head(30))
print()

# 2. 构建产品 × 月份 销量矩阵
print("="*60)
print("构建产品-月份矩阵")
print("="*60)
sales_matrix = sales_df.pivot(index='产品ID', columns='月份', values='销量').fillna(0)
print("产品-月份销量矩阵（前10个产品）：")
print(sales_matrix.head(10))
print()

# 3. 对产品进行聚类
print("="*60)
print("产品销量模式聚类")
print("="*60)

# 标准化每个产品的销量模式（除以均值，消除绝对值影响）
sales_matrix_normalized = sales_matrix.div(sales_matrix.mean(axis=1), axis=0)
print("标准化后的销量模式（前10个产品）：")
print(sales_matrix_normalized.head(10).round(2))
print()

X = sales_matrix_normalized.values
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 选择K=3（不同季节性模式）
best_k = 3
kmeans = KMeans(n_clusters=best_k, random_state=42, n_init=10)
cluster_labels = kmeans.fit_predict(X_scaled)

print(f"聚类数量K={best_k}")
print("各簇产品数：")
print(pd.Series(cluster_labels).value_counts().sort_index())
print()

# 4. 分析每个簇的特征
print("="*60)
print("各簇季节性特征分析")
print("="*60)

# 计算每个簇的月度平均销量
cluster_centers_df = pd.DataFrame(
    kmeans.cluster_centers_,
    columns=[f'月份{i}' for i in range(1, n_months + 1)],
    index=[f'簇{i}' for i in range(best_k)]
)
print("聚类中心（销量模式）：")
print(cluster_centers_df.round(2))
print()

# 为产品标注聚类
products['聚类'] = cluster_labels

# 分析每个簇的峰值和低谷月份
cluster_analysis = []
for cluster_id in range(best_k):
    cluster_products = products[products['聚类'] == cluster_id]['产品ID'].values
    cluster_sales = sales_matrix.loc[cluster_products].mean()
    
    peak_month = cluster_sales.idxmax()
    low_month = cluster_sales.idxmin()
    total_sales = cluster_sales.sum()
    
    cluster_analysis.append({
        '簇ID': cluster_id,
        '产品数': len(cluster_products),
        '总销量': total_sales,
        '峰值月份': peak_month,
        '峰值销量': cluster_sales.max(),
        '低谷月份': low_month,
        '低谷销量': cluster_sales.min()
    })

cluster_analysis_df = pd.DataFrame(cluster_analysis)

# 为各簇命名
def name_cluster(row):
    peak = row['峰值月份']
    low = row['低谷月份']
    if peak in [11, 12] or peak == 1:
        return '年底旺季型'
    elif peak in [4, 5, 9, 10]:
        return '春秋季型'
    elif peak in [6, 7, 8]:
        return '夏季旺季型'
    else:
        return '稳定型'

cluster_analysis_df['季节类型'] = cluster_analysis_df.apply(name_cluster, axis=1)

print("各簇季节性分析：")
print(cluster_analysis_df)
print()

# 5. 库存策略建议
print("="*60)
print("库存策略建议")
print("="*60)

for _, row in cluster_analysis_df.iterrows():
    print(f"\\n【{row['季节类型']}】（簇{row['簇ID']}）")
    print(f"  产品数：{row['产品数']}")
    print(f"  峰值月份：{row['峰值月份']}月（销量：{row['峰值销量']:.0f}）")
    print(f"  低谷月份：{row['低谷月份']}月（销量：{row['低谷销量']:.0f}）")
    
    # 库存建议
    if '旺季' in row['季节类型']:
        print(f"  库存建议：")
        print(f"    - 峰值月前1个月开始备货")
        print(f"    - 保持安全库存在峰值销量的150%")
        print(f"    - 低谷月减少采购，避免积压")
    else:
        print(f"  库存建议：")
        print(f"    - 全年保持稳定库存水平")
        print(f"    - 关注节假日提前备货")
print()

# 6. 验证
assert '聚类' in products.columns, "聚类结果缺失"
print("✓ 季节性销售聚类分析完成！")
`,
    tips: ['不同品类的产品有不同的时间序列模式', '可以用肘部法则确定最佳聚类数', '聚类结果可以指导差异化的库存策略']
  },
  {
    id: 'scm-project-7',
    chapterId: 'chapter-49',
    title: '仓库选址候选点聚类（基于客户地址经纬度）',
    description: '基于客户分布，聚类出 K 个仓库候选点。清洗无效坐标，使用 KMeans 聚类（按实际业务需求设定 K=5~10），计算每个聚类中心坐标作为候选仓库，统计各仓库覆盖的订单数量。',
    difficulty: '进阶',
    skills: ['仓库选址', '地理聚类', '订单覆盖'],
    initialCode: `import pandas as pd
import numpy as np
from sklearn.cluster import KMeans

# 1. 生成模拟客户位置数据
np.random.seed(42)
n_customers = 500
n_orders = 2000

# 客户表（包含经纬度坐标，模拟国内城市分布）
# 假设主要分布在几个大城市群
city_centers = {
    '北京': (39.9, 116.4),
    '上海': (31.2, 121.5),
    '广州': (23.1, 113.3),
    '深圳': (22.5, 114.1),
    '成都': (30.6, 104.0),
    '杭州': (30.3, 120.2)
}

customer_data = []
for i in range(n_customers):
    # 随机选择一个城市群
    city = np.random.choice(list(city_centers.keys()))
    lat, lon = city_centers[city]
    
    # 添加随机偏移（模拟城市内分布）
    lat += np.random.normal(0, 0.5)
    lon += np.random.normal(0, 0.5)
    
    customer_data.append({
        '客户ID': i + 1,
        '客户名称': f'客户{i+1}',
        '纬度': lat,
        '经度': lon,
        '所属城市': city
    })

customers_df = pd.DataFrame(customer_data)

# 订单表
order_data = []
for _ in range(n_orders):
    customer_id = np.random.randint(1, n_customers + 1)
    order_date = f'2024-{np.random.randint(1, 13):02d}-{np.random.randint(1, 29):02d}'
    amount = np.random.uniform(100, 5000)
    order_data.append({
        '客户ID': customer_id,
        '订单ID': len(order_data) + 1,
        '订单日期': order_date,
        '订单金额': amount
    })

orders_df = pd.DataFrame(order_data)

print("="*60)
print("客户地理位置数据")
print("="*60)
print(f"客户数：{n_customers}")
print("\\n客户位置数据（前20行）：")
print(customers_df.head(20))
print()

# 2. 数据清洗
print("="*60)
print("数据清洗")
print("="*60)

# 清洗无效坐标（中国范围大致：纬度20-50，经度73-135）
initial_count = len(customers_df)
customers_clean = customers_df[
    (customers_df['纬度'] >= 20) & (customers_df['纬度'] <= 50) &
    (customers_df['经度'] >= 73) & (customers_df['经度'] <= 135)
].copy()

print(f"清洗前行数：{initial_count}")
print(f"清洗后行数：{len(customers_clean)}")
print(f"删除无效坐标：{initial_count - len(customers_clean)}")
print()

# 3. KMeans聚类找仓库候选点
print("="*60)
print("仓库候选点聚类")
print("="*60)

# 设定K=6（对应6个城市群）
best_k = 6
coords = customers_clean[['纬度', '经度']].values

kmeans = KMeans(n_clusters=best_k, random_state=42, n_init=10)
customers_clean['仓库簇'] = kmeans.fit_predict(coords)

# 计算聚类中心
centers = kmeans.cluster_centers_
print(f"聚类数量K={best_k}")
print("候选仓库坐标：")
for i, center in enumerate(centers):
    print(f"  仓库{i+1}: 纬度={center[0]:.4f}, 经度={center[1]:.4f}")
print()

# 4. 统计各仓库覆盖的订单数量
print("="*60)
print("各仓库订单覆盖统计")
print("="*60)

# 合并客户和订单
orders_with_coords = orders_df.merge(customers_clean[['客户ID', '仓库簇']], on='客户ID')

warehouse_stats = orders_with_coords.groupby('仓库簇').agg({
    '订单ID': 'count',
    '订单金额': ['sum', 'mean']
}).reset_index()

warehouse_stats.columns = ['仓库簇', '订单数', '总金额', '平均金额']

# 添加仓库坐标
warehouse_stats['纬度'] = [centers[i][0] for i in warehouse_stats['仓库簇']]
warehouse_stats['经度'] = [centers[i][1] for i in warehouse_stats['仓库簇']]

print("各仓库统计：")
print(warehouse_stats.round(2))
print()

# 5. 按仓库统计覆盖的客户数
print("="*60)
print("各仓库客户覆盖分析")
print("="*60)

customer_coverage = customers_clean.groupby('仓库簇').size().reset_index()
customer_coverage.columns = ['仓库簇', '客户数']
customer_coverage['纬度'] = [centers[i][0] for i in customer_coverage['仓库簇']]
customer_coverage['经度'] = [centers[i][1] for i in customer_coverage['仓库簇']]

print("各仓库客户覆盖：")
print(customer_coverage)
print()

# 6. 生成仓库选址建议
print("="*60)
print("仓库选址建议")
print("="*60)

for _, row in warehouse_stats.iterrows():
    warehouse_id = int(row['仓库簇']) + 1
    print(f"\\n【仓库{warehouse_id}】")
    print(f"  建议坐标：纬度={row['纬度']:.4f}, 经度={row['经度']:.4f}")
    print(f"  覆盖订单数：{row['订单数']}")
    print(f"  覆盖订单总金额：¥{row['总金额']:,.2f}")
    print(f"  覆盖客户数：{customer_coverage[customer_coverage['仓库簇']==row['仓库簇']]['客户数'].values[0]}")
    
    # 建议
    if row['订单数'] > 400:
        priority = "高优先级，建议优先建设"
    elif row['订单数'] > 250:
        priority = "中优先级，建议中期建设"
    else:
        priority = "低优先级，可延后建设"
    print(f"  建设优先级：{priority}")
print()

# 7. 验证
assert '仓库簇' in customers_clean.columns, "聚类结果缺失"
assert len(warehouse_stats) == best_k, "仓库数量不匹配"
print("✓ 仓库选址候选点聚类完成！")
`,
    tips: ['KMeans会自动找到K个聚类中心作为仓库候选点', '可以根据实际业务需求设定K值', '订单覆盖量可以指导仓库建设优先级']
  },
  {
    id: 'scm-project-8',
    chapterId: 'chapter-50',
    title: '促销效果对比（A/B 类产品购货车分析对比）',
    description: '对比促销组与非促销组的购物车关联规则差异。拆分促销订单与非促销订单，分别计算两类订单中的高共现产品对，找出仅在促销组中显著出现的产品对，分析促销是否改变了购买组合习惯。',
    difficulty: '进阶',
    skills: ['A/B测试', '促销分析', '产品共现'],
    initialCode: `import pandas as pd
import numpy as np
from itertools import combinations

# 1. 生成模拟订单数据（包含促销标记）
np.random.seed(42)
n_orders = 1000
n_products = 20

products = {i: f'产品{i}' for i in range(1, n_products + 1)}

# 生成订单
order_data = []
for order_id in range(1, n_orders + 1):
    # 30%的订单为促销订单
    is_promotion = np.random.random() < 0.3
    
    # 促销产品和非促销产品有不同的购买模式
    if is_promotion:
        # 促销订单：更容易购买促销产品（产品1-10为促销产品）
        n_items = np.random.randint(1, 5)
        product_pool = range(1, 11)  # 促销产品池
    else:
        # 非促销订单：购买更分散
        n_items = np.random.randint(1, 6)
        product_pool = range(1, n_products + 1)
    
    product_ids = np.random.choice(list(product_pool), n_items, replace=False)
    
    for product_id in product_ids:
        order_data.append({
            '订单ID': order_id,
            '产品ID': product_id,
            '是否促销': 1 if is_promotion else 0
        })

order_df = pd.DataFrame(order_data)

print("="*60)
print("订单数据概览")
print("="*60)
print(f"总订单数：{order_df['订单ID'].nunique()}")
print(f"促销订单数：{order_df[order_df['是否促销']==1]['订单ID'].nunique()}")
print(f"非促销订单数：{order_df[order_df['是否促销']==0]['订单ID'].nunique()}")
print()

# 2. 拆分促销组和非促销组
print("="*60)
print("拆分促销组与非促销组")
print("="*60)

promo_orders = order_df[order_df['是否促销'] == 1]['订单ID'].unique()
non_promo_orders = order_df[order_df['是否促销'] == 0]['订单ID'].unique()

promo_df = order_df[order_df['是否促销'] == 1].copy()
non_promo_df = order_df[order_df['是否促销'] == 0].copy()

print(f"促销组订单数：{len(promo_orders)}")
print(f"非促销组订单数：{len(non_promo_orders)}")
print()

# 3. 计算各组产品共现
def calculate_cooccurrence(df, order_ids):
    """计算产品共现矩阵"""
    df_filtered = df[df['订单ID'].isin(order_ids)]
    baskets = df_filtered.groupby('订单ID')['产品ID'].apply(list).reset_index()
    
    pair_counts = {}
    for _, row in baskets.iterrows():
        products_in_basket = row['产品ID']
        if len(products_in_basket) >= 2:
            for pair in combinations(sorted(set(products_in_basket)), 2):
                pair_key = (min(pair), max(pair))
                pair_counts[pair_key] = pair_counts.get(pair_key, 0) + 1
    
    return pair_counts

print("="*60)
print("计算产品共现频次")
print("="*60)

promo_pairs = calculate_cooccurrence(promo_df, promo_orders)
non_promo_pairs = calculate_cooccurrence(non_promo_df, non_promo_orders)

print(f"促销组产品对数：{len(promo_pairs)}")
print(f"非促销组产品对数：{len(non_promo_pairs)}")
print()

# 4. 构建对比表
print("="*60)
print("促销组 Top10 产品共现")
print("="*60)

promo_pairs_df = pd.DataFrame([
    {'产品1': products[p[0]], '产品2': products[p[1]], '共现次数': count}
    for p, count in sorted(promo_pairs.items(), key=lambda x: x[1], reverse=True)[:10]
])
print(promo_pairs_df)
print()

print("="*60)
print("非促销组 Top10 产品共现")
print("="*60)

non_promo_pairs_df = pd.DataFrame([
    {'产品1': products[p[0]], '产品2': products[p[1]], '共现次数': count}
    for p, count in sorted(non_promo_pairs.items(), key=lambda x: x[1], reverse=True)[:10]
])
print(non_promo_pairs_df)
print()

# 5. 找出仅在促销组显著的产品对
print("="*60)
print("促销特有产品组合分析")
print("="*60)

# 计算支持度
promo_support = {pair: count/len(promo_orders) for pair, count in promo_pairs.items()}
non_promo_support = {pair: count/len(non_promo_orders) for pair, count in non_promo_pairs.items()}

# 找出促销组支持度明显高于非促销组的产品对
promo_only_pairs = []
for pair, promo_supp in promo_support.items():
    non_promo_supp = non_promo_support.get(pair, 0)
    if promo_supp > 0.05 and promo_supp / (non_promo_supp + 0.001) > 1.5:
        promo_only_pairs.append({
            '产品1': products[pair[0]],
            '产品2': products[pair[1]],
            '促销支持度': promo_supp,
            '非促销支持度': non_promo_supp,
            '提升倍数': promo_supp / (non_promo_supp + 0.001)
        })

promo_only_df = pd.DataFrame(promo_only_pairs)
promo_only_df = promo_only_df.sort_values('提升倍数', ascending=False)

if len(promo_only_df) > 0:
    print("促销显著提升的产品组合：")
    print(promo_only_df.round(4))
else:
    print("没有找到促销显著提升的产品组合")
print()

# 6. 业务结论
print("="*60)
print("促销效果业务结论")
print("="*60)

if len(promo_only_df) > 0:
    print(f"发现{len(promo_only_df)}个促销显著提升的产品组合")
    print("\\n业务建议：")
    print("1. 这些产品组合在促销期间购买频次显著提升")
    print("2. 建议在促销时将这些产品捆绑销售")
    print("3. 可以针对这些组合设计专门的促销方案")
else:
    print("促销对产品组合购买习惯影响不明显")
    print("\\n可能的原因为：")
    print("- 促销力度不够大")
    print("- 产品关联性本身较弱")
    print("- 需要更长的观察周期")
print()

# 7. 验证
assert len(promo_pairs_df) > 0 or len(non_promo_pairs_df) > 0, "没有计算到有效产品对"
print("✓ 促销效果对比分析完成！")
`,
    tips: ['A/B测试可以对比促销前后的产品组合变化', '提升倍数大的产品对说明促销效果显著', '可以利用促销特有组合设计捆绑销售方案']
  },
  {
    id: 'scm-project-9',
    chapterId: 'chapter-51',
    title: '退货原因聚类分析（文本 + 数量特征）',
    description: '对退货订单进行聚类，发现主要退货模式。对退货原因文本做 TF-IDF 向量化，结合退货金额与数量特征，一起做 KMeans 聚类，解读每个聚类（如：质量问题退货、数量多发退货、无理由退货）。',
    difficulty: '进阶',
    skills: ['退货分析', '文本向量化', 'KMeans聚类'],
    initialCode: `import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

# 1. 生成模拟退货数据
np.random.seed(42)
n_returns = 300

# 退货原因文本库
reason_templates = [
    '质量问题，多次维修仍无法使用',
    '尺寸不合适，偏大',
    '尺寸不合适，偏小',
    '颜色与图片不符',
    '商品破损，包装损坏',
    '收到错误商品',
    '不想要了',
    '后悔购买',
    '七天无理由退货',
    '与其他平台比较后发现更便宜',
    '数量错误，少发了一件',
    '数量错误，多发了一件',
    '性能不达标',
    '做工粗糙',
    '气味刺鼻'
]

return_data = []
for i in range(n_returns):
    # 根据退货原因类型设置损失金额和数量
    reason_template = np.random.choice(reason_templates)
    
    # 质量问题的损失较高
    if '质量' in reason_template or '破损' in reason_template or '错误' in reason_template:
        return_amount = np.random.uniform(200, 1000)
        return_quantity = np.random.randint(1, 3)
    elif '尺寸' in reason_template or '颜色' in reason_template:
        return_amount = np.random.uniform(100, 500)
        return_quantity = 1
    else:
        return_amount = np.random.uniform(50, 300)
        return_quantity = 1
    
    return_data.append({
        '退货ID': i + 1,
        '退货原因': reason_template,
        '退货金额': return_amount,
        '退货数量': return_quantity,
        '商品类别': np.random.choice(['服装', '电子产品', '家居', '食品'])
    })

returns_df = pd.DataFrame(return_data)

print("="*60)
print("退货数据概览")
print("="*60)
print(f"总退货数：{len(returns_df)}")
print("\\n退货数据（前20行）：")
print(returns_df.head(20))
print()

# 2. 文本特征向量化（简化版：基于关键词）
print("="*60)
print("退货原因文本特征提取")
print("="*60)

# 定义关键词特征
keywords = ['质量', '尺寸', '颜色', '破损', '错误', '不想要', '后悔', '无理由', '便宜', '数量', '性能', '做工', '气味']

def extract_keyword_features(text):
    features = []
    for keyword in keywords:
        features.append(1 if keyword in text else 0)
    return features

keyword_features = returns_df['退货原因'].apply(lambda x: extract_keyword_features(x))
keyword_df = pd.DataFrame(keyword_features.tolist(), columns=keywords)
keyword_df.index = returns_df.index

print("文本关键词特征（前20行）：")
print(keyword_df.head(20))
print()

# 3. 合并特征
print("="*60)
print("合并文本和数值特征")
print("="*60)

# 数值特征
numeric_features = returns_df[['退货金额', '退货数量']].values

# 合并特征
X_text = keyword_df.values
X_numeric = StandardScaler().fit_transform(numeric_features)
X_combined = np.hstack([X_text, X_numeric])

print(f"合并特征维度：{X_combined.shape}")
print()

# 4. KMeans聚类
print("="*60)
print("退货原因聚类")
print("="*60)

best_k = 3
kmeans = KMeans(n_clusters=best_k, random_state=42, n_init=10)
returns_df['簇标签'] = kmeans.fit_predict(X_combined)

print(f"聚类数量K={best_k}")
print("各簇退货数：")
print(returns_df['簇标签'].value_counts().sort_index())
print()

# 5. 分析每个聚类的特征
print("="*60)
print("各聚类退货模式分析")
print("="*60)

cluster_analysis = []
for cluster_id in range(best_k):
    cluster_data = returns_df[returns_df['簇标签'] == cluster_id]
    
    # 统计数值特征
    avg_amount = cluster_data['退货金额'].mean()
    avg_quantity = cluster_data['退货数量'].mean()
    
    # 统计高频关键词
    keyword_freq = keyword_df.loc[cluster_data.index].sum().sort_values(ascending=False)
    top_keywords = keyword_freq[keyword_freq > 0].head(3).index.tolist()
    
    # 统计退货原因
    reason_counts = cluster_data['退货原因'].value_counts()
    top_reasons = reason_counts.head(2).index.tolist()
    
    cluster_analysis.append({
        '簇ID': cluster_id,
        '退货数': len(cluster_data),
        '平均损失金额': avg_amount,
        '平均退货数量': avg_quantity,
        '高频原因': ', '.join(top_reasons[:2]),
        '关键词': ', '.join(top_keywords)
    })

cluster_df = pd.DataFrame(cluster_analysis)

# 为各簇命名
def name_cluster(row):
    reasons = row['高频原因']
    keywords = row['关键词']
    
    if '质量' in reasons or '破损' in reasons or '做工' in reasons or '气味' in reasons:
        return '质量问题退货'
    elif '尺寸' in reasons or '颜色' in reasons:
        return '外观不符退货'
    elif '错误' in reasons or '数量' in reasons:
        return '发货错误退货'
    elif '不想要' in reasons or '后悔' in reasons or '无理由' in reasons:
        return '主观意愿退货'
    else:
        return '其他原因退货'

cluster_df['退货类型'] = cluster_df.apply(name_cluster, axis=1)

print(cluster_df)
print()

# 6. 详细分析各类型
print("="*60)
print("各类退货详细分析")
print("="*60)

returns_df['退货类型'] = returns_df['簇标签'].map(
    dict(zip(cluster_df['簇ID'], cluster_df['退货类型']))
)

for return_type in cluster_df['退货类型']:
    type_data = returns_df[returns_df['退货类型'] == return_type]
    print(f"\\n【{return_type}】（共{len(type_data)}单）")
    print(f"  平均损失金额：¥{type_data['退货金额'].mean():.2f}")
    print(f"  平均退货数量：{type_data['退货数量'].mean():.2f}")
    print(f"  典型退货原因：")
    for reason, count in type_data['退货原因'].value_counts().head(3).items():
        print(f"    - {reason} ({count}单)")
print()

# 7. 业务建议
print("="*60)
print("业务改进建议")
print("="*60)

for _, row in cluster_df.iterrows():
    print(f"\\n【{row['退货类型']}】")
    print(f"  占比：{row['退货数']/len(returns_df)*100:.1f}%")
    
    if row['退货类型'] == '质量问题退货':
        print("  建议：加强供应商质量管控，完善退换货流程")
    elif row['退货类型'] == '外观不符退货':
        print("  建议：优化商品描述页，确保图片与实物一致")
    elif row['退货类型'] == '发货错误退货':
        print("  建议：升级仓储系统，增加发货复核环节")
    elif row['退货类型'] == '主观意愿退货':
        print("  建议：优化商品详情页，帮助用户做出更准确的购买决策")
print()

# 8. 验证
assert '簇标签' in returns_df.columns, "聚类结果缺失"
print("✓ 退货原因聚类分析完成！")
`,
    tips: ['文本特征可以简化为关键词出现与否', '结合数值特征可以更全面地刻画退货模式', '聚类结果可以指导针对性的改进措施']
  },
  {
    id: 'scm-project-10',
    chapterId: 'chapter-52',
    title: '预测性补货——结合销量聚类与安全库存计算',
    description: '基于销量波动聚类，对不同类产品设置差异化安全库存公式。计算每个产品的月销量标准差与均值，对产品做聚类（高波动/低波动/季节性波动），为每类产品自动计算安全库存，对比传统固定库存策略与聚类差异化策略的库存成本差异。',
    difficulty: '综合',
    skills: ['预测性补货', '安全库存', '成本优化'],
    initialCode: `import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

# 1. 生成模拟月度销量数据
np.random.seed(42)
n_products = 50
n_months = 12

# 产品信息
products = pd.DataFrame({
    '产品ID': range(1, n_products + 1),
    '产品名称': [f'产品{i}' for i in range(1, n_products + 1)],
    '单价': np.random.uniform(50, 500, n_products).round(2),
    '提前期_天': np.random.randint(7, 30, n_products),
    '品类': np.random.choice(['A类', 'B类', 'C类'], n_products)
})

# 生成月度销量（不同产品的波动模式不同）
sales_data = []
for product_id in range(1, n_products + 1):
    base_sales = np.random.randint(100, 500)
    
    # 模拟不同波动类型
    if product_id <= 15:
        # 高波动型：标准差大
        volatility = 0.5
    elif product_id <= 35:
        # 低波动型：标准差小
        volatility = 0.15
    else:
        # 季节性波动：某些月份高，某些月份低
        volatility = 0.3
    
    for month in range(1, n_months + 1):
        # 季节性因子
        if product_id > 35:
            seasonal_factor = 1 + 0.5 * np.sin((month - 3) * np.pi / 6)
        else:
            seasonal_factor = 1
        
        sales = base_sales * seasonal_factor * np.random.uniform(1-volatility, 1+volatility)
        sales_data.append({
            '产品ID': product_id,
            '月份': month,
            '销量': max(int(sales), 10)
        })

sales_df = pd.DataFrame(sales_data)

print("="*60)
print("月度销量数据")
print("="*60)
print(f"产品数：{n_products}")
print(f"月度记录数：{len(sales_df)}")
print("\\n销量数据（前20行）：")
print(sales_df.head(20))
print()

# 2. 计算每个产品的销量统计
print("="*60)
print("计算产品销量统计")
print("="*60)

product_stats = sales_df.groupby('产品ID').agg({
    '销量': ['mean', 'std', 'min', 'max']
}).reset_index()

product_stats.columns = ['产品ID', '平均销量', '销量标准差', '最小销量', '最大销量']
product_stats['波动系数'] = product_stats['销量标准差'] / product_stats['平均销量']

print("产品销量统计（前20行）：")
print(product_stats.head(20).round(2))
print()

# 3. 对产品进行聚类
print("="*60)
print("产品销量波动聚类")
print("="*60)

features = ['平均销量', '销量标准差', '波动系数']
X = product_stats[features]

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 选择K=3
best_k = 3
kmeans = KMeans(n_clusters=best_k, random_state=42, n_init=10)
product_stats['簇标签'] = kmeans.fit_predict(X_scaled)

print(f"聚类数量K={best_k}")
print("各簇产品数：")
print(product_stats['簇标签'].value_counts().sort_index())
print()

# 4. 分析各簇特征
print("="*60)
print("各簇特征分析")
print("="*60)

cluster_analysis = product_stats.groupby('簇标签').agg({
    '产品ID': 'count',
    '平均销量': 'mean',
    '销量标准差': 'mean',
    '波动系数': 'mean'
}).round(2)

cluster_analysis.columns = ['产品数', '平均销量', '平均标准差', '平均波动系数']

# 为各簇命名
def name_cluster(row):
    cv = row['平均波动系数']
    if cv > 0.35:
        return '高波动产品'
    elif cv > 0.2:
        return '中波动产品'
    else:
        return '低波动产品'

cluster_analysis['产品类型'] = cluster_analysis.apply(name_cluster, axis=1)

print(cluster_analysis)
print()

# 5. 计算安全库存
print("="*60)
print("计算安全库存")
print("="*60)

# 合并产品信息
result_df = product_stats.merge(products[['产品ID', '单价', '提前期_天']], on='产品ID')

# 安全库存公式：SS = Z × σ × √L
# Z = 安全系数（服务水平95%对应1.65，99%对应2.33）
# σ = 销量标准差
# L = 提前期

Z_95 = 1.65  # 95%服务水平

def calculate_safety_stock(row, volatility_type):
    """根据波动类型计算安全库存"""
    std = row['销量标准差']
    lead_time = row['提前期_天']
    
    if volatility_type == '高波动产品':
        # 高波动产品使用更高的安全系数
        z = 2.33
    elif volatility_type == '低波动产品':
        # 低波动产品可以使用较低的安全系数
        z = 1.28
    else:
        z = 1.65
    
    ss = z * std * np.sqrt(lead_time / 30)  # 将天转换为月
    return int(ss)

# 为每个产品计算安全库存
result_df['产品类型'] = result_df['簇标签'].map(
    dict(zip(cluster_analysis.index, cluster_analysis['产品类型']))
)

result_df['安全库存'] = result_df.apply(
    lambda row: calculate_safety_stock(row, row['产品类型']), axis=1
)

# 传统固定库存策略（统一使用中等安全系数）
result_df['传统安全库存'] = (Z_95 * result_df['销量标准差'] * np.sqrt(result_df['提前期_天'] / 30)).astype(int)

# 计算库存成本
result_df['差异化库存成本'] = result_df['安全库存'] * result_df['单价']
result_df['传统库存成本'] = result_df['传统安全库存'] * result_df['单价']

print("安全库存计算结果（前20行）：")
print(result_df[['产品ID', '产品类型', '平均销量', '安全库存', '传统安全库存', '单价', '差异化库存成本']].head(20).round(2))
print()

# 6. 对比两种策略
print("="*60)
print("库存策略对比分析")
print("="*60)

print("各产品类型库存成本对比：")
cost_comparison = result_df.groupby('产品类型').agg({
    '差异化库存成本': 'sum',
    '传统库存成本': 'sum',
    '产品ID': 'count'
}).round(2)

cost_comparison.columns = ['差异化策略成本', '传统策略成本', '产品数']
cost_comparison['成本节省'] = cost_comparison['传统策略成本'] - cost_comparison['差异化策略成本']
cost_comparison['节省比例'] = (cost_comparison['成本节省'] / cost_comparison['传统策略成本'] * 100).round(2)

print(cost_comparison)
print()

total_savings = cost_comparison['成本节省'].sum()
total_savings_pct = (total_savings / cost_comparison['传统策略成本'].sum() * 100)

print(f"\\n总体库存成本对比：")
print(f"  传统策略总成本：¥{cost_comparison['传统策略成本'].sum():,.2f}")
print(f"  差异化策略总成本：¥{cost_comparison['差异化策略成本'].sum():,.2f}")
print(f"  总成本节省：¥{total_savings:,.2f} ({total_savings_pct:.2f}%)")
print()

# 7. 验证
print("="*60)
print("验证与建议")
print("="*60)

assert '安全库存' in result_df.columns, "安全库存计算缺失"
assert '产品类型' in result_df.columns, "产品分类缺失"

print("安全库存建议表（前10个产品）：")
print(result_df[['产品ID', '产品名称', '产品类型', '平均销量', '安全库存', '提前期_天']].head(10))

print("\\n业务建议：")
print("1. 对高波动产品保持较高安全库存，避免缺货")
print("2. 对低波动产品可以降低安全系数，节省库存成本")
print("3. 定期根据最新销量数据重新计算安全库存")
print("4. 结合销售预测，在旺季前适当增加备货")
print()

print("✓ 预测性补货与安全库存计算完成！")
`,
    tips: ['安全库存 = Z × σ × √L', '高波动产品需要更高的安全系数', '差异化策略可以节省库存成本而不牺牲服务水平']
  },
  {
    id: 'bi-project-1',
    chapterId: 'chapter-53',
    title: '销售数据清洗与基础BI看板',
    description: 'Pandas数据清洗、缺失值/异常值处理、数据类型转换、基础统计透视。给定零售订单CSV（含订单ID、日期、金额、数量、区域），完成去重、格式统一、缺失填补，计算月销售额、各区域总销售，输出销售趋势折线图与区域柱状图。',
    difficulty: '基础',
    skills: ['数据清洗', '缺失值处理', '统计透视', '数据可视化'],
    initialCode: `import pandas as pd
import numpy as np
from datetime import datetime

# 1. 生成模拟零售订单数据
np.random.seed(42)
n_orders = 1000

regions = ['华东', '华南', '华北', '华中', '西南', '西北']
order_data = []

for i in range(n_orders):
    order_id = f'ORD{str(i+1).zfill(6)}'
    # 随机日期（2024年）
    days_offset = np.random.randint(0, 365)
    order_date = datetime(2024, 1, 1) + pd.Timedelta(days=days_offset)
    region = np.random.choice(regions)
    amount = np.random.uniform(50, 2000)
    quantity = np.random.randint(1, 20)
    
    order_data.append({
        '订单ID': order_id,
        '日期': order_date,
        '区域': region,
        '金额': amount,
        '数量': quantity
    })

df = pd.DataFrame(order_data)

# 引入数据问题
# 1. 缺失值
df.loc[np.random.choice(n_orders, 50), '金额'] = np.nan
df.loc[np.random.choice(n_orders, 30), '数量'] = np.nan
df.loc[np.random.choice(n_orders, 20), '区域'] = np.nan
# 2. 重复数据
df = pd.concat([df, df.sample(50, random_state=42)], ignore_index=True)
# 3. 异常值
df.loc[np.random.choice(len(df), 10), '金额'] = np.random.uniform(5000, 10000, 10)
df.loc[np.random.choice(len(df), 5), '数量'] = np.random.randint(-10, 0, 5)

print("="*60)
print("原始数据概览")
print("="*60)
print(f"原始行数：{len(df)}")
print("\\n缺失值统计：")
print(df.isnull().sum())
print("\\n前10行数据：")
print(df.head(10))
print()

# 2. 数据清洗
print("="*60)
print("数据清洗")
print("="*60)

# 删除重复订单
df_clean = df.drop_duplicates(subset=['订单ID']).copy()
print(f"去重后行数：{len(df_clean)}（删除{len(df) - len(df_clean)}行重复）")

# 处理缺失值 - 填充
df_clean['金额'] = df_clean['金额'].fillna(df_clean['金额'].median())
df_clean['数量'] = df_clean['数量'].fillna(df_clean['数量'].median())
df_clean['区域'] = df_clean['区域'].fillna('未知')

# 剔除异常值
df_clean = df_clean[df_clean['金额'] > 0]
df_clean = df_clean[df_clean['数量'] > 0]
print(f"剔除异常后行数：{len(df_clean)}")
print()

# 转换日期格式
df_clean['日期'] = pd.to_datetime(df_clean['日期'])
df_clean['月份'] = df_clean['日期'].dt.month
df_clean['年份'] = df_clean['日期'].dt.year

print("="*60)
print("验证数据清洗结果")
print("="*60)
print(f"最终行数：{len(df_clean)}")
print(f"缺失值总数：{df_clean.isnull().sum().sum()}")
assert df_clean.isnull().sum().sum() == 0, "仍有缺失值"
print()

# 3. 基础统计分析 - BI看板核心指标
print("="*60)
print("BI看板核心指标")
print("="*60)

# 总销售
total_sales = df_clean['金额'].sum()
total_orders = len(df_clean)
total_quantity = df_clean['数量'].sum()
avg_order_value = df_clean['金额'].mean()

print(f"总销售额：¥{total_sales:,.2f}")
print(f"总订单数：{total_orders}")
print(f"总销售数量：{total_quantity}")
print(f"平均订单金额：¥{avg_order_value:.2f}")
print()

# 4. 月度销售趋势分析
print("="*60)
print("月度销售趋势")
print("="*60)

monthly_sales = df_clean.groupby('月份').agg({
    '订单ID': 'count',
    '金额': 'sum',
    '数量': 'sum'
}).reset_index()
monthly_sales.columns = ['月份', '订单数', '销售额', '销售数量']

print("月度销售数据：")
print(monthly_sales)
print()

# 计算环比增长率
monthly_sales['销售额环比增长'] = monthly_sales['销售额'].pct_change() * 100
print("月度销售额趋势（带环比）：")
print(monthly_sales[['月份', '销售额', '销售额环比增长']].round(2))
print()

# 5. 区域销售分析
print("="*60)
print("区域销售分析")
print("="*60)

region_sales = df_clean.groupby('区域').agg({
    '订单ID': 'count',
    '金额': 'sum',
    '数量': 'sum'
}).reset_index()
region_sales.columns = ['区域', '订单数', '销售额', '销售数量']
region_sales['平均订单金额'] = region_sales['销售额'] / region_sales['订单数']
region_sales = region_sales.sort_values('销售额', ascending=False)

print("区域销售排名：")
print(region_sales)
print()

# 区域销售占比
region_sales['销售占比'] = (region_sales['销售额'] / total_sales * 100).round(2)
print("区域销售占比：")
for _, row in region_sales.iterrows():
    print(f"  {row['区域']}: {row['销售占比']:.1f}% (¥{row['销售额']:,.0f})")
print()

# 6. 数据透视表
print("="*60)
print("数据透视表：区域 × 月份 销售额")
print("="*60)

pivot_table = df_clean.pivot_table(
    values='金额',
    index='区域',
    columns='月份',
    aggfunc='sum',
    fill_value=0
)
print(pivot_table.round(0))
print()

# 7. 可视化数据准备（模拟图表输出）
print("="*60)
print("可视化数据准备")
print("="*60)

print("销售趋势数据（用于折线图）：")
print("月份:", monthly_sales['月份'].tolist())
print("销售额:", monthly_sales['销售额'].round(0).tolist())
print()

print("区域柱状图数据：")
print(region_sales[['区域', '销售额', '销售占比']])
print()

# 8. 业务洞察
print("="*60)
print("业务洞察")
print("="*60)

# 找出销售额最高和最低的区域
top_region = region_sales.iloc[0]
low_region = region_sales.iloc[-1]

print(f"1. 销售冠军区域：{top_region['区域']}（销售额：¥{top_region['销售额']:,.0f}）")
print(f"2. 销售最低区域：{low_region['区域']}（销售额：¥{low_region['销售额']:,.0f}）")
print(f"3. 最旺月份：{monthly_sales.loc[monthly_sales['销售额'].idxmax(), '月份']}月")
print(f"4. 最淡月份：{monthly_sales.loc[monthly_sales['销售额'].idxmin(), '月份']}月")
print()

# 9. 验证
print("="*60)
print("数据验证")
print("="*60)
assert df_clean.isnull().sum().sum() == 0, "仍有缺失值"
assert len(df_clean) > 0, "清洗后数据为空"
assert df_clean['金额'].min() > 0, "仍有无效金额"
print("✓ 数据清洗完成，所有验证通过！")
print("✓ BI看板基础分析完成！")
`,
    tips: ['数据清洗是BI分析的基础，要确保数据质量', '透视表是快速发现数据规律的好工具', '结合时间维度和区域维度可以发现更多业务洞察']
  },
  {
    id: 'bi-project-2',
    chapterId: 'chapter-54',
    title: '电商订单流与购物车分析（关联规则Apriori）',
    description: '购物篮分析、事务编码、频繁项集、关联规则（置信度/支持度）。数据含Transaction_ID与Product，清洗掉单件商品订单，转换为购物车矩阵，使用mlxtend计算频繁项集与规则。',
    difficulty: '进阶',
    skills: ['关联规则', 'Apriori算法', '购物篮分析'],
    initialCode: `# ========== 1. 生成示例数据（模拟购物篮） ==========
import pandas as pd
import numpy as np
from mlxtend.frequent_patterns import apriori, association_rules

# 生成1000条交易记录（每条记录包含多个商品）
np.random.seed(42)
transactions = []
products = ['牛奶', '面包', '黄油', '鸡蛋', '啤酒', '尿布', '可乐', '薯片']

for _ in range(1000):
    # 每个购物篮随机包含2-5个商品
    basket = np.random.choice(products, size=np.random.randint(2,6), replace=False).tolist()
    transactions.append(basket)

# 转换为DataFrame格式（Transaction_ID + Product）
df = pd.DataFrame([(i, prod) for i, basket in enumerate(transactions) for prod in basket],
                  columns=['Transaction_ID', 'Product'])

print("原始数据前10行：")
print(df.head())
print(f"\\n总交易数：{df['Transaction_ID'].nunique()}")
print(f"总商品种类：{df['Product'].nunique()}")

# ========== 2. 数据清洗 ==========
# 删除空值（如果有）
df.dropna(inplace=True)

# 检查每个交易的商品数量分布
basket_sizes = df.groupby('Transaction_ID').size()
print(f"\\n购物篮大小统计：最小{basket_sizes.min()}，最大{basket_sizes.max()}，平均{basket_sizes.mean():.1f}")

# 过滤掉单件商品订单（可选，关联规则通常需要多商品）
# 这里保留所有交易，因为数据生成时最小为2件

# ========== 3. 转换为购物车矩阵（One-Hot编码） ==========
# 方法：使用pd.crosstab 或 pivot_table
basket_matrix = pd.crosstab(df['Transaction_ID'], df['Product']).astype(bool)

print(f"\\n购物车矩阵形状：{basket_matrix.shape}（{basket_matrix.shape[0]}个交易 × {basket_matrix.shape[1]}个商品）")
print("\\n矩阵前5行：")
print(basket_matrix.head())

# ========== 4. 挖掘频繁项集 ==========
# 设置最小支持度（例如3%，即至少出现在30个交易中）
min_support = 0.03
frequent_itemsets = apriori(basket_matrix, min_support=min_support, use_colnames=True)

print(f"\\n频繁项集（支持度≥{min_support}）：")
print(frequent_itemsets.sort_values('support', ascending=False).head(10))

# ========== 5. 生成关联规则 ==========
# 设置最小置信度
min_confidence = 0.5
rules = association_rules(frequent_itemsets, metric="confidence", min_threshold=min_confidence)

# 添加提升度（Lift）列
rules['lift'] = rules['lift']

print(f"\\n关联规则（置信度≥{min_confidence}）：")
print(rules[['antecedents', 'consequents', 'support', 'confidence', 'lift']].head(10))

# ========== 6. 筛选有意义的规则（提升度 > 1.2） ==========
meaningful_rules = rules[rules['lift'] > 1.2].sort_values('lift', ascending=False)

print("\\n\\n=== 最有价值的关联规则（提升度>1.2） ===")
if len(meaningful_rules) > 0:
    for idx, row in meaningful_rules.head(5).iterrows():
        ante = ', '.join(list(row['antecedents']))
        cons = ', '.join(list(row['consequents']))
        print(f"如果顾客购买【{ante}】→ 也很可能购买【{cons}】")
        print(f"  支持度: {row['support']:.3f}, 置信度: {row['confidence']:.3f}, 提升度: {row['lift']:.2f}\\n")
else:
    print("未找到提升度>1.2的规则，尝试降低阈值或增加数据量")

# ========== 7. 代码验证 ==========
# 验证1：检查支持度是否在范围内
assert frequent_itemsets['support'].between(0, 1).all(), "支持度超出[0,1]范围"

# 验证2：置信度验证
assert rules['confidence'].between(0, 1).all(), "置信度超出[0,1]范围"

# 验证3：提升度>1.2的规则数量
print(f"\\n验证通过：共找到{len(meaningful_rules)}条提升度>1.2的规则")

# 验证4：手动计算一条规则验证算法正确性
# 例如：购买{牛奶}→{面包}的置信度 = 同时购买数 / 购买牛奶数
milk_bread = len(df[df['Product'] == '牛奶']['Transaction_ID'].unique() & 
                  set(df[df['Product'] == '面包']['Transaction_ID'].unique()))
milk = len(df[df['Product'] == '牛奶']['Transaction_ID'].unique())
manual_conf = milk_bread / milk if milk > 0 else 0
print(f"手动验证【牛奶→面包】置信度: {manual_conf:.3f}")

# ========== 8. 简单可视化（可选） ==========
import matplotlib.pyplot as plt

# 绘制支持度-置信度散点图
plt.figure(figsize=(10, 6))
plt.scatter(rules['support'], rules['confidence'], c=rules['lift'], cmap='viridis', alpha=0.6)
plt.colorbar(label='提升度')
plt.xlabel('支持度')
plt.ylabel('置信度')
plt.title('关联规则散点图（颜色=提升度）')
plt.grid(True, alpha=0.3)
plt.show()

# 输出规则数量统计
print(f"\\n统计：")
print(f"总频繁项集数量：{len(frequent_itemsets)}")
print(f"总关联规则数量：{len(rules)}")
print(f"提升度>1的规则（正相关）：{len(rules[rules['lift']>1])}")
print(f"提升度<1的规则（负相关）：{len(rules[rules['lift']<1])}")
`,
    tips: ['支持度表示商品组合出现的频率', '置信度表示购买A后购买B的概率', '提升度>1表示正向关联，可以用于推荐']
  },
  {
    id: 'bi-project-3',
    chapterId: 'chapter-55',
    title: 'RFM客户分层分析（传统BI指标）',
    description: '聚合函数、时间差计算、分位数、客户评分。根据订单表计算最近购买日(R)、频率(F)、金额(M)，利用分位数划分1-5分，组合RFM总分，划分高价值/流失客户。',
    difficulty: '进阶',
    skills: ['RFM模型', '客户分层', '分位数计算'],
    initialCode: `import pandas as pd
import numpy as np
from datetime import datetime

# 1. 生成模拟订单数据
np.random.seed(42)
n_customers = 300
n_orders = 2000
reference_date = datetime(2024, 6, 1)

customer_ids = range(1, n_customers + 1)

order_data = []
for _ in range(n_orders):
    customer_id = np.random.choice(customer_ids)
    order_date = reference_date - pd.Timedelta(days=np.random.randint(0, 180))
    amount = np.random.normal(500, 200)
    order_data.append({
        '客户ID': customer_id,
        '订单ID': len(order_data) + 1,
        '订单日期': order_date,
        '订单金额': max(amount, 50)
    })

orders_df = pd.DataFrame(order_data)

print("="*60)
print("订单数据概览")
print("="*60)
print(f"客户数：{orders_df['客户ID'].nunique()}")
print(f"订单数：{len(orders_df)}")
print("\\n订单数据前15行：")
print(orders_df.head(15))
print()

# 2. 计算RFM值
print("="*60)
print("计算RFM值")
print("="*60)

rfm = orders_df.groupby('客户ID').agg({
    '订单日期': lambda x: (reference_date - x.max()).days,  # R: 最近购买天数
    '订单ID': 'count',  # F: 购买频率
    '订单金额': 'sum'  # M: 总金额
}).reset_index()

rfm.columns = ['客户ID', 'R(最近天数)', 'F(频率)', 'M(总金额)']

print("RFM计算结果（前20行）：")
print(rfm.head(20).round(2))
print()

# 验证：每个客户的R值应该<=最大日期差
max_date_diff = (reference_date - orders_df['订单日期'].min()).days
assert rfm['R(最近天数)'].max() <= max_date_diff, "R值计算错误"
print(f"✓ R值验证通过（最大天数差：{max_date_diff}天）")
print()

# 3. RFM评分（使用分位数划分1-5分）
print("="*60)
print("RFM评分")
print("="*60)

# R值评分：越小越好（越近越好），所以分数反转
rfm['R评分'] = pd.qcut(rfm['R(最近天数)'], q=5, labels=[5, 4, 3, 2, 1]).astype(int)
# F值评分：越大越好
rfm['F评分'] = pd.qcut(rfm['F(频率)'].rank(method='first'), q=5, labels=[1, 2, 3, 4, 5]).astype(int)
# M值评分：越大越好
rfm['M评分'] = pd.qcut(rfm['M(总金额)'].rank(method='first'), q=5, labels=[1, 2, 3, 4, 5]).astype(int)

print("RFM评分（前15行）：")
print(rfm[['客户ID', 'R(最近天数)', 'R评分', 'F(频率)', 'F评分', 'M(总金额)', 'M评分']].head(15).round(2))
print()

# 4. 计算RFM总分
print("="*60)
print("RFM总分与客户分层")
print("="*60)

rfm['RFM总分'] = rfm['R评分'] + rfm['F评分'] + rfm['M评分']

print(f"RFM总分统计：")
print(f"  最低分：{rfm['RFM总分'].min()}")
print(f"  最高分：{rfm['RFM总分'].max()}")
print(f"  平均分：{rfm['RFM总分'].mean():.2f}")
print()

# 客户分层
def classify_customer(row):
    total = row['RFM总分']
    if total >= 13:  # 3个维度都是4-5分
        return '高价值客户'
    elif total >= 10:  # 总分10-12
        return '重要发展客户'
    elif total >= 7:  # 总分7-9
        return '一般客户'
    elif row['R(最近天数)'] > 60:  # R值高（很久没买）
        return '流失风险客户'
    else:
        return '低价值客户'

rfm['客户类型'] = rfm.apply(classify_customer, axis=1)

print("客户分层结果：")
print(rfm['客户类型'].value_counts())
print()

# 5. 详细分析各客户群体
print("="*60)
print("各客户群体详细分析")
print("="*60)

customer_stats = rfm.groupby('客户类型').agg({
    '客户ID': 'count',
    'R(最近天数)': 'mean',
    'F(频率)': 'mean',
    'M(总金额)': 'mean',
    'RFM总分': 'mean'
}).round(2)

customer_stats.columns = ['客户数', '平均R(天数)', '平均F(频次)', '平均M(金额)', '平均总分']
customer_stats = customer_stats.sort_values('平均M(金额)', ascending=False)

print(customer_stats)
print()

# 6. 高价值客户明细
print("="*60)
print("高价值客户明细")
print("="*60)

high_value = rfm[rfm['客户类型'] == '高价值客户'].sort_values('RFM总分', ascending=False)
print(f"高价值客户数：{len(high_value)}")
print(f"高价值客户占比：{len(high_value)/len(rfm)*100:.1f}%")
print()
print("Top 10 高价值客户：")
print(high_value[['客户ID', 'R评分', 'F评分', 'M评分', 'RFM总分', 'M(总金额)']].head(10).round(2))
print()

# 7. 流失风险客户分析
print("="*60)
print("流失风险客户分析")
print("="*60)

churn_risk = rfm[rfm['客户类型'] == '流失风险客户']
print(f"流失风险客户数：{len(churn_risk)}")
print(f"平均流失天数：{churn_risk['R(最近天数)'].mean():.1f}天")
print()

# 8. 业务建议
print("="*60)
print("业务建议")
print("="*60)

for customer_type in ['高价值客户', '重要发展客户', '流失风险客户']:
    type_data = rfm[rfm['客户类型'] == customer_type]
    count = len(type_data)
    pct = count / len(rfm) * 100
    
    print(f"\\n【{customer_type}】（{count}人，占比{pct:.1f}%）")
    if customer_type == '高价值客户':
        print("  策略：VIP专属服务、个性化推荐、积分奖励计划")
    elif customer_type == '重要发展客户':
        print("  策略：促销活动推送、升级激励、提升购买频率")
    elif customer_type == '流失风险客户':
        print("  策略：流失预警、定向召回、专属优惠券")
print()

# 9. 验证
print("="*60)
print("验证结果")
print("="*60)
assert rfm['RFM总分'].min() >= 3, "RFM总分不应低于3"
assert rfm['RFM总分'].max() <= 15, "RFM总分不应高于15"
assert len(high_value) > 0, "应该有高价值客户"
print(f"✓ RFM分析完成！共分析{len(rfm)}个客户")
print(f"✓ 发现{len(high_value)}个高价值客户")
`,
    tips: ['R(Recency)越小表示越近，F(Frequency)和M(Monetary)越大越好', 'RFM总分15分为满分，9分为平均', '高价值客户需要重点维护，流失风险客户需要及时挽回']
  },
  {
    id: 'bi-project-4',
    chapterId: 'chapter-56',
    title: '用户行为路径聚类（KMeans）',
    description: '聚类分析、特征标准化、肘部法则、聚类结果解读。用户数据包含浏览时长、点击次数、加购次数、下单量，清洗异常值后标准化，使用KMeans聚类，为每个用户打标并可视化聚类中心雷达图。',
    difficulty: '进阶',
    skills: ['KMeans聚类', '特征标准化', '用户分群'],
    initialCode: `import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score

# 1. 生成模拟用户行为数据
np.random.seed(42)
n_users = 500

# 用户行为特征
user_data = []
for user_id in range(1, n_users + 1):
    # 根据用户类型设置不同的行为模式
    if user_id <= 150:
        # 高活跃用户：浏览时间长，点击多，加购多，下单多
        browse_time = np.random.normal(600, 100)  # 600秒
        click_count = np.random.normal(30, 8)
        add_cart_count = np.random.normal(8, 2)
        order_count = np.random.normal(5, 1)
    elif user_id <= 300:
        # 中等活跃用户
        browse_time = np.random.normal(300, 80)
        click_count = np.random.normal(15, 5)
        add_cart_count = np.random.normal(4, 1.5)
        order_count = np.random.normal(2.5, 0.8)
    elif user_id <= 400:
        # 低活跃用户
        browse_time = np.random.normal(120, 40)
        click_count = np.random.normal(8, 3)
        add_cart_count = np.random.normal(1.5, 0.8)
        order_count = np.random.normal(1.2, 0.5)
    else:
        # 浏览型用户：浏览多但下单少
        browse_time = np.random.normal(450, 90)
        click_count = np.random.normal(20, 6)
        add_cart_count = np.random.normal(2, 1)
        order_count = np.random.normal(0.5, 0.3)
    
    user_data.append({
        '用户ID': user_id,
        '浏览时长_秒': max(browse_time, 10),
        '点击次数': max(int(click_count), 1),
        '加购次数': max(add_cart_count, 0),
        '下单量': max(order_count, 0)
    })

df = pd.DataFrame(user_data)

print("="*60)
print("用户行为数据概览")
print("="*60)
print(f"用户数：{len(df)}")
print("\\n数据前15行：")
print(df.head(15))
print()
print("数据统计：")
print(df.describe().round(2))
print()

# 2. 数据清洗
print("="*60)
print("数据清洗")
print("="*60)

# 剔除异常值（3σ原则）
features = ['浏览时长_秒', '点击次数', '加购次数', '下单量']
for feature in features:
    mean_val = df[feature].mean()
    std_val = df[feature].std()
    lower_bound = mean_val - 3 * std_val
    upper_bound = mean_val + 3 * std_val
    
    outliers = (df[feature] < lower_bound) | (df[feature] > upper_bound)
    n_outliers = outliers.sum()
    
    if n_outliers > 0:
        print(f"{feature}: 发现{n_outliers}个异常值，已剔除")
        df = df[~outliers]

print(f"清洗后用户数：{len(df)}")
print()

# 3. 特征标准化
print("="*60)
print("特征标准化")
print("="*60)

X = df[features]
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

print("标准化后的特征（前10行）：")
print(pd.DataFrame(X_scaled, columns=features).head(10).round(4))
print()

# 4. 肘部法则确定最佳K值
print("="*60)
print("肘部法则确定最佳K值")
print("="*60)

inertias = []
silhouette_scores = []
k_range = range(2, 11)

for k in k_range:
    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    kmeans.fit(X_scaled)
    inertias.append(kmeans.inertia_)
    sil_score = silhouette_score(X_scaled, kmeans.labels_)
    silhouette_scores.append(sil_score)
    print(f"K={k}: Inertia={kmeans.inertia_:.2f}, 轮廓系数={sil_score:.4f}")

# 选择K=4
best_k = 4
print(f"\\n选择K={best_k}")
print()

# 5. KMeans聚类
print("="*60)
print("用户行为聚类")
print("="*60)

kmeans = KMeans(n_clusters=best_k, random_state=42, n_init=10)
df['簇标签'] = kmeans.fit_predict(X_scaled)

print("聚类结果分布：")
print(df['簇标签'].value_counts().sort_index())
print()

# 计算轮廓系数
final_sil_score = silhouette_score(X_scaled, df['簇标签'])
print(f"最终轮廓系数：{final_sil_score:.4f}")
print()

# 6. 聚类特征分析
print("="*60)
print("各簇用户行为特征")
print("="*60)

cluster_stats = df.groupby('簇标签')[features].mean().round(2)
cluster_stats['用户数'] = df.groupby('簇标签').size()

print(cluster_stats)
print()

# 7. 为各簇命名
print("="*60)
print("用户群体画像")
print("="*60)

cluster_names = {}
for cluster_id in range(best_k):
    stats = cluster_stats.loc[cluster_id]
    
    # 基于特征判断用户类型
    if stats['浏览时长_秒'] > 400 and stats['下单量'] > 4:
        name = '高价值活跃用户'
    elif stats['浏览时长_秒'] > 250 and stats['下单量'] > 2:
        name = '潜力用户'
    elif stats['下单量'] < 1:
        name = '浏览型用户'
    else:
        name = '一般用户'
    
    cluster_names[cluster_id] = name
    print(f"\\n【簇{cluster_id}】{name}")
    print(f"  用户数：{int(stats['用户数'])}")
    print(f"  平均浏览时长：{stats['浏览时长_秒']:.0f}秒")
    print(f"  平均点击次数：{stats['点击次数']:.1f}次")
    print(f"  平均加购次数：{stats['加购次数']:.1f}次")
    print(f"  平均下单量：{stats['下单量']:.1f}单")

df['用户类型'] = df['簇标签'].map(cluster_names)
print()

# 8. 聚类中心雷达图数据
print("="*60)
print("聚类中心雷达图数据")
print("="*60)

cluster_centers = pd.DataFrame(
    scaler.inverse_transform(kmeans.cluster_centers_),
    columns=features,
    index=[f'簇{i}({cluster_names[i]})' for i in range(best_k)]
)
print(cluster_centers.round(2))
print()

# 9. 业务建议
print("="*60)
print("业务建议")
print("="*60)

for user_type in cluster_names.values():
    type_data = df[df['用户类型'] == user_type]
    print(f"\\n【{user_type}】（{len(type_data)}人）")
    
    if '高价值' in user_type:
        print("  策略：VIP专属服务、优先体验新品、积分加倍")
    elif '潜力' in user_type:
        print("  策略：引导下单、促进加购、限时优惠")
    elif '浏览' in user_type:
        print("  策略：优化商品推荐、增加互动、提升购买转化")
    else:
        print("  策略：定期触达、促销活动提醒")

# 10. 验证
print()
print("="*60)
print("验证结果")
print("="*60)
assert '簇标签' in df.columns, "聚类结果缺失"
assert len(df['簇标签'].unique()) == best_k, "簇数量不正确"
print(f"✓ 聚类完成，共{len(df)}个用户分成{best_k}个群体")
print(f"✓ 轮廓系数：{final_sil_score:.4f}")
print("✓ 用户行为聚类分析完成！")
`,
    tips: ['轮廓系数越接近1表示聚类效果越好', '雷达图可以直观展示不同用户群体的行为差异', '聚类结果可以指导差异化的运营策略']
  },
  {
    id: 'bi-project-5',
    chapterId: 'chapter-57',
    title: '退货原因文本聚类（非结构化→结构化）',
    description: '文本清洗、TF-IDF、KMeans文本聚类、词云。退货评论列含短文本，分词、去停用词，转换为TF-IDF矩阵，聚类（3~5类），每类提取高频词，分析主要退货原因。',
    difficulty: '进阶',
    skills: ['文本聚类', 'TF-IDF', '词云分析'],
    initialCode: `import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import silhouette_score

# 1. 生成模拟退货评论数据
np.random.seed(42)
n_returns = 500

# 退货原因模板
reason_templates = {
    '质量': [
        '质量太差，用了几天就坏了',
        '商品有瑕疵，不满意',
        '做工粗糙，不值这个价',
        '材质和描述不符',
        '质量有问题，申请退货'
    ],
    '尺寸': [
        '尺码偏大/偏小，不合适',
        '尺寸不合适，需要换货',
        '大小不合适',
        '尺码不对',
        '衣服太大/太小了'
    ],
    '外观': [
        '颜色和图片差距大',
        '外观和描述不符',
        '实物不好看',
        '颜色不喜欢',
        '款式不喜欢'
    ],
    '物流': [
        '物流太慢，等太久',
        '包装破损',
        '收到时商品损坏',
        '快递服务差',
        '配送时间太长'
    ],
    '服务': [
        '售后服务态度不好',
        '客服回复慢',
        '商家不负责任',
        '退货流程太复杂',
        '退款慢'
    ]
}

return_data = []
for i in range(n_returns):
    # 随机选择退货原因类型
    reason_type = np.random.choice(list(reason_templates.keys()))
    comment = np.random.choice(reason_templates[reason_type])
    
    # 添加一些随机噪声
    if np.random.random() < 0.1:
        comment = comment + '，另外...'
    
    return_data.append({
        '退货ID': f'RET{str(i+1).zfill(5)}',
        '退货原因': comment,
        '原因类型': reason_type,
        '退货金额': np.random.uniform(50, 1000),
        '退货数量': np.random.randint(1, 5)
    })

returns_df = pd.DataFrame(return_data)

print("="*60)
print("退货评论数据概览")
print("="*60)
print(f"总退货数：{len(returns_df)}")
print("\\n退货数据前20行：")
print(returns_df[['退货ID', '退货原因', '原因类型']].head(20))
print()

# 2. 文本预处理
print("="*60)
print("文本预处理")
print("="*60)

# 定义停用词
stopwords = ['的', '了', '和', '是', '在', '有', '不', '我', '也', '很', '都', '就', '到', '这', '那', '个', '一', '上', '下', '中', '来', '去', '说', '要', '还', '没', '但']

def clean_text(text):
    """简单的文本清洗"""
    # 移除特殊字符
    text = ''.join(char for char in text if char.isalnum() or char.isspace())
    # 分词（简化的中文分词）
    words = text.split()
    # 移除停用词
    words = [w for w in words if w not in stopwords and len(w) > 1]
    return ' '.join(words)

returns_df['清洗后文本'] = returns_df['退货原因'].apply(clean_text)

print("文本清洗结果：")
for i in range(10):
    print(f"  原文：{returns_df.iloc[i]['退货原因']}")
    print(f"  清洗：{returns_df.iloc[i]['清洗后文本']}")
    print()
print()

# 3. TF-IDF向量化
print("="*60)
print("TF-IDF向量化")
print("="*60)

vectorizer = TfidfVectorizer(max_features=20, min_df=2)
tfidf_matrix = vectorizer.fit_transform(returns_df['清洗后文本'])

print(f"TF-IDF矩阵形状：{tfidf_matrix.shape}")
print(f"特征词数：{len(vectorizer.get_feature_names_out())}")
print("\\n关键词：")
print(vectorizer.get_feature_names_out())
print()

# 4. KMeans聚类
print("="*60)
print("退货原因聚类")
print("="*60)

best_k = 5
kmeans = KMeans(n_clusters=best_k, random_state=42, n_init=10)
returns_df['簇标签'] = kmeans.fit_predict(tfidf_matrix)

print(f"聚类数量：{best_k}")
print("聚类结果分布：")
print(returns_df['簇标签'].value_counts().sort_index())
print()

# 计算轮廓系数
sil_score = silhouette_score(tfidf_matrix, returns_df['簇标签'])
print(f"轮廓系数：{sil_score:.4f}")
print()

# 5. 分析每个聚类
print("="*60)
print("各聚类退货原因分析")
print("="*60)

cluster_analysis = []
for cluster_id in range(best_k):
    cluster_data = returns_df[returns_df['簇标签'] == cluster_id]
    
    # 统计高频词
    cluster_texts = ' '.join(cluster_data['清洗后文本'].tolist())
    word_freq = pd.Series(cluster_texts.split()).value_counts()
    top_words = word_freq.head(5).index.tolist()
    
    # 统计原因类型分布
    reason_dist = cluster_data['原因类型'].value_counts()
    top_reasons = reason_dist.head(3).index.tolist()
    
    # 计算平均退货金额
    avg_amount = cluster_data['退货金额'].mean()
    
    cluster_analysis.append({
        '簇ID': cluster_id,
        '退货数': len(cluster_data),
        '平均金额': avg_amount,
        '高频原因': ', '.join(top_reasons),
        '关键词': ', '.join(top_words)
    })

cluster_df = pd.DataFrame(cluster_analysis)

# 为各簇命名
def name_cluster(row):
    keywords = row['关键词']
    if any(word in keywords for word in ['质量', '瑕疵', '做工']):
        return '质量问题退货'
    elif any(word in keywords for word in ['尺码', '大小', '合适']):
        return '尺寸问题退货'
    elif any(word in keywords for word in ['颜色', '外观', '款式']):
        return '外观问题退货'
    elif any(word in keywords for word in ['物流', '包装', '快递', '配送']):
        return '物流问题退货'
    else:
        return '其他原因退货'

cluster_df['退货类型'] = cluster_df.apply(name_cluster, axis=1)

print(cluster_df)
print()

# 6. 详细分析各类型
print("="*60)
print("各退货类型详细分析")
print("="*60)

returns_df['退货类型'] = returns_df['簇标签'].map(
    dict(zip(cluster_df['簇ID'], cluster_df['退货类型']))
)

for return_type in cluster_df['退货类型']:
    type_data = returns_df[returns_df['退货类型'] == return_type]
    print(f"\\n【{return_type}】（{len(type_data)}单，占比{len(type_data)/len(returns_df)*100:.1f}%）")
    print(f"  平均退货金额：¥{type_data['退货金额'].mean():.2f}")
    print(f"  典型评论：")
    for _, row in type_data.sample(min(3, len(type_data))).iterrows():
        print(f"    - {row['退货原因']}")
print()

# 7. 业务建议
print("="*60)
print("业务改进建议")
print("="*60)

for _, row in cluster_df.iterrows():
    return_type = row['退货类型']
    count = row['退货数']
    pct = count / len(returns_df) * 100
    
    print(f"\\n【{return_type}】{count}单（{pct:.1f}%）")
    if '质量' in return_type:
        print("  建议：加强供应商质量管控，完善质检流程")
    elif '尺寸' in return_type:
        print("  建议：提供详细尺码表，增加试穿/试戴功能")
    elif '外观' in return_type:
        print("  建议：优化商品图片展示，提供360度视图")
    elif '物流' in return_type:
        print("  建议：升级包装材料，优化物流合作")
    else:
        print("  建议：分析具体原因，针对性改进")

# 8. 验证
print()
print("="*60)
print("验证结果")
print("="*60)
assert '簇标签' in returns_df.columns, "聚类结果缺失"
print(f"✓ 文本聚类完成，共{len(returns_df)}条退货记录")
print(f"✓ 发现{best_k}种主要退货原因类型")
print("✓ 退货原因文本聚类分析完成！")
`,
    tips: ['TF-IDF可以衡量词语在文档中的重要程度', '聚类可以自动发现退货原因的类型', '结合定量和定性分析可以得到更全面的洞察']
  },
  {
    id: 'bi-project-6',
    chapterId: 'chapter-58',
    title: '销量预测特征工程与基线模型',
    description: '时序聚合、特征构造、滞后特征、滚动统计。日销售数据，构造星期、月份、节假日特征，过去7天滚动均值/销量滞后1~7，使用线性回归或决策树预测次日销量，评估RMSE。',
    difficulty: '进阶',
    skills: ['特征工程', '销量预测', '时间序列'],
    initialCode: `import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# 1. 生成模拟日销售数据
np.random.seed(42)
n_days = 365
start_date = datetime(2024, 1, 1)

# 基础销量
base_sales = 500

sales_data = []
for i in range(n_days):
    current_date = start_date + timedelta(days=i)
    
    # 考虑星期效应（周末销量更高）
    day_of_week = current_date.weekday()
    if day_of_week >= 5:  # 周六、周日
        weekday_factor = 1.3
    else:
        weekday_factor = 1.0
    
    # 考虑月份效应（年初年末略高）
    month = current_date.month
    if month in [1, 2, 11, 12]:  # 年初年末
        month_factor = 1.2
    elif month in [6, 7, 8]:  # 夏季
        month_factor = 1.1
    else:
        month_factor = 1.0
    
    # 计算销量
    sales = base_sales * weekday_factor * month_factor * np.random.uniform(0.8, 1.2)
    
    sales_data.append({
        '日期': current_date,
        '销量': int(sales)
    })

sales_df = pd.DataFrame(sales_data)
sales_df['日期'] = pd.to_datetime(sales_df['日期'])

print("="*60)
print("日销售数据概览")
print("="*60)
print(f"数据天数：{len(sales_df)}")
print("\\n前20天销售数据：")
print(sales_df.head(20))
print()
print("数据统计：")
print(sales_df['销量'].describe())
print()

# 2. 特征工程
print("="*60)
print("特征工程")
print("="*60)

# 时间特征
sales_df['星期'] = sales_df['日期'].dt.dayofweek
sales_df['月份'] = sales_df['日期'].dt.month
sales_df['季度'] = sales_df['日期'].dt.quarter
sales_df['星期几'] = sales_df['日期'].dt.day_name()
sales_df['月份名称'] = sales_df['日期'].dt.month_name()

# 是否周末
sales_df['是否周末'] = (sales_df['星期'] >= 5).astype(int)

# 是否月初/月末
sales_df['是否月初'] = (sales_df['日期'].dt.day <= 5).astype(int)
sales_df['是否月末'] = (sales_df['日期'].dt.day >= 25).astype(int)

print("时间特征：")
print(sales_df[['日期', '星期', '星期几', '月份', '季度', '是否周末']].head(20))
print()

# 滞后特征（Lag Features）
print("="*60)
print("滞后特征构造")
print("="*60)

# 过去1-7天的销量
for lag in range(1, 8):
    sales_df[f'销量_lag_{lag}'] = sales_df['销量'].shift(lag)

# 验证：滞后特征不包含未来信息
print("验证：滞后特征只使用历史值（lag>0）")
print()

# 滚动统计特征
sales_df['销量_rolling_7d_mean'] = sales_df['销量'].shift(1).rolling(window=7).mean()
sales_df['销量_rolling_7d_std'] = sales_df['销量'].shift(1).rolling(window=7).std()
sales_df['销量_rolling_14d_mean'] = sales_df['销量'].shift(1).rolling(window=14).mean()

print("滚动统计特征（前20行）：")
print(sales_df[['日期', '销量', '销量_lag_1', '销量_rolling_7d_mean', '销量_rolling_7d_std']].head(20).round(2))
print()

# 3. 数据准备
print("="*60)
print("数据准备")
print("="*60)

# 选择特征列
feature_cols = ['星期', '月份', '季度', '是否周末', '是否月初', '是否月末',
                '销量_lag_1', '销量_lag_2', '销量_lag_3', '销量_lag_4', '销量_lag_5', '销量_lag_6', '销量_lag_7',
                '销量_rolling_7d_mean', '销量_rolling_7d_std', '销量_rolling_14d_mean']

# 删除含有NaN的行（由于滞后特征）
df_model = sales_df.dropna(subset=feature_cols + ['销量']).copy()

print(f"有效数据行数：{len(df_model)}（删除{len(sales_df) - len(df_model)}行NaN）")

# 划分训练集和测试集
train_size = int(len(df_model) * 0.8)
train_df = df_model.iloc[:train_size]
test_df = df_model.iloc[train_size:]

X_train = train_df[feature_cols]
y_train = train_df['销量']
X_test = test_df[feature_cols]
y_test = test_df['销量']

print(f"训练集大小：{len(X_train)}")
print(f"测试集大小：{len(X_test)}")
print()

# 4. 构建基线模型（使用平均值的简单预测）
print("="*60)
print("基线模型（简单平均）")
print("="*60)

# 预测值 = 过去7天平均
baseline_pred = X_test['销量_rolling_7d_mean']
baseline_rmse = np.sqrt(((y_test - baseline_pred) ** 2).mean())

print(f"基线模型RMSE：{baseline_rmse:.2f}")
print()

# 5. 线性回归模型
print("="*60)
print("线性回归模型")
print("="*60)

# 简化的线性回归实现
X_train_bias = np.column_stack([np.ones(len(X_train)), X_train.values])
X_test_bias = np.column_stack([np.ones(len(X_test)), X_test.values])

# 正规方程求解
theta = np.linalg.lstsq(X_train_bias, y_train.values, rcond=None)[0]
lr_pred = X_test_bias @ theta

lr_rmse = np.sqrt(((y_test - lr_pred) ** 2).mean())

print(f"线性回归RMSE：{lr_rmse:.2f}")
print(f"RMSE改善：{((baseline_rmse - lr_rmse) / baseline_rmse * 100):.2f}%")
print()

# 6. 模型评估
print("="*60)
print("模型评估")
print("="*60)

# 计算准确率（误差<20%的比例）
threshold = 0.2
baseline_accuracy = (abs(y_test - baseline_pred) / y_test < threshold).mean()
lr_accuracy = (abs(y_test - lr_pred) / y_test < threshold).mean()

print("预测准确率（误差<20%）：")
print(f"  基线模型：{baseline_accuracy:.2%}")
print(f"  线性回归：{lr_accuracy:.2%}")
print()

# 特征重要性（简化的系数）
print("特征重要性（线性回归系数）：")
feature_importance = pd.DataFrame({
    '特征': ['截距'] + feature_cols,
    '系数': theta
}).sort_values('系数', key=abs, ascending=False)
print(feature_importance.head(10).round(4))
print()

# 7. 预测结果示例
print("="*60)
print("预测结果示例（后10天）")
print("="*60)

result_df = pd.DataFrame({
    '日期': test_df['日期'].values[-10:],
    '实际销量': y_test.values[-10:],
    '预测销量': lr_pred[-10:].round(0).astype(int),
    '误差': (lr_pred[-10:] - y_test.values[-10:]).round(2),
    '误差率': ((lr_pred[-10:] - y_test.values[-10:]) / y_test.values[-10:] * 100).round(2)
})
print(result_df)
print()

# 8. 业务应用
print("="*60)
print("业务应用建议")
print("="*60)

print("1. 库存优化：根据预测销量调整备货量")
print("2. 人员排班：预测高峰时段提前安排人员")
print("3. 营销活动：预测低销量时段进行促销")
print("4. 物流调度：提前调整配送资源")
print()

# 9. 验证
print("="*60)
print("验证结果")
print("="*60)

# 验证：滞后特征确实不包含未来信息
for lag in range(1, 8):
    assert f'销量_lag_{lag}' in df_model.columns, f"缺少滞后特征 lag_{lag}"

# 验证：预测RMSE应该小于基线
assert lr_rmse < baseline_rmse * 1.1, "模型性能过差"

print("✓ 特征工程验证通过")
print(f"✓ 销量预测完成，测试集RMSE：{lr_rmse:.2f}")
print(f"✓ 预测准确率（误差<20%）：{lr_accuracy:.2%}")
`,
    tips: ['滞后特征只能使用历史数据，不能包含未来信息', 'RMSE是回归任务的常用评估指标，越小越好', '特征工程的质量直接影响模型效果']
  },
  {
    id: 'bi-project-7',
    chapterId: 'chapter-59',
    title: '商品价格敏感度聚类分析（价格带偏好）',
    description: '二维聚类（价格 vs 销量占比）、数据分箱与聚合。商品交易明细计算每个商品的平均单价与总销量，标准化后KMeans聚类，划分低价高量、高价低量、中价中庸等类型。',
    difficulty: '基础',
    skills: ['价格分析', '聚类分析', '价格敏感度'],
    initialCode: `import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt

# 1. 生成模拟商品交易数据
np.random.seed(42)
n_products = 100
n_transactions = 5000

product_data = []
for trans_id in range(n_transactions):
    product_id = np.random.randint(1, n_products + 1)
    unit_price = np.random.uniform(10, 500)
    quantity = np.random.randint(1, 10)
    
    product_data.append({
        '商品ID': product_id,
        '单价': unit_price,
        '数量': quantity,
        '销售额': unit_price * quantity
    })

trans_df = pd.DataFrame(product_data)

print("="*60)
print("商品交易数据概览")
print("="*60)
print(f"总交易数：{len(trans_df)}")
print("\\n交易数据前15行：")
print(trans_df.head(15))
print()

# 2. 按商品聚合统计
print("="*60)
print("按商品聚合统计")
print("="*60)

product_stats = trans_df.groupby('商品ID').agg({
    '单价': 'mean',  # 平均单价
    '数量': 'sum',  # 总销量
    '销售额': 'sum'  # 总销售额
}).reset_index()

product_stats.columns = ['商品ID', '平均单价', '总销量', '总销售额']

print("商品统计（前20行）：")
print(product_stats.head(20).round(2))
print()

# 3. 价格带分析
print("="*60)
print("价格带分布")
print("="*60)

# 将商品按价格分箱
price_bins = [0, 50, 100, 200, 500, 1000]
price_labels = ['0-50元', '50-100元', '100-200元', '200-500元', '500元以上']
product_stats['价格带'] = pd.cut(product_stats['平均单价'], bins=price_bins, labels=price_labels)

price_dist = product_stats.groupby('价格带').agg({
    '商品ID': 'count',
    '总销量': 'sum',
    '总销售额': 'sum'
}).round(2)
price_dist.columns = ['商品数', '总销量', '总销售额']

print("各价格带分布：")
print(price_dist)
print()

# 4. KMeans聚类
print("="*60)
print("商品价格敏感度聚类")
print("="*60)

# 选择特征：平均单价和总销量
features = ['平均单价', '总销量']
X = product_stats[features]

# 标准化
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 聚类
n_clusters = 4
kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
product_stats['簇标签'] = kmeans.fit_predict(X_scaled)

print(f"聚类数量：{n_clusters}")
print("聚类结果分布：")
print(product_stats['簇标签'].value_counts().sort_index())
print()

# 5. 聚类特征分析
print("="*60)
print("各簇商品特征分析")
print("="*60)

cluster_stats = product_stats.groupby('簇标签').agg({
    '商品ID': 'count',
    '平均单价': 'mean',
    '总销量': 'mean',
    '总销售额': 'mean'
}).round(2)

cluster_stats.columns = ['商品数', '平均单价', '平均销量', '平均销售额']

print(cluster_stats)
print()

# 为各簇命名
def name_cluster(row):
    avg_price = row['平均单价']
    avg_quantity = row['平均销量']
    
    # 根据平均价格和销量判断
    if avg_price < 100 and avg_quantity > 200:
        return '低价爆款'
    elif avg_price > 300 and avg_quantity < 100:
        return '高端小众'
    elif avg_price > 150 and avg_quantity > 150:
        return '中价畅销'
    else:
        return '一般商品'

cluster_stats['商品类型'] = cluster_stats.apply(name_cluster, axis=1)

print(cluster_stats)
print()

# 6. 可视化数据准备
print("="*60)
print("聚类散点图数据")
print("="*60)

product_stats['商品类型'] = product_stats['簇标签'].map(
    dict(zip(cluster_stats.index, cluster_stats['商品类型']))
)

for cluster_type in cluster_stats['商品类型']:
    type_data = product_stats[product_stats['商品类型'] == cluster_type]
    print(f"\\n【{cluster_type}】{len(type_data)}个商品")
    print(f"  价格范围：¥{type_data['平均单价'].min():.0f} - ¥{type_data['平均单价'].max():.0f}")
    print(f"  销量范围：{type_data['总销量'].min():.0f} - {type_data['总销量'].max():.0f}")
    print(f"  代表商品ID：{type_data['商品ID'].head(5).tolist()}")

print()

# 7. 价格敏感度分析
print("="*60)
print("价格敏感度分析")
print("="*60)

# 计算每个簇的价格敏感度指标
# 价格敏感度 = 低价格商品销量占比
for cluster_type in cluster_stats['商品类型']:
    type_data = product_stats[product_stats['商品类型'] == cluster_type]
    low_price_ratio = (type_data['平均单价'] < 100).mean()
    high_price_ratio = (type_data['平均单价'] > 300).mean()
    
    print(f"【{cluster_type}】")
    print(f"  低价商品占比：{low_price_ratio:.1%}")
    print(f"  高价商品占比：{high_price_ratio:.1%}")
    print()

# 8. 业务建议
print("="*60)
print("业务建议")
print("="*60)

for _, row in cluster_stats.iterrows():
    cluster_type = row['商品类型']
    count = row['商品数']
    
    print(f"\\n【{cluster_type}】（{int(count)}个商品）")
    if '爆款' in cluster_type:
        print("  策略：薄利多销，保证库存充足，关注成本控制")
    elif '小众' in cluster_type:
        print("  策略：提升服务体验，强调品质，精准营销")
    elif '畅销' in cluster_type:
        print("  策略：优化产品组合，维持价格竞争力")
    else:
        print("  策略：分析提升空间，考虑差异化或优化")

# 9. 方差分析验证
print()
print("="*60)
print("方差分析验证")
print("="*60)

# 验证：各簇平均价格差异是否显著
cluster_prices = [product_stats[product_stats['簇标签'] == i]['平均单价'].values 
                  for i in range(n_clusters)]
price_variance = np.var([np.mean(p) for p in cluster_prices])

print(f"各簇平均价格方差：{price_variance:.2f}")
print(f"验证：方差显著（>{10}）→ {'是' if price_variance > 10 else '否'}")

# 10. 验证
print()
print("="*60)
print("验证结果")
print("="*60)
assert '簇标签' in product_stats.columns, "聚类结果缺失"
print(f"✓ 价格聚类完成，共{len(product_stats)}个商品分成{n_clusters}个类型")
print("✓ 聚类分析完成！")
`,
    tips: ['二维聚类可以直观展示商品的价格-销量分布', '不同聚类的商品需要不同的营销策略', '价格敏感度分析有助于定价决策']
  },
  {
    id: 'bi-project-8',
    chapterId: 'chapter-60',
    title: '动态购物车智能推荐模拟（协同过滤 + 关联规则对比）',
    description: '用户-商品矩阵、基于项目的协同过滤（余弦相似度）、关联规则对比。使用用户购买历史，若用户加入商品A，基于相似商品推荐Top3，同时与关联规则推荐结果对比。',
    difficulty: '进阶',
    skills: ['协同过滤', '余弦相似度', '智能推荐'],
    initialCode: `import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

# 1. 生成模拟用户-商品交互数据
np.random.seed(42)
n_users = 50
n_products = 30
n_interactions = 500

products = {i: f'商品{i}' for i in range(1, n_products + 1)}

interaction_data = []
for _ in range(n_interactions):
    user_id = np.random.randint(1, n_users + 1)
    product_id = np.random.randint(1, n_products + 1)
    
    interaction_data.append({
        '用户ID': user_id,
        '商品ID': product_id,
        '是否购买': 1
    })

interactions_df = pd.DataFrame(interaction_data).drop_duplicates()

print("="*60)
print("用户-商品交互数据")
print("="*60)
print(f"总交互数：{len(interactions_df)}")
print("\\n交互数据前20行：")
print(interactions_df.head(20))
print()

# 2. 构建用户-商品矩阵
print("="*60)
print("构建用户-商品矩阵")
print("="*60)

user_product_matrix = interactions_df.pivot_table(
    index='用户ID',
    columns='商品ID',
    values='是否购买',
    fill_value=0
)

print(f"用户-商品矩阵形状：{user_product_matrix.shape}")
print("\\n用户-商品矩阵（前10用户，前10商品）：")
print(user_product_matrix.iloc[:10, :10])
print()

# 3. 基于项目的协同过滤
print("="*60)
print("基于项目的协同过滤（Item-based CF）")
print("="*60)

# 计算商品相似度矩阵（余弦相似度）
item_similarity = cosine_similarity(user_product_matrix.T)
item_similarity_df = pd.DataFrame(
    item_similarity,
    index=user_product_matrix.columns,
    columns=user_product_matrix.columns
)

print(f"商品相似度矩阵形状：{item_similarity_df.shape}")
print("\\n商品相似度示例（商品1与其他商品的相似度）：")
print(item_similarity_df[1].sort_values(ascending=False).head(10).round(4))
print()

# 4. 定义推荐函数
def item_based_recommend(target_item, top_n=3):
    """基于项目协同过滤推荐"""
    # 获取与目标商品最相似的Top N商品
    similar_items = item_similarity_df[target_item].sort_values(ascending=False)
    # 排除自身
    similar_items = similar_items.drop(target_item)
    # 返回Top N推荐
    return similar_items.head(top_n)

# 5. 关联规则推荐
print("="*60)
print("关联规则推荐")
print("="*60)

# 计算商品共现
co_occurrence = user_product_matrix.T.dot(user_product_matrix)
np.fill_diagonal(co_occurrence.values, 0)

# 计算支持度
item_support = user_product_matrix.sum() / len(user_product_matrix)
total_transactions = len(user_product_matrix)

# 计算关联规则
def association_rule_recommend(target_item, top_n=3):
    """基于关联规则推荐"""
    recommendations = {}
    
    for other_item in range(1, n_products + 1):
        if other_item != target_item:
            # 计算支持度和置信度
            co_count = co_occurrence.loc[target_item, other_item]
            support_both = co_count / total_transactions
            confidence = support_both / item_support[target_item] if item_support[target_item] > 0 else 0
            
            if confidence > 0:
                recommendations[other_item] = {
                    '共现次数': int(co_count),
                    '置信度': confidence
                }
    
    # 按置信度排序
    sorted_recs = sorted(recommendations.items(), 
                        key=lambda x: x[1]['置信度'], 
                        reverse=True)
    return sorted_recs[:top_n]

# 6. 推荐示例
print("="*60)
print("推荐示例")
print("="*60)

# 选择一个测试商品
test_item = 1
print(f"测试商品：{products[test_item]}")
print()

# 协同过滤推荐
print("【基于项目协同过滤推荐】")
cf_recs = item_based_recommend(test_item, top_n=3)
print(f"基于与「{products[test_item]}」相似的商品：")
for item_id, similarity in cf_recs.items():
    print(f"  {products[item_id]}（相似度：{similarity:.4f})")
print()

# 关联规则推荐
print("【基于关联规则推荐】")
ar_recs = association_rule_recommend(test_item, top_n=3)
print(f"购买「{products[test_item]}」后常购买：")
for item_id, info in ar_recs:
    print(f"  {products[item_id]}（置信度：{info['置信度']:.2%}，共现{info['共现次数']}次）")
print()

# 7. 对比分析
print("="*60)
print("两种推荐方法对比")
print("="*60)

cf_set = set(cf_recs.index)
ar_set = set([item_id for item_id, _ in ar_recs])

overlap = cf_set & ar_set
only_cf = cf_set - ar_set
only_ar = ar_set - cf_set

print(f"协同过滤推荐商品：{cf_set}")
print(f"关联规则推荐商品：{ar_set}")
print(f"重叠商品：{overlap if overlap else '无'}")
print(f"仅协同过滤：{only_cf if only_cf else '无'}")
print(f"仅关联规则：{only_ar if only_ar else '无'}")
print()

print("方法特点对比：")
print("  协同过滤：基于用户行为相似性，适合用户数据丰富的场景")
print("  关联规则：基于商品共现规律，解释性强，适合item数据丰富的场景")
print()

# 8. 业务应用
print("="*60)
print("业务应用场景")
print("="*60)

print("场景1：用户加入购物车后")
print("  → 展示相似商品推荐")
print("  → 展示购买了此商品的用户还买了")
print()

print("场景2：商品详情页")
print("  → 展示关联商品组合")
print("  → 展示热销搭配")
print()

print("场景3：购物车结算页")
print("  → 基于已选商品进行跨类目推荐")
print("  → 展示加购优惠组合")
print()

# 9. 验证
print("="*60)
print("验证结果")
print("="*60)

# 验证：推荐商品未被用户已购买
test_user = 1
user_purchased = set(user_product_matrix.loc[test_user][user_product_matrix.loc[test_user] == 1].index)

if len(cf_recs) > 0:
    for item_id in cf_recs.index:
        assert item_id not in user_purchased, f"推荐了用户已购买的商品{item_id}"

print(f"✓ 推荐商品未被用户已购买")
print(f"✓ 协同过滤推荐{len(cf_recs)}个商品")
print(f"✓ 关联规则推荐{len(ar_recs)}个商品")
print("✓ 智能推荐模拟完成！")
`,
    tips: ['协同过滤利用用户行为的相似性', '关联规则挖掘商品之间的共现关系', '两种方法可以互补使用，提升推荐效果']
  },
  {
    id: 'bi-project-9',
    chapterId: 'chapter-61',
    title: '异常交易检测（孤立森林 + 统计方法）',
    description: '异常检测、Z-score、孤立森林、多维特征。订单数据含金额、数量、折扣、用户注册时长等，使用Z-score与孤立森林标记异常订单，分析异常类型（欺诈？团购？）。',
    difficulty: '进阶',
    skills: ['异常检测', '孤立森林', '欺诈识别'],
    initialCode: `import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from datetime import datetime

# 1. 生成模拟订单数据
np.random.seed(42)
n_orders = 1000

order_data = []
for i in range(n_orders):
    order_id = f'ORD{str(i+1).zfill(6)}'
    user_id = np.random.randint(1, 201)
    order_date = datetime(2024, 1, 1) + pd.Timedelta(days=np.random.randint(0, 180))
    amount = np.random.uniform(50, 2000)
    quantity = np.random.randint(1, 10)
    discount = np.random.uniform(0, 0.3)
    user_age_days = np.random.randint(1, 1000)
    
    # 注入异常订单
    if i < 20:  # 高金额订单
        amount = np.random.uniform(5000, 10000)
    elif i < 35:  # 高折扣订单
        discount = np.random.uniform(0.7, 0.9)
    elif i < 45:  # 大量购买订单
        quantity = np.random.randint(50, 100)
    elif i < 50:  # 新用户大额订单
        user_age_days = np.random.randint(1, 7)
        amount = np.random.uniform(3000, 5000)
    
    order_data.append({
        '订单ID': order_id,
        '用户ID': user_id,
        '订单日期': order_date,
        '订单金额': amount,
        '购买数量': quantity,
        '折扣率': discount,
        '用户注册天数': user_age_days
    })

orders_df = pd.DataFrame(order_data)

print("="*60)
print("订单数据概览")
print("="*60)
print(f"总订单数：{len(orders_df)}")
print("\\n订单数据前20行：")
print(orders_df.head(20))
print()
print("数据统计：")
print(orders_df.describe().round(2))
print()

# 2. 特征工程
print("="*60)
print("特征工程")
print("="*60)

# 计算折扣金额
orders_df['折扣金额'] = orders_df['订单金额'] * orders_df['折扣率']

# 计算单价
orders_df['单价'] = orders_df['订单金额'] / orders_df['购买数量']

# 计算用户订单数
user_order_count = orders_df.groupby('用户ID').size().to_dict()
orders_df['用户订单数'] = orders_df['用户ID'].map(user_order_count)

print("增强特征：")
print(orders_df[['订单ID', '订单金额', '折扣率', '折扣金额', '购买数量', '单价', '用户注册天数', '用户订单数']].head(20))
print()

# 3. Z-score异常检测
print("="*60)
print("Z-score异常检测")
print("="*60)

features_zscore = ['订单金额', '购买数量', '折扣率', '用户注册天数']

for feature in features_zscore:
    mean_val = orders_df[feature].mean()
    std_val = orders_df[feature].std()
    
    orders_df[f'{feature}_zscore'] = (orders_df[feature] - mean_val) / std_val
    orders_df[f'{feature}_is_outlier_zscore'] = (abs(orders_df[f'{feature}_zscore']) > 3).astype(int)

# 综合Z-score异常标记
orders_df['Zscore_异常'] = (
    (orders_df['订单金额_is_outlier_zscore'] == 1) |
    (orders_df['购买数量_is_outlier_zscore'] == 1) |
    (orders_df['折扣率_is_outlier_zscore'] == 1)
).astype(int)

zscore_anomalies = orders_df[orders_df['Zscore_异常'] == 1]
print(f"Z-score检测到异常订单：{len(zscore_anomalies)}个")
print()

# 4. 孤立森林异常检测
print("="*60)
print("孤立森林异常检测")
print("="*60)

# 选择特征
features_if = ['订单金额', '购买数量', '折扣率', '用户注册天数', '单价']
X = orders_df[features_if]

# 孤立森林
iso_forest = IsolationForest(contamination=0.05, random_state=42, n_estimators=100)
orders_df['IF_异常分'] = iso_forest.fit_predict(X)
orders_df['IF_异常'] = (orders_df['IF_异常分'] == -1).astype(int)

if_anomalies = orders_df[orders_df['IF_异常'] == 1]
print(f"孤立森林检测到异常订单：{len(if_anomalies)}个")
print()

# 5. 两种方法对比
print("="*60)
print("异常检测方法对比")
print("="*60)

zscore_set = set(orders_df[orders_df['Zscore_异常'] == 1].index)
if_set = set(orders_df[orders_df['IF_异常'] == 1].index)

overlap = zscore_set & if_set
only_zscore = zscore_set - if_set
only_if = if_set - zscore_set

print(f"Z-score异常数：{len(zscore_set)}")
print(f"孤立森林异常数：{len(if_set)}")
print(f"重叠异常数：{len(overlap)}")
print(f"重叠比例：{len(overlap)/len(if_set)*100:.1f}%")
print()

# 6. 异常订单分析
print("="*60)
print("异常订单详细分析")
print("="*60)

# 综合异常标记
orders_df['综合异常'] = ((orders_df['Zscore_异常'] == 1) | (orders_df['IF_异常'] == 1)).astype(int)
total_anomalies = orders_df[orders_df['综合异常'] == 1]

print(f"综合异常订单总数：{len(total_anomalies)}")
print(f"异常订单占比：{len(total_anomalies)/len(orders_df)*100:.2f}%")
print()

# 分析异常类型
print("异常类型分析：")
high_amount = total_anomalies[total_anomalies['订单金额'] > 3000]
high_discount = total_anomalies[total_anomalies['折扣率'] > 0.5]
high_quantity = total_anomalies[total_anomalies['购买数量'] > 20]
new_user_large = total_anomalies[(total_anomalies['用户注册天数'] < 30) & (total_anomalies['订单金额'] > 2000)]

print(f"  高金额订单（>¥3000）：{len(high_amount)}个")
print(f"  高折扣订单（>50%）：{len(high_discount)}个")
print(f"  大量购买订单（>20件）：{len(high_quantity)}个")
print(f"  新用户大额订单：{len(new_user_large)}个")
print()

# 7. 异常订单示例
print("="*60)
print("异常订单示例")
print("="*60)

print("Top 10 高金额异常订单：")
top_amount_anomalies = total_anomalies.nlargest(10, '订单金额')
print(top_amount_anomalies[['订单ID', '订单金额', '购买数量', '折扣率', '用户注册天数']])
print()

print("Top 10 高折扣异常订单：")
top_discount_anomalies = total_anomalies.nlargest(10, '折扣率')
print(top_discount_anomalies[['订单ID', '订单金额', '购买数量', '折扣率', '用户注册天数']])
print()

# 8. 可视化数据准备
print("="*60)
print("异常分布可视化数据")
print("="*60)

print("各特征异常分布：")
for feature in ['订单金额', '购买数量', '折扣率']:
    outliers = total_anomalies[total_anomalies[f'{feature}_is_outlier_zscore'] == 1]
    print(f"  {feature}：{len(outliers)}个异常")

print()

# 9. 异常类型识别
print("="*60)
print("异常类型识别")
print("="*60)

def classify_anomaly(row):
    reasons = []
    
    if row['订单金额'] > 3000:
        reasons.append('高金额')
    if row['折扣率'] > 0.5:
        reasons.append('高折扣')
    if row['购买数量'] > 20:
        reasons.append('大量购买')
    if row['用户注册天数'] < 30 and row['订单金额'] > 2000:
        reasons.append('新用户高风险')
    
    return ' + '.join(reasons) if reasons else '其他异常'

total_anomalies = total_anomalies.copy()
total_anomalies['异常原因'] = total_anomalies.apply(classify_anomaly, axis=1)

anomaly_distribution = total_anomalies['异常原因'].value_counts()
print("异常类型分布：")
print(anomaly_distribution)
print()

# 10. 业务建议
print("="*60)
print("业务建议")
print("="*60)

print("1. 高金额订单：")
print("   → 建议：人工审核或增加支付验证")
print()

print("2. 高折扣订单：")
print("   → 建议：核查优惠券使用合理性")
print()

print("3. 大量购买订单：")
print("   → 建议：判断是批发商还是刷单")
print()

print("4. 新用户高风险订单：")
print("   → 建议：延迟发货，联系用户确认")
print()

# 11. 验证
print()
print("="*60)
print("验证结果")
print("="*60)

# 验证：重叠比例应该合理
overlap_ratio = len(overlap) / len(if_set) if len(if_set) > 0 else 0
assert 0 <= overlap_ratio <= 1, "重叠比例应该在0-1之间"

print(f"✓ Z-score检测异常：{len(zscore_set)}个")
print(f"✓ 孤立森林检测异常：{len(if_set)}个")
print(f"✓ 综合异常订单：{len(total_anomalies)}个")
print("✓ 异常交易检测完成！")
`,
    tips: ['Z-score适合单维度异常检测', '孤立森林适合多维度异常检测', '两种方法结合可以提高检测准确性']
  },
  {
    id: 'bi-project-10',
    chapterId: 'chapter-62',
    title: '端到端BI仪表盘项目（综合任务）',
    description: '前述所有技能 + 数据管道 + 仪表盘输出。给定多表数据（用户、订单、商品、物流），自行清洗合并，完成购物车分析+RFM+聚类+异常检测，动态筛选器展示KPI、图表、聚类客户画像。',
    difficulty: '综合',
    skills: ['端到端分析', 'BI仪表盘', '综合项目'],
    initialCode: `import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

print("="*70)
print("端到端BI仪表盘项目")
print("="*70)
print(f"项目时间：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print()

# ===================== 1. 数据生成与加载 =====================
print("="*70)
print("1. 数据生成与加载")
print("="*70)

np.random.seed(42)

# 用户表
n_users = 200
users = pd.DataFrame({
    '用户ID': range(1, n_users + 1),
    '用户名': [f'用户{i}' for i in range(1, n_users + 1)],
    '注册日期': [datetime(2024, 1, 1) + timedelta(days=np.random.randint(0, 180)) for _ in range(n_users)],
    '地区': np.random.choice(['华东', '华南', '华北', '华中', '西南'], n_users)
})

# 订单表
n_orders = 2000
orders = []
for i in range(n_orders):
    orders.append({
        '订单ID': f'ORD{str(i+1).zfill(6)}',
        '用户ID': np.random.randint(1, n_users + 1),
        '订单日期': datetime(2024, 1, 1) + timedelta(days=np.random.randint(0, 180)),
        '订单金额': np.random.uniform(50, 2000),
        '订单状态': np.random.choice(['已完成', '已取消', '待支付'], p=[0.85, 0.1, 0.05])
    })
orders_df = pd.DataFrame(orders)

# 商品表
n_products = 50
products = pd.DataFrame({
    '商品ID': range(1, n_products + 1),
    '商品名称': [f'商品{i}' for i in range(1, n_products + 1)],
    '商品类别': np.random.choice(['服装', '电子产品', '食品', '家居', '美妆'], n_products),
    '单价': np.random.uniform(20, 500, n_products).round(2)
})

# 物流表
logistics = pd.DataFrame({
    '订单ID': orders_df['订单ID'],
    '发货日期': orders_df['订单日期'] + timedelta(days=np.random.randint(1, 3)),
    '收货日期': orders_df['订单日期'] + timedelta(days=np.random.randint(3, 10)),
    '物流状态': np.random.choice(['已发货', '运输中', '已签收'], p=[0.2, 0.3, 0.5])
})

print(f"用户数：{len(users)}")
print(f"订单数：{len(orders_df)}")
print(f"商品数：{len(products)}")
print(f"物流记录数：{len(logistics)}")
print()

# ===================== 2. 数据清洗与合并 =====================
print("="*70)
print("2. 数据清洗与合并")
print("="*70)

# 数据清洗
# 1. 删除重复
users_clean = users.drop_duplicates(subset=['用户ID'])
orders_clean = orders_df.drop_duplicates(subset=['订单ID'])

# 2. 处理缺失值
orders_clean['订单金额'] = orders_clean['订单金额'].fillna(orders_clean['订单金额'].median())

# 3. 数据合并
# 主表：订单表
main_df = orders_clean.copy()
# 合并用户信息
main_df = main_df.merge(users_clean[['用户ID', '用户名', '地区']], on='用户ID', how='left')
# 合并物流信息
main_df = main_df.merge(logistics[['订单ID', '发货日期', '收货日期', '物流状态']], on='订单ID', how='left')

print(f"合并后数据行数：{len(main_df)}")
print("合并后数据列：", main_df.columns.tolist())
print()

# ===================== 3. 购物车分析 =====================
print("="*70)
print("3. 购物车分析（关联规则）")
print("="*70)

# 简化版：按用户聚合购买记录
user_products = orders_clean.groupby('用户ID').agg({
    '订单ID': 'count',
    '订单金额': 'sum'
}).reset_index()
user_products.columns = ['用户ID', '购买次数', '总金额']

print("用户购买统计（前10）：")
print(user_products.head(10))
print()

# ===================== 4. RFM分析 =====================
print("="*70)
print("4. RFM客户分层")
print("="*70)

reference_date = datetime(2024, 7, 1)

rfm = orders_clean[orders_clean['订单状态'] == '已完成'].groupby('用户ID').agg({
    '订单日期': lambda x: (reference_date - x.max()).days,
    '订单ID': 'count',
    '订单金额': 'sum'
}).reset_index()

rfm.columns = ['用户ID', 'R(最近天数)', 'F(频率)', 'M(金额)']

# RFM评分
rfm['R评分'] = pd.qcut(rfm['R(最近天数)'], q=5, labels=[5, 4, 3, 2, 1]).astype(int)
rfm['F评分'] = pd.qcut(rfm['F(频率)'].rank(method='first'), q=5, labels=[1, 2, 3, 4, 5]).astype(int)
rfm['M评分'] = pd.qcut(rfm['M(金额)'].rank(method='first'), q=5, labels=[1, 2, 3, 4, 5]).astype(int)
rfm['RFM总分'] = rfm['R评分'] + rfm['F评分'] + rfm['M评分']

print("RFM分析结果（前15）：")
print(rfm[['用户ID', 'R评分', 'F评分', 'M评分', 'RFM总分']].head(15))
print()

# 客户分层
def classify_customer(row):
    if row['RFM总分'] >= 13:
        return '高价值客户'
    elif row['RFM总分'] >= 10:
        return '重要发展客户'
    elif row['RFM总分'] >= 7:
        return '一般客户'
    else:
        return '流失风险客户'

rfm['客户类型'] = rfm.apply(classify_customer, axis=1)

customer_dist = rfm['客户类型'].value_counts()
print("客户分层分布：")
print(customer_dist)
print()

# ===================== 5. 用户聚类 =====================
print("="*70)
print("5. 用户行为聚类")
print("="*70)

# 合并RFM和用户信息
user_features = rfm.merge(users_clean[['用户ID', '地区']], on='用户ID', how='left')

# 选择聚类特征
features = ['R评分', 'F评分', 'M评分']
X = user_features[features]

# 标准化
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# KMeans聚类
kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
user_features['用户簇'] = kmeans.fit_predict(X_scaled)

print("用户聚类结果分布：")
print(user_features['用户簇'].value_counts())
print()

cluster_stats = user_features.groupby('用户簇').agg({
    'R评分': 'mean',
    'F评分': 'mean',
    'M评分': 'mean',
    '用户ID': 'count'
}).round(2)
cluster_stats.columns = ['平均R', '平均F', '平均M', '用户数']
print("各簇特征：")
print(cluster_stats)
print()

# ===================== 6. 异常检测 =====================
print("="*70)
print("6. 异常交易检测")
print("="*70)

# 使用Z-score检测异常订单
orders_with_user = orders_clean.merge(users[['用户ID', '注册日期']], on='用户ID', how='left')
orders_with_user['用户注册天数'] = (datetime(2024, 7, 1) - orders_with_user['注册日期']).dt.days

# 计算Z-score
orders_with_user['金额Zscore'] = (orders_with_user['订单金额'] - orders_with_user['订单金额'].mean()) / orders_with_user['订单金额'].std()
orders_with_user['异常'] = (abs(orders_with_user['金额Zscore']) > 3).astype(int)

anomalies = orders_with_user[orders_with_user['异常'] == 1]
print(f"检测到异常订单：{len(anomalies)}个")
if len(anomalies) > 0:
    print("异常订单示例：")
    print(anomalies[['订单ID', '订单金额', '金额Zscore']].head(10))
print()

# ===================== 7. BI仪表盘KPI =====================
print("="*70)
print("7. BI仪表盘核心KPI")
print("="*70)

# 计算核心KPI
total_orders = len(orders_df)
total_revenue = orders_df[orders_df['订单状态'] == '已完成']['订单金额'].sum()
total_users = orders_df['用户ID'].nunique()
avg_order_value = total_revenue / total_orders if total_orders > 0 else 0

print(f"📊 核心指标：")
print(f"  总订单数：{total_orders:,}")
print(f"  总销售额：¥{total_revenue:,.2f}")
print(f"  总用户数：{total_users:,}")
print(f"  平均订单金额：¥{avg_order_value:.2f}")
print()

# 地区销售排名
region_sales = main_df[main_df['订单状态'] == '已完成'].groupby('地区').agg({
    '订单ID': 'count',
    '订单金额': 'sum'
}).round(2)
region_sales.columns = ['订单数', '销售额']
region_sales = region_sales.sort_values('销售额', ascending=False)

print("📍 地区销售排名：")
print(region_sales)
print()

# 月度销售趋势
main_df['月份'] = main_df['订单日期'].dt.month
monthly_sales = main_df[main_df['订单状态'] == '已完成'].groupby('月份')['订单金额'].sum()

print("📈 月度销售趋势：")
for month, sales in monthly_sales.items():
    print(f"  {month}月：¥{sales:,.2f}")
print()

# ===================== 8. 聚类客户画像 =====================
print("="*70)
print("8. 聚类客户画像")
print("="*70)

for cluster_id in range(3):
    cluster_users = user_features[user_features['用户簇'] == cluster_id]
    
    print(f"\\n【用户群{cluster_id}】（{len(cluster_users)}人）")
    print(f"  平均R评分：{cluster_users['R评分'].mean():.2f}")
    print(f"  平均F评分：{cluster_users['F评分'].mean():.2f}")
    print(f"  平均M评分：{cluster_users['M评分'].mean():.2f}")
    
    # 地区分布
    region_dist = cluster_users['地区'].value_counts().head(3)
    print(f"  主要地区：{', '.join(region_dist.index.tolist())}")
print()

# ===================== 9. 数据质量检查 =====================
print("="*70)
print("9. 数据质量检查")
print("="*70)

# 检查数据唯一性
assert main_df['订单ID'].nunique() == len(main_df), "订单ID不唯一"
print("✓ 订单ID唯一性检查通过")

# 检查数据范围
assert main_df['订单金额'].min() >= 0, "订单金额有负值"
print("✓ 订单金额范围检查通过")

# 检查缺失值
missing_pct = main_df.isnull().sum().sum() / (len(main_df) * len(main_df.columns)) * 100
print(f"✓ 数据缺失率：{missing_pct:.2f}%")
print()

# ===================== 10. 总结与建议 =====================
print("="*70)
print("10. 总结与业务建议")
print("="*70)

print("📌 核心发现：")
print(f"  1. 高价值客户占比：{(rfm['客户类型'] == '高价值客户').sum() / len(rfm) * 100:.1f}%")
print(f"  2. 异常订单数：{len(anomalies)}个（占比{len(anomalies)/total_orders*100:.2f}%）")
print(f"  3. 销售额最高地区：{region_sales.index[0]}")
print()

print("📌 业务建议：")
print("  1. 针对高价值客户提供VIP服务和个性化推荐")
print("  2. 加强对异常订单的监控和审核")
print("  3. 在销售热点地区加大营销投入")
print("  4. 对流失风险客户进行定向召回")
print()

print("="*70)
print("✓ 端到端BI仪表盘项目完成！")
print("="*70)
`,
    tips: ['端到端项目需要整合多个数据源', '仪表盘应该展示清晰的业务洞察', '数据质量是BI分析的基础']
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
