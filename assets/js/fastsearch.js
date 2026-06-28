// 覆盖 PaperMod 主题的 js/fastsearch.js（项目 assets 优先于主题）。
// 改动：搜索结果在标题下方追加“命中正文上下文片段 + 关键词高亮”。
// 其余（Fuse 初始化、键盘上下选择、Esc 复位等）与主题一致。
import * as params from '@params';

const resList = document.getElementById('searchResults');
const sInput = document.getElementById('searchInput');
const searchBox = document.getElementById('searchbox');

let fuse;
let currentElement = null;
let firstResult = null;
let lastResult = null;

const defaultFuseOptions = {
    distance: 100,
    threshold: 0.4,
    ignoreLocation: true,
    keys: ['title', 'permalink', 'summary', 'content']
};

const buildFuseOptions = () => {
    if (!params.fuseOpts) {
        return { ...defaultFuseOptions, includeMatches: true };
    }

    return {
        isCaseSensitive: params.fuseOpts.iscasesensitive ?? false,
        includeScore: params.fuseOpts.includescore ?? false,
        includeMatches: true,   // 强制开启：片段高亮依赖命中位置
        minMatchCharLength: params.fuseOpts.minmatchcharlength ?? 1,
        shouldSort: params.fuseOpts.shouldsort ?? true,
        findAllMatches: params.fuseOpts.findallmatches ?? false,
        keys: params.fuseOpts.keys ?? defaultFuseOptions.keys,
        location: params.fuseOpts.location ?? 0,
        threshold: params.fuseOpts.threshold ?? defaultFuseOptions.threshold,
        distance: params.fuseOpts.distance ?? defaultFuseOptions.distance,
        ignoreLocation: params.fuseOpts.ignorelocation ?? defaultFuseOptions.ignoreLocation
    };
};

const debounce = (fn, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = window.setTimeout(() => fn(...args), delay);
    };
};

const reset = () => {
    currentElement = null;
    firstResult = null;
    lastResult = null;
    resList.innerHTML = '';
    sInput.value = '';
    sInput.focus();
};

const setActiveResult = (element) => {
    document.querySelectorAll('.focus').forEach((item) => item.classList.remove('focus'));

    if (!element) {
        return;
    }

    element.focus();
    element.parentElement?.classList.add('focus');
    currentElement = element;
};

/* —— 高亮 / 片段相关 —— */
const SNIPPET_LEN = 64;     // 片段大致长度（约中文字数）

const escapeHtml = (s) => s.replace(/[&<>"]/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]
));

// 在 text 中定位命中：优先精确 indexOf(查询词)，退回 Fuse 在该字段的最长匹配段。
// 返回 [start, len] 或 null。
const findHit = (text, query, match) => {
    const q = (query || '').trim();
    if (q) {
        const i = text.toLowerCase().indexOf(q.toLowerCase());
        if (i !== -1) return [i, q.length];
    }
    if (match && match.indices && match.indices.length) {
        let best = match.indices[0];
        match.indices.forEach((r) => { if ((r[1] - r[0]) > (best[1] - best[0])) best = r; });
        return [best[0], best[1] - best[0] + 1];
    }
    return null;
};

// 把 text 转义为 HTML，并将 hit=[start,len] 处包上 <mark>（命中关键词加粗高亮）。
const markHtml = (text, hit) => {
    if (!hit) return escapeHtml(text);
    const [s, l] = hit;
    return escapeHtml(text.slice(0, s))
        + '<mark class="search-hl">' + escapeHtml(text.slice(s, s + l)) + '</mark>'
        + escapeHtml(text.slice(s + l));
};

