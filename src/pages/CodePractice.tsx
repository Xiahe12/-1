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
