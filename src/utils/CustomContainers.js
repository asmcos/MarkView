import mkContainer from "markdown-it-container";

export  function CustomContainers(md) {
  const containers = [
    "info",
    "tip",
    "warning",
    "danger",
  ];

  // 普通块
  containers.forEach(type => {
    md.use(mkContainer, type, {
      render: (tokens, idx) =>
        tokens[idx].nesting === 1
          ? `<div class="custom-block ${type}">`
          : "</div>"
    });
  });

  // details 块
  md.use(mkContainer, "details", {
    render: (tokens, idx) => {
      const token = tokens[idx];
      if (token.nesting === 1) {
        // 提取 ::: details 之后的标题 (info string)
        const m = token.info.trim().match(/^details\s+(.*)$/);
        const summary = m && m[1] ? m[1] : "Details";
        return `<details class="custom-block details"><summary>${summary}</summary>\n`;
      } else {
        return "</details>\n";
      }
    }
  });
}