// 由 item.content（.Plain 纯文本）+ Fuse 命中位置，生成“高亮上下文片段”。
// 规则：正文命中 → 命中处居中、关键词高亮；仅标题命中 → 列正文开头（不高亮）。
const buildSnippet = (item, matches, query) => {
    const content = (item.content || '').replace(/\s+/g, ' ').trim();
    if (!content) return '';
    const cm = matches && matches.find((m) => m.key === 'content');
    const hit = findHit(content, query, cm);

    // 仅标题命中（正文无命中）→ 列正文开头，不高亮
    if (!hit) {
        return escapeHtml(content.slice(0, SNIPPET_LEN)) + (content.length > SNIPPET_LEN ? '…' : '');
    }

    // 以命中点为中心截窗口，再在窗口内高亮
    const half = Math.floor(SNIPPET_LEN / 2);
    const [hs, hl] = hit;
    let start = Math.max(0, hs - half);
    let end = Math.min(content.length, start + SNIPPET_LEN);
    start = Math.max(0, end - SNIPPET_LEN);
    const windowText = content.slice(start, end);
    return (start > 0 ? '…' : '')
        + markHtml(windowText, [hs - start, hl])
        + (end < content.length ? '…' : '');
};

const renderResults = (results) => {
    if (!Array.isArray(results) || results.length === 0) {
        resList.innerHTML = '';
        firstResult = lastResult = currentElement = null;
        return;
    }

    const fragment = document.createDocumentFragment();
    const query = sInput.value;

    for (const result of results) {
        const li = document.createElement('li');

        const title = document.createElement('span');
        title.className = 'search-title';
        const titleMatch = result.matches && result.matches.find((m) => m.key === 'title');
        title.innerHTML = markHtml(result.item.title, findHit(result.item.title, query, titleMatch));

        const line = document.createElement('span');
        line.className = 'search-line';

        const snippetHtml = buildSnippet(result.item, result.matches, query);

        const link = document.createElement('a');
        link.className = 'entry-link';
        link.href = result.item.permalink;
        link.setAttribute('aria-label', result.item.title);

        li.appendChild(title);
        li.appendChild(line);
        if (snippetHtml) {
            const snip = document.createElement('div');
            snip.className = 'search-snippet';
            snip.innerHTML = snippetHtml;
            li.appendChild(snip);
        }
        li.appendChild(link);
        fragment.appendChild(li);
    }

    resList.innerHTML = '';
    resList.appendChild(fragment);
    firstResult = resList.firstElementChild;
    lastResult = resList.lastElementChild;
};

const performSearch = () => {
    if (!fuse) {
        return;
    }

    const query = sInput.value.trim();
    if (!query) {
        renderResults([]);
        return;
    }

    const searchOptions = params.fuseOpts?.limit ? { limit: params.fuseOpts.limit } : undefined;
    const results = searchOptions ? fuse.search(query, searchOptions) : fuse.search(query);
    renderResults(results);
};

const initSearch = async () => {
    if (!sInput || !resList) {
        return;
    }

    sInput.disabled = false;
    sInput.focus();

    try {
        const response = await fetch('../index.json');
        if (!response.ok) {
            throw new Error(`Search index load failed: ${response.status}`);
        }

        const data = await response.json();
        if (data) {
            fuse = new Fuse(data, buildFuseOptions());
        }
    } catch (error) {
        console.error(error);
    }
};

window.addEventListener('load', initSearch);

sInput?.addEventListener('input', debounce(performSearch, 150));

sInput?.addEventListener('search', () => {
    if (!sInput.value) {
        reset();
    }
});

document.addEventListener('keydown', (event) => {
    const { key } = event;
    const active = document.activeElement;
    const isInSearchBox = searchBox?.contains(active);

    if (key === 'Escape') {
        reset();
        return;
    }

    if (!firstResult || !isInSearchBox) {
        return;
    }

    if (key === 'ArrowDown') {
        event.preventDefault();

        if (active === sInput) {
            setActiveResult(firstResult.querySelector('.entry-link'));
        } else if (active?.parentElement !== lastResult) {
            setActiveResult(active?.parentElement?.nextElementSibling?.querySelector('.entry-link'));
        }
    } else if (key === 'ArrowUp') {
        event.preventDefault();

        if (active?.parentElement === firstResult) {
            setActiveResult(sInput);
        } else if (active !== sInput) {
            setActiveResult(active?.parentElement?.previousElementSibling?.querySelector('.entry-link'));
        }
    } else if (key === 'ArrowRight') {
        if (active?.matches?.('.entry-link')) {
            active.click();
        }
    }
});
