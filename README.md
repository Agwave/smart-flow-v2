# SmartFlow 智能客服系统

> 电商售后 AI 客服系统，基于阿里云通义千问大模型

## 功能特性

### 🤖 智能客服
- 基于 Qwen-plus 大模型的智能对话
- 支持订单查询、物流追踪、退换货申请等场景
- 流式响应，还原真实对话体验

### 📊 管理后台
- 工单管理 - 查看和处理客户售后工单
- 数据分析 - 客服数据分析与统计
- 知识库 - 常见问题知识库管理
- 系统设置 - 配置与个性化设置

### 🎨 界面特性
- 现代化 UI 设计
- 响应式布局
- 暗色/亮色主题支持

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 16, React 19 |
| 样式 | Tailwind CSS 4 |
| AI | 阿里云 DashScope (通义千问) |
| 组件 | shadcn/ui |
| 包管理 | pnpm |

## 快速开始

### 环境要求
- Node.js 18+
- pnpm 8+

### 安装

```bash
# 安装依赖
pnpm install

# 配置环境变量
cp .env.local.example .env.local
# 编辑 .env.local，添加 DASHSCOPE_API_KEY
```

### 启动

```bash
# 开发模式
pnpm dev

# 生产构建
pnpm build
pnpm start
```

访问 http://localhost:3000

## 项目结构

```
smart-flow-v2/
├── app/                    # Next.js App Router
│   ├── api/chat/          # AI 对话 API
│   ├── admin/             # 管理后台
│   ├── page.tsx           # 客服首页
│   └── layout.tsx         # 根布局
├── components/            # React 组件
│   ├── chat/              # 聊天相关组件
│   ├── ui/                # UI 组件库
│   └── admin/             # 管理后台组件
├── lib/                   # 工具函数与类型
└── public/                # 静态资源
```

## 环境变量

| 变量 | 说明 | 必填 |
|------|------|------|
| `DASHSCOPE_API_KEY` | 阿里云 DashScope API Key | 是 |

## 演示账号

- 管理后台: `/admin`

## License

MIT
