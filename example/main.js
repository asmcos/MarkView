 
import '../src/styles/main.css';
import { createMarkdownRenderer } from '../src/utils/markdown.js';

const renderMarkdown = await createMarkdownRenderer("auto");

const editor = document.getElementById("editor");
const preview = document.getElementById("preview");

 
async function  update() {
  preview.innerHTML = await renderMarkdown(editor.value);
   
}

editor.addEventListener("input", update);

// 初始示例
editor.value = `# MarkView Demo

[!NOTE] 这是 NOTE

[!TIP] 这是 TIP

:::tip
Tip 容器
:::

\`\`\`js
console.log("Hello MarkView");
\`\`\`
`;

update();


 