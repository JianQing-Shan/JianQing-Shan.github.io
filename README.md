# 山渐清博客模板

这是一个用 Hugo + PaperMod 搭建的静态博客模板，适合写文章、做归档、标签、系列和站内搜索。日常维护不需要写代码，主要就是编辑 Markdown 文件，然后预览、生成、上传。

## 适合谁

- 想拥有一个自己的博客，但不想维护复杂后台。
- 能接受用文本文件写文章。
- 愿意使用少量命令完成预览和发布。

## 第一次使用

电脑上需要先安装：

- Git：用来下载和上传博客。
- Hugo Extended：用来本地预览和生成网站。

拿到项目后，在项目目录运行一次：

```bash
git submodule update --init --recursive
```

这个命令会把博客主题下载完整。以后如果换电脑、重新下载项目，也需要再运行一次。

## 最常用的流程

1. 在 `content/posts/` 新建或修改文章。
2. 运行 `hugo server -D` 本地预览。
3. 确认没问题后运行 `hugo` 生成网站。
4. 用 Git 提交并上传。
5. GitHub Pages 会发布 `docs/` 里的网页文件。

## 目录怎么看

- `content/posts/`：博客文章，平时主要改这里。
- `content/archives.md`：归档页入口，一般不用改。
- `content/search.md`：搜索页入口，一般不用改。
- `static/`：图片、PDF、头像、站点图标等静态文件。
- `static/img/avatar.jpeg`：首页头像。
- `hugo.yaml`：网站标题、菜单、头像、GitHub 链接等配置。
- `docs/`：发布用的网站成品，由 `hugo` 自动生成，不要手动改。
- `layouts/`：页面模板，想改页面结构时才需要碰。
- `assets/`：样式和脚本，想改外观或交互时才需要碰。
- `themes/PaperMod/`：博客主题，不建议直接修改。

## 改成自己的博客

主要修改 `hugo.yaml`：

- `baseURL`：改成你的博客网址。
- `title`：改成你的站点名称。
- `params.profileMode.title`：首页显示的名字。
- `params.profileMode.subtitle`：首页简介。
- `params.profileMode.imageUrl`：头像路径。
- `params.socialIcons`：社交链接，比如 GitHub。
- `menu.main`：顶部菜单。

如果使用自定义域名，还要修改 `static/CNAME`。如果不用自定义域名，可以删除这个文件。

## 写一篇新博客

在 `content/posts/` 里新建一个 Markdown 文件，比如 `我的新文章.md`：

```markdown
---
title: "我的新文章"
date: 2026-09-06T20:00:00+08:00
draft: false
tags:
  - 随笔
slug: my-new-post
---

这里开始写正文。
```

开头这一段叫 front matter，用来告诉网站这篇文章的标题、日期、标签和网址。

- `title`：文章标题。
- `date`：发布时间。
- `draft`：是否是草稿。`true` 是草稿，`false` 是正式发布。
- `tags`：标签，可以写多个。
- `slug`：文章网址的一部分，只用小写英文、数字和连字符，例如 `my-new-post`。

正文可以正常写 Markdown：

```markdown
## 二级标题

这是一段正文。

- 列表项一
- 列表项二

[链接文字](https://example.com)
```

## 写系列文章

如果文章属于某个系列，在 front matter 里多加：

```yaml
series:
  - 世界史
series-order: 1
```

同一个系列用相同的 `series` 名称，`series-order` 控制顺序。

## 放图片或 PDF

把文件放进 `static/`，例如：

```text
static/img/example.jpg
static/files/demo.pdf
```

文章里引用图片：

```markdown
![图片说明](/img/example.jpg)
```

文章里嵌入 PDF：

```markdown
{{< pdf src="/files/demo.pdf" title="PDF 标题" >}}
```

注意：`static/` 里面的路径，在文章里引用时不需要写 `static`。例如 `static/img/example.jpg` 写成 `/img/example.jpg`。

## 本地预览

预览草稿：

```bash
hugo server -D
```

预览草稿和未来日期文章：

```bash
hugo server -D --buildFuture
```

运行后打开终端里显示的本地网址，一般是：

```text
http://localhost:1313/
```

预览时可以重点看：

- 首页是否正常。
- 新文章是否能打开。
- 图片和 PDF 是否显示。
- 标签、系列、归档、搜索是否能找到文章。

## 发布博客

每次发布前先生成网站：

```bash
hugo
```

然后提交并上传：

```bash
git status
git add -A
git commit -m "更新博客"
git push origin main
```

上传后，GitHub Pages 会用 `docs/` 里的文件发布网站。稍等一会儿访问你的博客地址。

当前示例地址是：

```text
https://JianQing-Shan.github.io/
```

## 写文章时注意什么

- 发布前确认 `draft: false`。
- `date` 不要写成未来时间，除非你就是想定时发布。
- 每篇文章的 `slug` 不要重复。
- 文件名可以用中文，但 `slug` 建议用英文。
- 图片尽量压缩后再上传，页面会打开得更快。
- 不要手动修改 `docs/`，它会在下一次运行 `hugo` 时被重新生成。

## 常见问题

- 看不到新文章：检查 `draft` 是否为 `false`，`date` 是否是未来时间。
- 本地能看到，线上看不到：确认运行过 `hugo`，并且把 `docs/` 一起提交上传了。
- 图片不显示：检查文件是否放在 `static/` 下，文章里的路径是否以 `/` 开头。
- 样式没变化：刷新浏览器缓存，或确认改的是 `assets/css/extended/` 里的文件。
- 主题丢失：运行 `git submodule update --init --recursive`。
