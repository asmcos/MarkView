# MarkView

一个轻量级的前端 Markdown 渲染工具，基于 MarkdownIt 和 Shiki 构建，提供 VitePress 风格的渲染效果。

## 特性

- 🚀 快速渲染 Markdown 内容
- 🎨 支持 VitePress 风格的自定义块（Note、Tip、Warning 等）
- 🌈 代码高亮支持多种语言和主题切换
- 📋 代码块复制功能
- 📱 响应式设计，适配不同屏幕尺寸
- 🔄 自动跟随系统深色/浅色模式

## 支持的语法

### 自定义块

```markdown
[!NOTE] 这是一个提示块
[!TIP] 这是一个技巧块
[!IMPORTANT] 这是一个重要块
[!WARNING] 这是一个警告块
[!CAUTION] 这是一个注意块
```

渲染效果：

[!NOTE] 这是一个提示块
[!TIP] 这是一个技巧块
[!IMPORTANT] 这是一个重要块
[!WARNING] 这是一个警告块
[!CAUTION] 这是一个注意块

### 容器块

```markdown
:::info
信息容器
:::

:::tip
提示容器
:::

:::warning
警告容器
:::

:::danger
危险容器
:::

:::details 点击展开详情
这是隐藏的详情内容
:::
```

渲染效果：

:::info
信息容器
:::

:::tip
提示容器
:::

:::warning
警告容器
:::

:::danger
危险容器
:::

:::details 点击展开详情
这是隐藏的详情内容
:::

### 代码块

支持多种编程语言高亮，并可指定行号和高亮行：

```js {1,3-5} ln
console.log("Hello MarkView");

// 这是一段注释
const greeting = "Hello World";
console.log(greeting);
```

## 安装

```bash
# 克隆仓库
git clone https://github.com/asmcos/markview.git

# 进入项目目录
cd markview

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 使用方法

```javascript
import { createMarkdownRenderer } from './src/utils/markdown.js';

// 创建渲染器，可选参数：'auto' | 'dark' | 'light'
const renderMarkdown = await createMarkdownRenderer("auto");

// 渲染 Markdown 文本
const markdownText = '# Hello MarkView';
const html = renderMarkdown(markdownText);

// 将渲染结果插入到页面
document.getElementById('preview').innerHTML = html;
```

## 支持的语言

代码高亮支持以下语言：

- JavaScript (js)
- TypeScript (ts)
- Bash (bash)
- JSON (json)
- HTML (html)
- CSS (css)
- Markdown (markdown)
- YAML (yaml)
- Python (python)
- Java (java)
- Go (go)
- C (c)
- Rust (rust)

