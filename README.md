# JianQing-Shan.github.io

山渐清的 Hugo 博客，使用 PaperMod 主题并通过本地模板、CSS、JS 覆盖定制。

## 本地开发

- `hugo server -D`：本地预览草稿。
- `hugo server -D --buildFuture`：本地预览草稿和未来日期文章。
- `hugo`：生产构建到 `docs/`，用于 GitHub Pages。
- `hugo --minify`：生成压缩后的生产版本。

`docs/` 是生成物；修改源码后用 `hugo` 重建。PaperMod 位于 `themes/PaperMod/`，是 Git submodule，优先在 `layouts/` 和 `assets/` 中做本地覆盖。
