import MarkdownIt from 'markdown-it';
import mkContainer from 'markdown-it-container';
import mkTask from 'markdown-it-task-lists';
import mkAnchor from 'markdown-it-anchor';
import mkAttrs from 'markdown-it-attrs';
import { createHighlighter } from 'shiki';
import { CustomContainers } from './CustomContainers'; // 保持本地相对路径引用
// 导入本地安装的 MathJax
import 'mathjax/es5/tex-mml-chtml.js';
 
// 引入 markdown-it 的 MathJax 插件（解析公式语法）
import mathjax3 from 'markdown-it-mathjax3';




function parseMeta(meta = "") {
  const res = { highlight: [], lineNumbers: false };
  const range = meta.match(/{([^}]+)}/);

  if (range) {
    const parts = range[1].split(",");
    for (const p of parts) {
      if (p.includes("-")) {
        const [a, b] = p.split("-").map(Number);
        for (let i = a; i <= b; i++) res.highlight.push(i);
      } else {
        const n = Number(p);
        if (!isNaN(n)) res.highlight.push(n);
      }
    }
  }

  if (/\b(ln|line-numbers)\b/i.test(meta)) res.lineNumbers = true;
  return res;
}

function copyCode(btn) {
  const codeBlock = btn.closest('.code-block');
  const codeContent = codeBlock.querySelector('code');
  const text = codeContent.innerText;
  
  navigator.clipboard.writeText(text).then(() => {
      const orig = btn.textContent;
      btn.textContent = "已复制!";
      setTimeout(() => {
          btn.textContent = orig;
      }, 1000);
  }).catch(err => {
      console.error('复制失败:', err);
      alert('复制失败，请手动复制代码');
  });
}

window.copyCode = copyCode;

const mathjaxOptions =  {
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']],
    processEscapes: true
  },
  svg: {  // 尝试使用 SVG 输出（替代 chtml，有时能解决处理器问题）
    fontCache: 'global'
  },
  startup: {
    pageReady: function() {
      // 确保初始化完成后再执行渲染
      return MathJax.startup.defaultPageReady().then(function() {
        // 注册文档处理器（关键修复）
        const handler = MathJax.startup.document.handler;
        if (!handler) {
          MathJax.startup.document.setHandler(MathJax.handlers.html);
        }
      });
    }
  }
};
// 配置 MathJax 选项（可选：自定义公式渲染样式）
window.MathJax = mathjaxOptions;



function markdownCustomBlock(md) {
  const map = {
    NOTE: "note",
    TIP: "tip",
    IMPORTANT: "important",
    WARNING: "warning",
    CAUTION: "caution",
  };

  md.core.ruler.push("custom_block", (state) => {
    const tokens = state.tokens;

    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type === "paragraph_open") {
        const contentToken = tokens[i + 1];

        if (contentToken && contentToken.type === "inline") {
          const regex = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(.*)$/m;
          const match = contentToken.content.match(regex);

          if (match) {
            const type = map[match[1]];
            const text = match[2];

            // 开始块
            tokens[i].type = "html_block";
            tokens[i].content = `<div class="custom-block ${type}">`;

            // 中间正文
            contentToken.type = "html_block";
            contentToken.content = `<p>${text}</p>`;

            // 关闭标签
            const closeToken = {
              type: "html_block",
              content: "</div>",
              block: true,
            };
            tokens.splice(i + 2, 0, closeToken);
          }
        }
      }
    }
  });
}


export async function createMarkdownRenderer(theme = "auto") {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

  const getTheme = () =>
    theme === "auto"
      ? prefersDark.matches
        ? "vitesse-dark"
        : "vitesse-light"
      : theme;

  const highlighter = await createHighlighter({
        themes: ["vitesse-dark", "vitesse-light"],
        langs: ["js", "ts", "bash", "json", "html", "css", "markdown", "yaml",'python','java','go','c','rust'],
  });
      

  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    highlight: (str, lang, langAttrs) => {

      let prehtml;
       
      const targetLang = (lang || "text")
        .split(':')[0]  
        .trim();  
      const metaInfo = lang.includes(':') ? (lang.split(':')[1]?.trim() || '') : '';
      const { highlight: highlightLines, lineNumbers } = parseMeta(langAttrs || metaInfo);

      if (lang === 'mermaid') {
        const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        return `<div id="${id}" class="mermaid">${str}</div>`; // 先插入代码
      }

      try {
        prehtml = highlighter.codeToHtml(str, {
          lang: targetLang,
          theme: getTheme(),
          // 关键：开启 lineOptions，触发 shiki 完整渲染流程，让 meta.code.class 生效
          lineOptions: {
            wrap: true, // 强制每行代码用 <span class="line"> 包裹（不影响样式，仅为触发配置）
            lineNumbers: lineNumbers ? "inline" : undefined, // 可选：根据 parseMeta 结果显示行号
          },
          transformers:[{
            // 处理 code 节点
            code(node) {
                // 添加 language- 类名
                node.properties.className = [`language-${lang}`];
            }
          }]
 
        });
      } catch (err) {
        console.log(err)
        prehtml = `<pre class="shiki vitesse-light"><code class="language-${targetLang}">${md.utils.escapeHtml(str)}</code></pre>`;
      }
    
      return `
        <div class="code-block">
          <div class="code-header">         
            <div class="code-header-left">
              <span class="dot red"></span>
              <span class="dot yellow"></span>
              <span class="dot green"></span>
            </div>
            <span>${lang}</span>
            <button class="copy-btn" onclick="copyCode(this)">复制</button>
          </div>
          ${prehtml}
        </div>`;
    },
    
  })
    .use(mkTask, { enabled: true })
    .use(mkAttrs)
    .use(mkAnchor, {
      permalink: mkAnchor.permalink.ariaHidden({}),
      permalinkBefore: false,     // 锚点放在标题后面（避免与标题前缀冲突）
      permalinkSpace: true,       // 锚点与标题之间留空格
      permalinkSymbol: '',        // 清空默认符号（避免重复）
    })
    .use(mathjax3, {
      tex: mathjaxOptions.tex,
      chtml: mathjaxOptions.chtml
    })
    .use(markdownCustomBlock)
    .use(CustomContainers);


  md.renderer.rules.fence = function(tokens, idx, options, env, self) {
    const token = tokens[idx]
    const info = token.info ? md.utils.unescapeAll(token.info).trim() : ''
    let langName = ''
    let langAttrs = ''
  
    if (info) {
      const arr = info.split(/(\s+)/g)
      langName = arr[0]
      langAttrs = arr.slice(2).join('')
    }
  
    let highlighted
    if (options.highlight) {
      highlighted = options.highlight(token.content, langName, langAttrs) || md.utils.escapeHtml(token.content)
    } else {
      highlighted = md.utils.escapeHtml(token.content)
    }
    return highlighted;
  };

  // 返回一个函数，直接用于渲染 markdown
  
  return (src) => md.render(src);
}
