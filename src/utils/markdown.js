import MarkdownIt from "https://esm.sh/markdown-it@14";
import mkContainer from "https://esm.sh/markdown-it-container";
import mkTask from "https://esm.sh/markdown-it-task-lists";
import mkAnchor from "https://esm.sh/markdown-it-anchor";
import mkAttrs from "https://esm.sh/markdown-it-attrs";
import { getHighlighter } from "https://esm.sh/shiki@1.22.0";

export async function initMarkdownEditor({ editorId, previewId, theme }) {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
  const getTheme = () => theme==='auto'? (prefersDark.matches ? "vitesse-dark" : "vitesse-light") : theme;

  const highlighter = await getHighlighter({
    themes: ["vitesse-dark","vitesse-light"],
    langs: ["js","ts","bash","json","html","css","markdown","yaml"]
  });

  function parseMeta(meta="") {
    const res = {highlight:[], lineNumbers:false};
    const range = meta.match(/{([^}]+)}/);
    if(range){
      const parts = range[1].split(",");
      for(const p of parts){
        if(p.includes("-")){
          const [a,b] = p.split("-").map(Number);
          for(let i=a;i<=b;i++) res.highlight.push(i);
        } else { const n=Number(p); if(!isNaN(n)) res.highlight.push(n); }
      }
    }
    if(/\b(ln|line-numbers)\b/i.test(meta)) res.lineNumbers = true;
    return res;
  }

  function markdownCustomBlock(md){
    const map = { NOTE:"tip", TIP:"tip", IMPORTANT:"important", WARNING:"warning", CAUTION:"caution" };
    md.core.ruler.push("custom_block", state => {
      const tokens = state.tokens;
      for(let i=0;i<tokens.length;i++){
        if(tokens[i].type==="paragraph_open"){
          const contentToken = tokens[i+1];
          if(contentToken && contentToken.type==="inline"){
            const match = contentToken.content.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(.*)/);
            if(match){
              const type = map[match[1]];
              const text = match[2];
              tokens[i].type = "html_block"; tokens[i].content = `<div class="custom-block ${type}">`;
              contentToken.type = "html_block"; contentToken.content = text;
              const closeToken = tokens[i+2];
              if(closeToken && closeToken.type==="paragraph_close") closeToken.type="html_block", closeToken.content="</div>";
            }
          }
        }
      }
    });
  }

  const md = new MarkdownIt({html:true, linkify:true, typographer:true, highlight:(code,lang,meta)=>{
    const {highlight,lineNumbers}=parseMeta(meta);
    try{
      let html = highlighter.codeToHtml(code,{lang:lang||"text",theme:getTheme()});
      return html;
    }catch{ return `<pre><code>${md.utils.escapeHtml(code)}</code></pre>`; }
  }})
  .use(mkTask,{enabled:true})
  .use(mkAttrs)
  .use(mkAnchor,{permalink:mkAnchor.permalink.ariaHidden({})})
  .use(markdownCustomBlock)
  .use(mkContainer,"tip",{render:(tokens,idx)=>tokens[idx].nesting===1?'<div class="custom-block tip">':'</div>'})
  .use(mkContainer,"warning",{render:(tokens,idx)=>tokens[idx].nesting===1?'<div class="custom-block warning">':'</div>'});

  const editor=document.getElementById(editorId);
  const preview=document.getElementById(previewId);
  function render(){ preview.innerHTML = md.render(editor.value); }
  editor.addEventListener("input", render);
  prefersDark.addEventListener("change", render);
  return render;
}
