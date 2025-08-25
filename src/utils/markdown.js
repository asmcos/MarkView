import MarkdownIt from "https://esm.sh/markdown-it@14";
import mkContainer from "https://esm.sh/markdown-it-container";
import mkTask from "https://esm.sh/markdown-it-task-lists";
import mkAnchor from "https://esm.sh/markdown-it-anchor";
import mkAttrs from "https://esm.sh/markdown-it-attrs";
import { getHighlighter } from "https://esm.sh/shiki@1.22.0";
import { CustomContainers } from "./CustomContainers";



const highlighter = await getHighlighter({
  themes: ["vitesse-dark", "vitesse-light"],
  langs: ["js", "ts", "bash", "json", "html", "css", "markdown", "yaml"],
});

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
      }, 1600);
  }).catch(err => {
      console.error('复制失败:', err);
      alert('复制失败，请手动复制代码');
  });
}

window.copyCode = copyCode;

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



  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    highlight: (str, lang,langAttrs) => {
 
    
      const { highlight, lineNumbers } = parseMeta(langAttrs);
      let prehtml;
      try {
      prehtml =  highlighter.codeToHtml(str, {
          lang: lang || "text",
          theme: getTheme(),
        });
      } catch {
        prehtml =  `<pre><code>${md.utils.escapeHtml(str)}</code></pre>`;
      }
   
    
      return `
        <div class="code-block">
          <div class="code-header">
            <div class="code-header-left">
              <span class="dot red"></span>
              <span class="dot yellow"></span>
              <span class="dot green"></span>
            </div>
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