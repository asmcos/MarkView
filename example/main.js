import { initMarkdownEditor } from '../src/utils/markdown.js';
import '../src/styles/main.css';

initMarkdownEditor({
  editorId: 'editor',
  previewId: 'preview',
  theme: 'auto'
}).then(render=>{
  document.getElementById('editor').value = `# MarkView Demo

[!NOTE] 这是 NOTE
[!TIP] 这是 TIP
[!IMPORTANT] 重要信息
[!WARNING] 警告信息
[!CAUTION] 注意事项

:::tip
Tip 容器
:::

:::warning
Warning 容器
:::

\`\`\`js {2} ln
console.log("Hello MarkView");
\`\`\`
`;
  render();
});
