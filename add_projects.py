
with open('src/pages/CodePractice.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 查找第一个项目
assert "id: 'bi-project-1'" in content

# 找到项目4的结束位置并截取前半部分
projects_end = content.rfind('];')
if projects_end == -1:
    raise Exception("Can't find end of codePractices array")

# 截取前半部分（到 ]; 之前）
content_before = content[:projects_end + 2] + '\n'

# 新增的项目5-10代码
new_projects = '''  {
    id: 'bi-project-5',
    chapterId: 'chapter-57',
    title: '退货原因文本聚类（非结构化→结构化）',
    description: '文本清洗、TF-IDF、KMeans文本聚类、词云。退货评论列含短文本；分词、去停用词，转换为TF-IDF矩阵；聚类（3~5类）；每类提取高频词，分析主要退货原因（如物流、质量等）。',
    difficulty: '进阶',
    skills: ['文本挖掘', 'TF-IDF', '文本聚类', '词云可视化'],
    initialCode: `# ========== 项目5：退货原因文本聚类 ==========
import pandas as pd
import numpy as np
import jieba
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
from wordcloud import WordCloud
import matplotlib.pyplot as plt

# 1. 生成退货评论文本数据
np.random.seed(42)
categories = {
    '质量问题': ['质量差', '破损', '坏了', '有问题', '瑕疵', '开裂', '掉色', '做工粗糙', '不结实'],
    '尺寸问题': ['尺寸不对', '太大', '太小', '不合身', '尺码偏大', '尺码偏小', '不合适', '穿不上'],
    '物流问题': ['物流慢', '包装破损', '发错货', '漏发', '少件', '快递暴力', '延误', '丢件'],
    '图片不符': ['色差', '与图片不符', '实物难看', '不像图片', '效果差', '材质不同', '差异大'],
    '使用问题': ['不会用', '效果不好', '不满意', '没用', '闲置', '不喜欢', '后悔购买']
}

reviews = []
true_labels = []
for _ in range(1000):
    category = np.random.choice(list(categories.keys()), p=[0.3, 0.25, 0.2, 0.15, 0.1])
    keywords = categories[category]
    main_keyword = np.random.choice(keywords)
    extra = np.random.choice(['', '非常', '特别', '有点', '真的很', '太'], p=[0.5, 0.1, 0.1, 0.1, 0.1, 0.1])
    suffix = np.random.choice(['', '！', '。', '，希望改进', '不会再买了'], p=[0.6, 0.1, 0.1, 0.1, 0.1])
    
    review = f"{extra}{main_keyword}{suffix}"
    reviews.append(review)
    true_labels.append(category)

df = pd.DataFrame({'review': reviews, 'true_category': true_labels})
print("评论数据示例：")
print(df.head(10))
print(f"\\n各类别数量：")
print(df['true_category'].value_counts())

# 2. 中文文本预处理
def preprocess_text(text):
    # 只保留中文
    import re
    text = re.sub(r'[^\\u4e00-\\u9fa5]', '', text)
    # 分词
    words = jieba.cut(text)
    # 过滤单字词
    words = [w for w in words if len(w) > 1]
    return ' '.join(words)

df['processed'] = df['review'].apply(preprocess_text)
print("\\n预处理后示例：")
print(df[['review', 'processed']].head())

# 3. TF-IDF向量化
vectorizer = TfidfVectorizer(max_features=100, min_df=2, max_df=0.8)
X = vectorizer.fit_transform(df['processed'])
feature_names = vectorizer.get_feature_names_out()
print(f"\\nTF-IDF矩阵形状：{X.shape}")

# 4. 确定最佳聚类数（用肘部法则）
sil_scores = []
K_range = range(2, 8)
for k in K_range:
    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    labels = kmeans.fit_predict(X)
    sil_score = 0
    try:
        from sklearn.metrics import silhouette_score
        sil_score = silhouette_score(X, labels)
    except:
        pass
    sil_scores.append(sil_score)

best_k = K_range[np.argmax(sil_scores)] if len(sil_scores) > 0 else 5
print(f"\\n最佳聚类数：{best_k}")

# 5. KMeans聚类
kmeans = KMeans(n_clusters=best_k, random_state=42, n_init=10)
df['cluster'] = kmeans.fit_predict(X)

# 6. 提取每个聚类的关键词
def get_top_keywords(cluster_id, n_words=5):
    # 获取该聚类的文本
    cluster_texts = df[df['cluster'] == cluster_id]['processed']
    if len(cluster_texts) == 0:
        return []
    # 计算词频
    all_words = ' '.join(cluster_texts).split()
    from collections import Counter
    word_counts = Counter(all_words)
    return word_counts.most_common(n_words)

print("\\n=== 各聚类关键词 ===")
cluster_keywords = {}
for i in range(best_k):
    keywords = get_top_keywords(i, n_words=5)
    cluster_keywords[i] = keywords
    print(f"\\n聚类{i}关键词：")
    for word, freq in keywords:
        print(f"  {word}: {freq}")

# 7. 为每个聚类命名（根据关键词）
def label_cluster(keywords):
    word_set = set(w for w, _ in keywords)
    if any(kw in word_set for kw in ['质量', '破损', '瑕疵', '坏了']):
        return '质量问题'
    elif any(kw in word_set for kw in ['尺寸', '太大', '太小', '不合身']):
        return '尺寸问题'
    elif any(kw in word_set for kw in ['物流', '快递', '包装', '发错']):
        return '物流问题'
    elif any(kw in word_set for kw in ['色差', '图片', '实物', '不符']):
        return '图片不符'
    elif any(kw in word_set for kw in ['不会', '效果', '闲置']):
        return '使用问题'
    else:
        return f'聚类{i}'

df['cluster_label'] = df['cluster'].apply(lambda x: label_cluster(cluster_keywords[x]))

# 8. 输出分析报告
print("\\n=== 退货原因分析报告 ===")
for label in df['cluster_label'].unique():
    count = len(df[df['cluster_label'] == label])
    print(f"\\n{label}：{count}条评论（{count/len(df)*100:.1f}%）")

# 9. 可视化：词云
fig, axes = plt.subplots(1, 2, figsize=(14, 6))
# 整体词云
all_text = ' '.join(df['processed'])
wordcloud = WordCloud(width=800, height=400, background_color='white', font_path=None, max_words=50).generate(all_text)
axes[0].imshow(wordcloud, interpolation='bilinear')
axes[0].set_title('所有退货评论词云', fontsize=14)
axes[0].axis('off')
# 聚类分布
cluster_counts = df['cluster_label'].value_counts()
axes[1].bar(cluster_counts.index, cluster_counts.values, color=['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57'])
axes[1].set_title('退货原因聚类分布', fontsize=14)
axes[1].tick_params(axis='x', rotation=45)
plt.tight_layout()
plt.show()`,
    tips: ['TF-IDF可以提取文本关键词', 'jieba是常用的中文分词库', '词云可以直观展示词频分布']
  },
  {
    id: 'bi-project-6',
    chapterId: 'chapter-58',
    title: '销量预测特征工程与基线模型',
    description: '时序聚合、特征构造、滞后特征、滚动统计。日销售数据，构造星期、月份、节假日特征；过去7天滚动均值/销量滞后1~7；使用线性回归或决策树预测次日销量；评估RMSE。',
    difficulty: '进阶',
    skills: ['时间序列', '特征工程', '机器学习', '预测评估'],
    initialCode: `# ========== 项目6：销量预测特征工程与基线模型 ==========
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split

# 1. 生成日销售数据
np.random.seed(42)
dates = pd.date_range('2024-01-01', '2024-12-31', freq='D')
n_days = len(dates)

# 构建销量：趋势 + 季节性 + 周内波动 + 随机噪声
trend = np.linspace(100, 200, n_days)
seasonal = 50 * np.sin(2 * np.pi * np.arange(n_days) / 365)  # 年度波动
weekly = 20 * np.sin(2 * np.pi * np.arange(n_days) / 7)  # 周内波动
noise = np.random.normal(0, 15, n_days)
sales = trend + seasonal + weekly + noise
sales = np.maximum(sales, 20)  # 销量不能为负

df = pd.DataFrame({
    'date': dates,
    'sales': sales
})

print("销售数据示例：")
print(df.head())
print(f"\\n销量统计：均值={df['sales'].mean():.0f}, 标准差={df['sales'].std():.0f}")

# 2. 数据清洗
df = df.drop_duplicates(subset=['date'])
df = df.sort_values('date')
df = df[df['sales'] > 0]

# 3. 特征工程
def create_features(df):
    df = df.copy()
    df['date'] = pd.to_datetime(df['date'])
    
    # 时间特征
    df['year'] = df['date'].dt.year
    df['month'] = df['date'].dt.month
    df['day'] = df['date'].dt.day
    df['day_of_week'] = df['date'].dt.dayofweek
    df['quarter'] = df['date'].dt.quarter
    df['day_of_year'] = df['date'].dt.dayofyear
    df['is_weekend'] = (df['day_of_week'] >= 5).astype(int)
    
    # 周期性特征用sin/cos编码
    df['month_sin'] = np.sin(2 * np.pi * df['month'] / 12)
    df['month_cos'] = np.cos(2 * np.pi * df['month'] / 12)
    df['day_of_week_sin'] = np.sin(2 * np.pi * df['day_of_week'] / 7)
    df['day_of_week_cos'] = np.cos(2 * np.pi * df['day_of_week'] / 7)
    
    # 滞后特征
    for lag in [1, 2, 3, 7, 14]:
        df[f'lag_{lag}'] = df['sales'].shift(lag)
    
    # 滚动统计特征
    for window in [3, 7, 14, 30]:
        df[f'rolling_mean_{window}'] = df['sales'].shift(1).rolling(window).mean()
        df[f'rolling_std_{window}'] = df['sales'].shift(1).rolling(window).std()
    
    # 差分特征（日环比）
    df['diff_1'] = df['sales'].diff(1)
    df['diff_7'] = df['sales'].diff(7)
    
    # 节假日特征（模拟）
    holiday_dates = ['2024-01-01', '2024-05-01', '2024-10-01']
    df['is_holiday'] = df['date'].dt.strftime('%Y-%m-%d').isin(holiday_dates).astype(int)
    
    return df

df_feat = create_features(df)

# 删除包含NaN的行（因为滞后和滚动特征）
df_feat = df_feat.dropna().reset_index(drop=True)

print(f"\\n特征工程后数据形状：{df_feat.shape}")
print(f"特征列表：")
print(df_feat.columns.tolist())

# 4. 准备训练数据
feature_cols = ['month', 'day', 'day_of_week', 'quarter', 'is_weekend',
                'month_sin', 'month_cos', 'day_of_week_sin', 'day_of_week_cos',
                'lag_1', 'lag_2', 'lag_3', 'lag_7', 'lag_14',
                'rolling_mean_3', 'rolling_mean_7', 'rolling_mean_14', 'rolling_mean_30',
                'rolling_std_7', 'rolling_std_14',
                'diff_1', 'diff_7', 'is_holiday']

X = df_feat[feature_cols]
y = df_feat['sales']

# 划分训练集和测试集（按时间顺序划分，前面80%训练，后面20%测试）
train_size = int(len(X) * 0.8)
X_train, X_test = X[:train_size], X[train_size:]
y_train, y_test = y[:train_size], y[train_size:]

print(f"\\n训练集：{len(X_train)}样本，测试集：{len(X_test)}样本")

# 5. 训练模型
models = {
    'Linear Regression': LinearRegression(),
    'Random Forest': RandomForestRegressor(n_estimators=100, random_state=42)
}

results = {}
for name, model in models.items():
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    results[name] = {'rmse': rmse, 'mae': mae, 'r2': r2, 'predictions': y_pred, 'model': model}
    
    print(f"\\n{name}:")
    print(f"  RMSE: {rmse:.2f}")
    print(f"  MAE: {mae:.2f}")
    print(f"  R²: {r2:.3f}")

# 6. 基线模型：使用过去7天平均值
def naive_forecast(df):
    df['naive_pred'] = df['sales'].shift(1).rolling(7).mean()
    return df

df_naive = df_feat.copy()
df_naive['naive_pred'] = df_naive['sales'].shift(1).rolling(7).mean()
df_naive = df_naive.dropna()
# 只用测试集进行评估
test_df = df_naive[train_size:]
naive_rmse = np.sqrt(mean_squared_error(test_df['sales'], test_df['naive_pred']))
naive_mae = mean_absolute_error(test_df['sales'], test_df['naive_pred'])
print(f"\\nBaseline (7天均值):")
print(f"  RMSE: {naive_rmse:.2f}")
print(f"  MAE: {naive_mae:.2f}")

# 7. 可视化
fig, axes = plt.subplots(2, 2, figsize=(16, 10))

# 实际销量 vs 预测值
test_dates = df_feat['date'].iloc[train_size:].values
axes[0,0].plot(test_dates, y_test, label='实际销量', alpha=0.7)
axes[0,0].plot(test_dates, results['Random Forest']['predictions'], label='预测值', alpha=0.7)
axes[0,0].set_title('销量预测 vs 实际值', fontsize=14)
axes[0,0].legend()
axes[0,0].tick_params(axis='x', rotation=45)

# 残差分布
residuals = y_test - results['Random Forest']['predictions']
axes[0,1].hist(residuals, bins=30, edgecolor='black', alpha=0.7)
axes[0,1].set_title(f'残差分布（均值={residuals.mean():.1f}, 标准差={residuals.std():.1f}）', fontsize=12)
axes[0,1].axvline(x=0, color='r', linestyle='--')

# 特征重要性（Random Forest）
rf_model = results['Random Forest']['model']
feature_importance = pd.DataFrame({
    'feature': feature_cols,
    'importance': rf_model.feature_importances_
}).sort_values('importance', ascending=False)
axes[1,0].barh(feature_importance.head(10)['feature'], feature_importance.head(10)['importance'])
axes[1,0].set_title('Top10 特征重要性（Random Forest）', fontsize=12)

# 模型对比
model_names = ['Baseline'] + list(results.keys())
metrics = ['rmse', 'mae']
x = np.arange(len(model_names))
width = 0.35
for i, metric in enumerate(metrics):
    values = [naive_rmse if metric == 'rmse' else naive_mae]
    for name in results.keys():
        values.append(results[name][metric])
    axes[1,1].bar(x + i*width, values, width, label=metric.upper())
axes[1,1].set_xlabel('模型')
axes[1,1].set_ylabel('误差值')
axes[1,1].set_title('模型性能对比')
axes[1,1].set_xticks(x + width/2)
axes[1,1].set_xticklabels(model_names)
axes[1,1].legend()

plt.tight_layout()
plt.show()`,
    tips: ['滞后特征是时间序列预测的关键', '滚动统计可以捕捉趋势和波动', 'sin/cos编码可以更好地表示周期性']
  },
  {
    id: 'bi-project-7',
    chapterId: 'chapter-59',
    title: '商品价格敏感度聚类分析（价格带偏好）',
    description: '二维聚类（价格vs销量占比）、数据分箱与聚合。商品交易明细（商品ID、单价、购买数量）。计算每个商品的平均单价与总销量；标准化后KMeans聚类（如：低价高量、高价低量、中价中庸等）。',
    difficulty: '进阶',
    skills: ['价格分析', '二维聚类', 'KMeans', '业务策略'],
    initialCode: `# ========== 项目7：商品价格敏感度聚类分析 ==========
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from scipy import stats
import matplotlib.pyplot as plt
import seaborn as sns

# 1. 生成商品销售数据
np.random.seed(42)
n_products = 200
categories = ['电子产品', '服装', '食品', '家居', '美妆']
price_ranges = {
    '电子产品': (500, 5000),
    '服装': (50, 800),
    '食品': (10, 200),
    '家居': (30, 1000),
    '美妆': (20, 500)
}

data = []
for _ in range(n_products):
    category = np.random.choice(categories)
    min_price, max_price = price_ranges[category]
    price = np.random.uniform(min_price, max_price)
    
    # 价格弹性：高价商品销量通常更低
    if price > price_ranges[category][1] * 0.7:
        sales_volume = np.random.poisson(50)
    elif price < price_ranges[category][0] * 1.3:
        sales_volume = np.random.poisson(500)
    else:
        sales_volume = np.random.poisson(200)
    
    revenue = price * sales_volume
    data.append({
        'product_id': np.random.randint(10000, 99999),
        'category': category,
        'price': price,
        'sales_volume': sales_volume,
        'revenue': revenue
    })

df = pd.DataFrame(data)
print("商品数据示例：")
print(df.head())
print(f"\\n数据统计：")
print(df[['price', 'sales_volume', 'revenue']].describe())

# 2. 数据清洗
df = df.drop_duplicates(subset=['product_id'])
# 用IQR去除价格和销量的极端值
for col in ['price', 'sales_volume']:
    Q1 = df[col].quantile(0.25)
    Q3 = df[col].quantile(0.75)
    IQR = Q3 - Q1
    df = df[(df[col] >= Q1 - 1.5*IQR) & (df[col] <= Q3 + 1.5*IQR)]

print(f"\\n清洗后数据：{len(df)}个商品")

# 3. 准备聚类特征（使用对数转换改善分布）
df['price_log'] = np.log1p(df['price'])
df['volume_log'] = np.log1p(df['sales_volume'])
features = ['price_log', 'volume_log']
X = df[features]

# 4. 标准化
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 5. 确定最佳聚类数（肘部法则+轮廓系数）
inertias = []
sil_scores = []
K_range = range(2, 8)
for k in K_range:
    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    labels = kmeans.fit_predict(X_scaled)
    inertias.append(kmeans.inertia_)
    sil_scores.append(silhouette_score(X_scaled, labels))

best_k = K_range[np.argmax(sil_scores)]
print(f"\\n最佳聚类数：{best_k}（轮廓系数={max(sil_scores):.3f}）")

# 6. 执行聚类
kmeans = KMeans(n_clusters=best_k, random_state=42, n_init=10)
df['cluster'] = kmeans.fit_predict(X_scaled)

# 7. 聚类中心转换回原始空间
cluster_centers = scaler.inverse_transform(kmeans.cluster_centers_)
cluster_centers_df = pd.DataFrame(cluster_centers, columns=features, index=range(best_k))
# 计算回原始价格和销量
cluster_centers_df['avg_price'] = np.expm1(cluster_centers_df['price_log'])
cluster_centers_df['avg_sales'] = np.expm1(cluster_centers_df['volume_log'])

print("\\n=== 各聚类中心特征（原始空间） ===")
print(cluster_centers_df[['avg_price', 'avg_sales']].round(1))

# 8. 为每个聚类添加业务标签
def label_cluster(cluster_id, cluster_df):
    avg_price = cluster_df['avg_price'].iloc[cluster_id]
    avg_sales = cluster_df['avg_sales'].iloc[cluster_id]
    price_q70 = df['price'].quantile(0.7)
    price_q30 = df['price'].quantile(0.3)
    sales_q70 = df['sales_volume'].quantile(0.7)
    sales_q30 = df['sales_volume'].quantile(0.3)
    
    if avg_price > price_q70 and avg_sales > sales_q70:
        return '高价值热销品'
    elif avg_price > price_q70:
        return '高端冷门品'
    elif avg_price < price_q30 and avg_sales > sales_q70:
        return '薄利多销品'
    elif avg_sales < sales_q30:
        return '滞销品'
    else:
        return '普通商品'

cluster_labels = {}
for i in range(best_k):
    cluster_labels[i] = label_cluster(i, cluster_centers_df)

df['cluster_label'] = df['cluster'].map(cluster_labels)

print("\\n=== 各聚类商品数量 ===")
label_counts = df['cluster_label'].value_counts()
for label, count in label_counts.items():
    print(f"{label}: {count}个商品 ({count/len(df)*100:.1f}%)")

# 9. 验证：价格与销量的相关性
corr = df['price'].corr(df['sales_volume'])
print(f"\\n整体价格-销量相关性：{corr:.3f}")

# 各聚类内部相关性
print("\\n各聚类内部价格-销量相关性：")
for i in range(best_k):
    cluster_data = df[df['cluster'] == i]
    cluster_corr = cluster_data['price'].corr(cluster_data['sales_volume'])
    print(f"  聚类{i} ({cluster_labels[i]}): {cluster_corr:.3f}")

# 10. 方差分析验证价格差异
print("\\n=== 价格差异显著性检验 ===")
price_groups = [df[df['cluster'] == i]['price'].values for i in range(best_k)]
f_stat, p_value = stats.f_oneway(*price_groups)
print(f"ANOVA F统计量：{f_stat:.2f}, p值：{p_value:.2e}")
print(f"结论：{'各聚类价格存在显著差异' if p_value < 0.05 else '各聚类价格无显著差异'}")

# 11. 可视化
fig, axes = plt.subplots(2, 2, figsize=(15, 11))

# 价格-销量散点图（带聚类标签）
colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57']
for i in range(best_k):
    cluster_data = df[df['cluster'] == i]
    axes[0,0].scatter(cluster_data['price'], cluster_data['sales_volume'],
                      label=f'聚类{i}: {cluster_labels[i]}', alpha=0.6, s=60, c=colors[i % len(colors)])
axes[0,0].set_xlabel('价格')
axes[0,0].set_ylabel('销量')
axes[0,0].set_title('商品价格-销量聚类图', fontsize=13)
axes[0,0].legend()

# 肘部法则
axes[0,1].plot(K_range, inertias, 'bo-')
axes[0,1].set_xlabel('K值')
axes[0,1].set_ylabel('惯性')
axes[0,1].set_title('肘部法则')
axes[0,1].axvline(best_k, color='r', linestyle='--', label=f'最佳K={best_k}')
axes[0,1].legend()

# 各聚类价格箱线图
sns.boxplot(data=df, x='cluster_label', y='price', ax=axes[1,0])
axes[1,0].set_title('各聚类价格分布', fontsize=12)
axes[1,0].tick_params(axis='x', rotation=45)

# 各聚类销量箱线图
sns.boxplot(data=df, x='cluster_label', y='sales_volume', ax=axes[1,1])
axes[1,1].set_title('各聚类销量分布', fontsize=12)
axes[1,1].tick_params(axis='x', rotation=45)

plt.tight_layout()
plt.show()

# 12. 业务建议
print("\\n=== 业务建议 ===")
for label in label_counts.index:
    cluster_data = df[df['cluster_label'] == label]
    print(f"\\n{label}（{len(cluster_data)}个商品）：")
    print(f"  平均价格：¥{cluster_data['price'].mean():.0f}")
    print(f"  平均销量：{cluster_data['sales_volume'].mean():.0f}件")
    print(f"  平均收入：¥{cluster_data['revenue'].mean():.0f}")
    if label == '高价值热销品':
        print(f"  建议：维持价格，考虑捆绑销售")
    elif label == '薄利多销品':
        print(f"  建议：小幅提价测试弹性，或增加SKU")
    elif label == '高端冷门品':
        print(f"  建议：精准营销，提升品牌溢价")
    elif label == '滞销品':
        print(f"  建议：降价清仓或下架")`,
    tips: ['对数变换可以使数据更适合聚类', '散点图是二维聚类最好的可视化方式', '聚类结果可以指导定价策略']
  },
  {
    id: 'bi-project-8',
    chapterId: 'chapter-60',
    title: '动态购物车智能推荐模拟（协同过滤+关联规则对比）',
    description: '用户-商品矩阵、基于项目的协同过滤（余弦相似度）、关联规则对比。使用用户购买历史（用户-商品二值矩阵）。若用户加入商品A，基于相似商品推荐Top3。同时与关联规则推荐结果对比（同一购物车）。',
    difficulty: '进阶',
    skills: ['协同过滤', '余弦相似度', '关联规则', '推荐系统'],
    initialCode: `# ========== 项目8：动态购物车智能推荐模拟 ==========
import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from mlxtend.frequent_patterns import apriori, association_rules
import matplotlib.pyplot as plt
import seaborn as sns
from collections import Counter

# 1. 生成用户-商品购买历史数据
np.random.seed(42)
n_users = 200
products = ['牛奶', '面包', '黄油', '鸡蛋', '啤酒', '尿布', '可乐', '薯片', '巧克力', '水果',
            '咖啡', '茶叶', '果汁', '饼干', '酸奶']

purchases = []
for user_idx in range(n_users):
    # 每个用户购买3-8个商品
    n_items = np.random.randint(3, 9)
    user_products = []
    
    # 有意添加强关联组合
    if np.random.random() > 0.6:
        user_products.extend(['啤酒', '尿布'])
    if np.random.random() > 0.5:
        user_products.extend(['牛奶', '面包'])
    if np.random.random() > 0.7:
        user_products.extend(['咖啡', '饼干'])
    
    # 补充随机商品
    remaining = n_items - len(user_products)
    if remaining > 0:
        other_products = [p for p in products if p not in user_products]
        user_products.extend(np.random.choice(other_products, remaining, replace=False).tolist())
    
    for product in set(user_products):
        purchases.append({
            'user_id': f'U{user_idx+1:04d}',
            'product': product,
            'rating': np.random.choice([1, 2, 3, 4, 5], p=[0.1, 0.1, 0.2, 0.3, 0.3])
        })

df = pd.DataFrame(purchases)

print("数据规模：")
print(f"用户数：{df['user_id'].nunique()}")
print(f"商品数：{df['product'].nunique()}")
print(f"购买记录数：{len(df)}")
print("\\n购买记录示例：")
print(df.head())

# 2. 构建用户-商品矩阵（隐式反馈）
user_item_matrix = df.pivot_table(index='user_id', columns='product', values='rating', fill_value=0)
user_item_binary = (user_item_matrix > 0).astype(int)
print(f"\\n用户-商品矩阵形状：{user_item_matrix.shape}")

# 3. 基于项目的协同过滤
def item_based_recommend(user_id, top_n=5):
    """基于商品相似度进行推荐"""
    # 获取用户已购买商品
    if user_id not in user_item_matrix.index:
        return []
    user_products = user_item_binary.loc[user_id]
    purchased = user_products[user_products > 0].index.tolist()
    
    if len(purchased) == 0:
        return []
    
    # 计算商品-商品相似度矩阵
    item_similarity = cosine_similarity(user_item_matrix.T)
    item_similarity_df = pd.DataFrame(item_similarity,
                                      index=user_item_matrix.columns,
                                      columns=user_item_matrix.columns)
    
    # 为用户推荐
    recommendations = {}
    for product in purchased:
        # 找最相似的商品
        similar_items = item_similarity_df[product].sort_values(ascending=False)
        # 排除已购买商品
        similar_items = similar_items[~similar_items.index.isin(purchased)]
        # 累加相似度分数
        for item, score in similar_items.head(3).items():
            if item not in recommendations:
                recommendations[item] = 0
            recommendations[item] += score
    
    # 排序返回
    sorted_recs = sorted(recommendations.items(), key=lambda x: x[1], reverse=True)[:top_n]
    return [item for item, score in sorted_recs]

# 4. 基于关联规则的推荐
# 构建购物车矩阵（基于用户购买）
cart_matrix = user_item_binary
# 挖掘频繁项集和规则
min_support = 0.03
freq_itemsets = apriori(cart_matrix, min_support=min_support, use_colnames=True)
rules = pd.DataFrame()
if len(freq_itemsets) > 0:
    rules = association_rules(freq_itemsets, metric="confidence", min_threshold=0.4)
    rules = rules[rules['lift'] > 1.2].sort_values('lift', ascending=False)
    print(f"\\n挖掘到 {len(rules)} 条关联规则")
    if len(rules) > 0:
        print(rules[['antecedents', 'consequents', 'support', 'confidence', 'lift']].head())

def rule_based_recommend(user_id, top_n=5):
    """基于关联规则推荐"""
    if user_id not in user_item_binary.index:
        return []
    user_products = set(user_item_binary.loc[user_id][user_item_binary.loc[user_id] > 0].index.tolist())
    recommendations = {}
    
    for _, rule in rules.iterrows():
        antecedents = set(rule['antecedents'])
        # 如果用户购物车包含规则前件
        if antecedents.issubset(user_products):
            for item in rule['consequents']:
                if item not in user_products:
                    if item not in recommendations:
                        recommendations[item] = 0
                    recommendations[item] += rule['confidence']
    
    sorted_recs = sorted(recommendations.items(), key=lambda x: x[1], reverse=True)[:top_n]
    return [item for item, score in sorted_recs]

# 5. 混合推荐
def hybrid_recommend(user_id, top_n=5):
    """结合协同过滤和关联规则推荐"""
    cf_recs = item_based_recommend(user_id, top_n * 2)
    rule_recs = rule_based_recommend(user_id, top_n * 2)
    
    # 合并并加权排序
    scores = {}
    for item in cf_recs:
        scores[item] = scores.get(item, 0) + 1
    for item in rule_recs:
        scores[item] = scores.get(item, 0) + 1
    
    sorted_recs = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:top_n]
    return [item for item, score in sorted_recs]

# 6. 测试推荐效果
test_users = np.random.choice(user_item_binary.index, 3, replace=False)
print("\\n=== 推荐结果示例 ===")
for user in test_users:
    purchased = df[df['user_id'] == user]['product'].tolist()
    hybrid_recs = hybrid_recommend(user, top_n=5)
    
    print(f"\\n用户 {user}:")
    print(f"  已购商品：{purchased[:5]}{'...' if len(purchased) > 5 else ''}")
    print(f"  推荐商品：{hybrid_recs}")

# 7. 验证：推荐商品不在用户已购列表中
def validate_recommendations():
    valid_count = 0
    total_count = 0
    for user in user_item_binary.index[:50]:
        user_products = set(df[df['user_id'] == user]['product'].tolist())
        recs = hybrid_recommend(user, top_n=5)
        for item in recs:
            total_count += 1
            if item not in user_products:
                valid_count += 1
    valid_rate = valid_count / total_count if total_count > 0 else 0
    print(f"\\n验证结果：{valid_rate*100:.1f}%的推荐商品未在用户已购列表中")
    return valid_rate

validate_recommendations()

# 8. 可视化
fig, axes = plt.subplots(1, 2, figsize=(14, 6))

# 商品相似度热力图（部分商品）
sample_products = products[:8]
sample_matrix = user_item_matrix[sample_products]
sample_sim = cosine_similarity(sample_matrix.T)
sns.heatmap(sample_sim, xticklabels=sample_products, yticklabels=sample_products,
            annot=True, fmt='.2f', cmap='coolwarm', ax=axes[0])
axes[0].set_title('商品相似度矩阵（部分）', fontsize=12)

# 推荐商品频率
all_recs = []
for user in user_item_binary.index[:100]:
    all_recs.extend(hybrid_recommend(user, 3))
rec_counter = Counter(all_recs)
top_recs = rec_counter.most_common(8)
axes[1].bar([r[0] for r in top_recs], [r[1] for r in top_recs], color='steelblue')
axes[1].set_title('推荐商品频率分布', fontsize=12)
axes[1].set_xlabel('商品')
axes[1].set_ylabel('推荐次数')
axes[1].tick_params(axis='x', rotation=45)

plt.tight_layout()
plt.show()

# 9. 输出推荐系统总结
print("\\n=== 推荐系统总结 ===")
print("1. 协同过滤（Item-based）：基于用户行为中的商品相似度推荐")
print("2. 关联规则（Apriori）：基于购物车中的频繁商品组合推荐")
print("3. 混合推荐：结合两种方法，平衡推荐的相关性和多样性")`,
    tips: ['协同过滤适合个性化推荐', '关联规则适合发现购物车经典组合', '混合推荐可以取两者之长']
  },
  {
    id: 'bi-project-9',
    chapterId: 'chapter-61',
    title: '异常交易检测（孤立森林+统计方法）',
    description: '异常检测、Z-score、孤立森林、多维特征。订单数据含金额、数量、折扣、用户注册时长等；使用Z-score与孤立森林标记异常订单（金额极高、折扣极高等）；分析异常类型（欺诈？团购？）。',
    difficulty: '进阶',
    skills: ['异常检测', '孤立森林', 'Z-score', '多维分析'],
    initialCode: `# ========== 项目9：异常交易检测 ==========
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from scipy import stats
import matplotlib.pyplot as plt
import seaborn as sns

# 1. 生成交易数据（包含正常和异常）
np.random.seed(42)
n_transactions = 2000
n_outliers = 50  # 异常比例

# 正常交易参数
normal_mean_amount = 100
normal_std_amount = 30
normal_mean_qty = 2

# 生成正常交易
normal_count = n_transactions - n_outliers
amounts_normal = np.random.normal(normal_mean_amount, normal_std_amount, normal_count)
amounts_normal = np.clip(amounts_normal, 10, 300)  # 限制在合理范围

# 生成异常交易（金额极高或极低）
amounts_outlier_high = np.random.uniform(800, 5000, n_outliers // 2)
amounts_outlier_low = np.random.uniform(0.1, 5, n_outliers // 2)
amounts = np.concatenate([amounts_normal, amounts_outlier_high, amounts_outlier_low])
np.random.shuffle(amounts)

# 生成其他特征
data = {
    'transaction_id': [f'TX{i:06d}' for i in range(1, n_transactions + 1)],
    'amount': amounts,
    'quantity': np.random.poisson(normal_mean_qty, n_transactions) + 1,
    'discount': np.random.beta(1, 5, n_transactions) * 0.3,
    'user_age_days': np.random.exponential(365, n_transactions).astype(int),
    'hour': np.random.randint(0, 24, n_transactions),
    'is_weekend': np.random.choice([0, 1], n_transactions, p=[0.7, 0.3])
}

df = pd.DataFrame(data)

# 人为添加更多异常模式
df.loc[100:110, 'quantity'] = 50  # 大批量购买
df.loc[200:205, 'discount'] = 0.95  # 超高折扣
df.loc[300:305, 'user_age_days'] = 0  # 全新用户

print("交易数据示例：")
print(df.head(10))
print(f"\\n数据统计：")
print(df.describe())

# 2. 数据清洗
df = df.drop_duplicates(subset=['transaction_id'])
df = df[df['amount'] > 0]
df = df[df['quantity'] > 0]

# 3. 特征工程
features = ['amount', 'quantity', 'discount', 'user_age_days', 'hour']
df['amount_per_unit'] = df['amount'] / df['quantity']
df['is_night'] = ((df['hour'] >= 23) | (df['hour'] <= 5)).astype(int)
df['high_discount'] = (df['discount'] > 0.5).astype(int)
features_extended = features + ['amount_per_unit', 'is_night']

# 4. Z-score异常检测
def detect_outliers_zscore(data, column, threshold=3):
    z_scores = np.abs(stats.zscore(data[column]))
    return z_scores > threshold

df['zscore_outlier'] = detect_outliers_zscore(df, 'amount', threshold=3)
print(f"\\nZ-score检测到异常数：{df['zscore_outlier'].sum()}")

# 5. IQR方法异常检测
def detect_outliers_iqr(data, column):
    Q1 = data[column].quantile(0.25)
    Q3 = data[column].quantile(0.75)
    IQR = Q3 - Q1
    lower = Q1 - 1.5 * IQR
    upper = Q3 + 1.5 * IQR
    return (data[column] < lower) | (data[column] > upper)

df['iqr_outlier'] = detect_outliers_iqr(df, 'amount')
print(f"IQR检测到异常数：{df['iqr_outlier'].sum()}")

# 6. 孤立森林（Isolation Forest）
from sklearn.preprocessing import StandardScaler
scaler = StandardScaler()
X = scaler.fit_transform(df[features_extended])
iso_forest = IsolationForest(contamination=0.05, random_state=42, n_estimators=100)
df['if_outlier'] = iso_forest.fit_predict(X)
df['if_outlier'] = df['if_outlier'] == -1
print(f"孤立森林检测到异常数：{df['if_outlier'].sum()}")

# 7. 集成方法（多数投票）
df['vote_count'] = (df['zscore_outlier'].astype(int) + df['iqr_outlier'].astype(int) + df['if_outlier'].astype(int))
df['ensemble_outlier'] = df['vote_count'] >= 2
print(f"集成方法检测到异常数：{df['ensemble_outlier'].sum()}")

# 8. 异常分析
print("\\n=== 异常交易分析 ===")
outliers = df[df['ensemble_outlier'] == True]
normal = df[df['ensemble_outlier'] == False]
print(f"异常交易占比：{len(outliers)/len(df)*100:.2f}%")
print(f"\\n特征对比（异常 vs 正常）：")
for col in ['amount', 'quantity', 'discount', 'user_age_days']:
    out_mean = outliers[col].mean()
    norm_mean = normal[col].mean()
    print(f"  {col}: 异常={out_mean:.2f}, 正常={norm_mean:.2f}, 倍数={out_mean/norm_mean:.2f}")

# 9. 验证方法一致性
print("\\n=== 检测方法一致性 ===")
overlap = pd.crosstab(df['zscore_outlier'], df['if_outlier'])
print("Z-score vs 孤立森林：")
print(overlap)
# Jaccard相似度
def jaccard(a, b):
    intersection = np.sum((a == True) & (b == True))
    union = np.sum((a == True) | (b == True))
    return intersection / union if union > 0 else 0

print(f"\\nJaccard相似度：")
print(f"  Z-score vs IQR: {jaccard(df['zscore_outlier'], df['iqr_outlier']):.3f}")
print(f"  Z-score vs IF: {jaccard(df['zscore_outlier'], df['if_outlier']):.3f}")
print(f"  IQR vs IF: {jaccard(df['iqr_outlier'], df['if_outlier']):.3f}")

# 10. 可视化
fig, axes = plt.subplots(2, 2, figsize=(15, 11))

# 金额分布
axes[0,0].hist(normal['amount'], bins=50, alpha=0.7, label='正常交易', color='green')
axes[0,0].hist(outliers['amount'], bins=20, alpha=0.7, label='异常交易', color='red')
axes[0,0].set_xlabel('金额')
axes[0,0].set_ylabel('频次')
axes[0,0].set_title('交易金额分布')
axes[0,0].legend()

# 箱线图
for i, col in enumerate(['amount', 'quantity', 'discount']):
    axes[0,1].boxplot([df[df['ensemble_outlier'] == False][col], df[df['ensemble_outlier'] == True][col]],
                      labels=['正常', '异常'], positions=[i*2, i*2+1], widths=0.6)
axes[0,1].set_xticks([0.5, 2.5, 4.5])
axes[0,1].set_xticklabels(['金额', '数量', '折扣'])
axes[0,1].set_ylabel('值')
axes[0,1].set_title('各特征异常对比')

# 检测方法重叠
from matplotlib_venn import venn3
v = venn3(subsets=(set(df[df['zscore_outlier']].index), 
                   set(df[df['iqr_outlier']].index), 
                   set(df[df['if_outlier']].index)),
          set_labels=('Z-score', 'IQR', '孤立森林'), ax=axes[1,0])
axes[1,0].set_title('检测方法重叠')

# 异常得分分布
sns.histplot(data=df, x='vote_count', hue='ensemble_outlier', bins=10, ax=axes[1,1])
axes[1,1].set_title('异常投票得分分布')
axes[1,1].set_xlabel('投票数（0-3）')

plt.tight_layout()
plt.show()

# 11. 输出报告
print("\\n=== 异常检测报告 ===")
print(f"总交易数：{len(df)}")
print(f"检测到异常数：{len(outliers)}")
print(f"异常率：{len(outliers)/len(df)*100:.2f}%")
print(f"\\nTop10 异常交易（按金额）：")
top_anomalies = outliers.nlargest(10, 'amount')[['transaction_id', 'amount', 'quantity', 'discount', 'vote_count']]
print(top_anomalies)
print(f"\\n异常类型分析：")
high_amount = len(outliers[outliers['amount'] > 500])
high_qty = len(outliers[outliers['quantity'] > 10])
high_discount = len(outliers[outliers['discount'] > 0.5])
print(f"  高金额异常：{high_amount}笔")
print(f"  高数量异常：{high_qty}笔")
print(f"  高折扣异常：{high_discount}笔")`,
    tips: ['Z-score适合单变量高斯分布异常检测', '孤立森林适合高维数据异常检测', '集成多种方法可提高鲁棒性']
  },
  {
    id: 'bi-project-10',
    chapterId: 'chapter-62',
    title: '端到端BI仪表盘项目（综合任务）',
    description: '数据整合+购物车分析+RFM+聚类+可视化。给定多表数据（用户、订单、商品），完成全流程数据分析并构建BI报告。',
    difficulty: '综合',
    skills: ['数据整合', 'RFM', '聚类', '关联规则', 'BI报告'],
    initialCode: `# ========== 项目10：端到端BI仪表盘（综合项目） ==========
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from mlxtend.frequent_patterns import apriori, association_rules

# 1. 生成多表业务数据
np.random.seed(42)

# 用户表
n_users = 300
users = pd.DataFrame({
    'user_id': [f'U{i:04d}' for i in range(1, n_users + 1)],
    'register_date': [datetime(2024, 1, 1) + timedelta(days=np.random.randint(0, 365)) for _ in range(n_users)],
    'city': np.random.choice(['北京', '上海', '广州', '深圳', '杭州', '成都'], n_users),
    'user_level': np.random.choice(['普通', '银卡', '金卡', '钻石'], n_users, p=[0.5, 0.3, 0.15, 0.05])
})

# 商品表
products = pd.DataFrame({
    'product_id': [f'P{i:04d}' for i in range(1, 81)],
    'category': np.random.choice(['电子产品', '服装', '食品', '家居', '美妆'], 80),
    'base_price': np.random.uniform(20, 2000, 80)
})

# 订单表
n_orders = 2000
orders = []
for i in range(n_orders):
    user_id = np.random.choice(users['user_id'])
    order_date = datetime(2024, 1, 1) + timedelta(days=np.random.randint(0, 365))
    orders.append({
        'order_id': f'O{i:06d}',
        'user_id': user_id,
        'order_date': order_date,
        'total_amount': 0
    })
df_orders = pd.DataFrame(orders)

# 订单明细表
order_details = []
for _, order in df_orders.iterrows():
    n_items = np.random.randint(1, 6)
    selected = products.sample(n_items)
    for _, product in selected.iterrows():
        qty = np.random.randint(1, 4)
        price = product['base_price'] * np.random.uniform(0.8, 1.2)
        amount = price * qty
        order_details.append({
            'order_id': order['order_id'],
            'product_id': product['product_id'],
            'quantity': qty,
            'unit_price': price,
            'amount': amount
        })
df_details = pd.DataFrame(order_details)

# 计算订单总金额
order_totals = df_details.groupby('order_id')['amount'].sum().reset_index()
df_orders = df_orders.merge(order_totals, on='order_id', suffixes=('', '_total'))
df_orders['total_amount'] = df_orders['amount_total']

print("=== 数据概览 ===")
print(f"用户数：{len(users)}")
print(f"商品数：{len(products)}")
print(f"订单数：{len(df_orders)}")
print(f"订单明细数：{len(df_details)}")

# 2. 数据整合与清洗
df_sales = df_orders.merge(df_details, on='order_id')
df_sales = df_sales.merge(users, on='user_id')
df_sales = df_sales.merge(products, on='product_id')
df_sales = df_sales.drop_duplicates()
df_sales = df_sales[df_sales['amount'] > 0]
df_sales = df_sales[df_sales['quantity'] > 0]
print(f"\\n清洗后销售数据：{len(df_sales)}条记录")

# 3. 购物车分析（关联规则）
cart_matrix = df_sales.groupby(['order_id', 'category']).size().unstack(fill_value=0)
cart_matrix = (cart_matrix > 0).astype(bool)
freq_items = apriori(cart_matrix, min_support=0.05, use_colnames=True)
rules = pd.DataFrame()
if len(freq_items) > 0:
    rules = association_rules(freq_items, metric="confidence", min_threshold=0.3)
    rules = rules[rules['lift'] > 1.1].sort_values('lift', ascending=False)
    print(f"\\n发现{len(rules)}条关联规则")

# 4. RFM分析
current_date = df_sales['order_date'].max()
rfm = df_sales.groupby('user_id').agg({
    'order_date': lambda x: (current_date - x.max()).days,
    'order_id': 'nunique',
    'amount': 'sum'
}).rename(columns={'order_date': 'Recency', 'order_id': 'Frequency', 'amount': 'Monetary'})
rfm['R_score'] = pd.qcut(rfm['Recency'], 4, labels=[4, 3, 2, 1], duplicates='drop').astype(int)
rfm['F_score'] = pd.qcut(rfm['Frequency'].rank(method='first'), 4, labels=[1, 2, 3, 4], duplicates='drop').astype(int)
rfm['M_score'] = pd.qcut(rfm['Monetary'], 4, labels=[1, 2, 3, 4], duplicates='drop').astype(int)
rfm['RFM_total'] = rfm['R_score'] + rfm['F_score'] + rfm['M_score']
print("\\n=== RFM分析完成 ===")

# 5. 用户聚类
user_features = df_sales.groupby('user_id').agg({
    'amount': ['mean', 'sum'],
    'quantity': 'sum',
    'order_id': 'nunique'
})
user_features.columns = ['Avg_amount', 'Total_amount', 'Total_qty', 'Order_count']
user_features = user_features.merge(rfm[['Recency', 'RFM_total']], left_index=True, right_index=True)

k = 3
if len(user_features) >= k:
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(user_features)
    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    user_features['Cluster'] = kmeans.fit_predict(X_scaled)
    print("\\n=== 用户聚类完成 ===")

# 6. 业务指标
print("\\n=== 核心业务指标 ===")
total_revenue = df_sales['amount'].sum()
total_orders = df_orders['order_id'].nunique()
total_customers = users['user_id'].nunique()
avg_order_value = total_revenue / total_orders
repeat_rate = len(rfm[rfm['Frequency'] > 1]) / total_customers * 100
print(f"总销售额：¥{total_revenue:,.0f}")
print(f"总订单数：{total_orders}")
print(f"总用户数：{total_customers}")
print(f"平均客单价：¥{avg_order_value:.0f}")
print(f"复购率：{repeat_rate:.1f}%")

# 7. BI仪表盘可视化
fig = plt.figure(figsize=(16, 12))
fig.suptitle('电商业务BI仪表盘', fontsize=18, fontweight='bold')

# 1) 月度销售趋势
sales_by_month = df_sales.groupby(df_sales['order_date'].dt.to_period('M'))['amount'].sum()
ax1 = fig.add_subplot(2, 3, 1)
ax1.plot(sales_by_month.index.astype(str), sales_by_month.values, marker='o', color='steelblue')
ax1.set_title('月度销售趋势', fontsize=12)
ax1.tick_params(axis='x', rotation=45)

# 2) 品类销售占比
category_sales = df_sales.groupby('category')['amount'].sum().sort_values(ascending=False)
ax2 = fig.add_subplot(2, 3, 2)
ax2.pie(category_sales.values, labels=category_sales.index, autopct='%1.1f%%', startangle=90)
ax2.set_title('各品类销售占比', fontsize=12)

# 3) RFM客户分层
segment_counts = pd.cut(rfm['RFM_total'], bins=[0, 5, 8, 11, 12], labels=['低价值', '中价值', '高价值', '超高价值']).value_counts()
ax3 = fig.add_subplot(2, 3, 3)
ax3.bar(segment_counts.index, segment_counts.values, color=['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'])
ax3.set_title('客户价值分层', fontsize=12)

# 4) 城市销售排行
city_sales = df_sales.groupby('city')['amount'].sum().sort_values(ascending=True)
ax4 = fig.add_subplot(2, 3, 4)
ax4.barh(city_sales.index, city_sales.values, color='coral')
ax4.set_title('各城市销售额', fontsize=12)

# 5) 关联规则Top5
ax5 = fig.add_subplot(2, 3, 5)
if len(rules) > 0:
    top_rules = rules.nlargest(5, 'lift')
    rule_names = [f"{list(a)[0]}→{list(c)[0]}" for a, c in zip(top_rules['antecedents'], top_rules['consequents'])]
    ax5.barh(rule_names, top_rules['lift'], color='teal')
    ax5.set_title('Top5 关联规则（提升度）', fontsize=12)
else:
    ax5.text(0.5, 0.5, '无强关联规则', ha='center', va='center', fontsize=14)
    ax5.set_title('关联规则分析')

# 6) 用户聚类分布
ax6 = fig.add_subplot(2, 3, 6)
if 'Cluster' in user_features.columns:
    cluster_dist = user_features['Cluster'].value_counts().sort_index()
    ax6.bar([f'聚类{i}' for i in cluster_dist.index], cluster_dist.values, color='purple', alpha=0.7)
    ax6.set_title('用户聚类分布', fontsize=12)
else:
    ax6.text(0.5, 0.5, '无聚类结果', ha='center', va='center', fontsize=14)
    ax6.set_title('用户聚类')

plt.tight_layout()
plt.show()

# 8. 输出总结报告
print("\\n" + "="*50)
print("  端到端BI分析项目完成")
print("="*50)
print("\\n本项目整合了以下分析技术：")
print("1. 数据整合与清洗 - 多表关联、去重、异常处理")
print("2. 购物车分析 - Apriori算法挖掘关联规则")
print("3. RFM客户分层 - 基于最近购买、频次、金额分群")
print("4. 用户聚类 - KMeans聚类分析用户消费行为")
print("5. BI报告 - 业务指标汇总与可视化仪表盘")
print("\\n" + "="*50)`,
    tips: ['综合项目需要清晰的流程设计', '可视化可以将复杂分析结果直观呈现', '业务洞察是数据分析的最终价值']
  }
]
'''

# 把项目5-10追加到文件后，再补上闭合的 ];
final_content = content_before + new_projects + '];\n' + content[projects_end + 2:]

# 保存文件
with open('src/pages/CodePractice.tsx', 'w', encoding='utf-8') as f:
    f.write(final_content)

print("成功添加项目5-10到CodePractice.tsx")
