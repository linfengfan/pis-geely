# 文档向量化项目

## 项目结构

```
pis-geely/
├── backend/                  # FastAPI 后端
│   ├── main.py              # FastAPI 主入口
│   ├── config.py            # 配置（路径、模型参数）
│   ├── models.py            # Pydantic 数据模型
│   ├── requirements.txt     # Python 依赖
│   ├── routers/             # API 路由
│   │   ├── file_upload.py  # 文件上传
│   │   ├── crawl.py         # URL 抓取
│   │   └── query.py         # 语义检索
│   └── services/            # 核心服务
│       ├── chroma_service.py   # 向量数据库
│       ├── embedder.py         # 分块 + Embedding
│       ├── pdf_converter.py     # PDF 解析
│       └── crawler.py          # 网页抓取
│
├── frontend/                 # Next.js 前端
│   └── src/app/
│       ├── page.tsx         # 主页面
│       └── globals.css      # 全局样式
│
└── data/                     # 数据目录
    ├── raw/                  # 原始上传文件
    ├── md/                   # 转换后的 Markdown
    └── chroma_db/            # 向量数据库文件
```

## 快速启动

### 1. 安装后端依赖

```bash
cd backend
pip install -r requirements.txt

# 首次运行会下载 Embedding 模型（约 400MB）
python main.py
```

后端运行在 http://localhost:8000

### 2. 安装前端依赖

```bash
cd frontend
npm install
npm run dev
```

前端运行在 http://localhost:3000

### 3. 使用流程

1. 打开 http://localhost:3000
2. **上传文档**：拖拽 PDF/Markdown 文件 → 自动解析 → 向量化
3. **抓取URL**：粘贴网页 URL → 自动抓取 → 向量化
4. **语义检索**：输入查询 → 返回最相关的文本块

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/upload/file` | 上传文件 |
| POST | `/crawl/url` | 抓取URL |
| POST | `/query/search` | 语义检索 |
| GET | `/query/documents` | 文档列表 |
| DELETE | `/query/documents/{doc_id}` | 删除文档 |

## 技术说明

- **Embedding 模型**：`shibing624/text2vec-base-chinese`（免费离线，中文优先）
- **向量数据库**：ChromaDB（本地 SQLite，无需服务器）
- **PDF 解析**：pdfminer.six（纯 Python，中文支持好）
- **文本分块**：按段落分块，800字/块，100字重叠
