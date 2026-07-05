import { initNavContext, restoreNavAnchor } from './nav-context.js';
import { initSearchState } from './search-state.js';
import { initArticleNav } from './article-nav.js';
import { initReadingProgress } from './reading-progress.js';
import { initFloatingToc } from './floating-toc.js';
import { initSeriesMaster } from './series-master.js';

initNavContext();
initSearchState();
initArticleNav();
initReadingProgress();
initFloatingToc();
initSeriesMaster();
requestAnimationFrame(restoreNavAnchor);
