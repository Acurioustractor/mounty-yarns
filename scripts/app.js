(() => {
  const SITE = {
    totalPages: 52,
    pagePrefix: 'assets/page-',
    storiesPath: 'data/stories.json',
    sectionsPath: 'data/sections.json',
    updatesPath: 'data/updates.json',
    textPath: 'data/mounty-yarns.txt'
  };

  const pageScroller = document.getElementById('page-scroller');
  const pageIndicator = document.getElementById('page-indicator');
  const prevPageBtn = document.getElementById('prev-page');
  const nextPageBtn = document.getElementById('next-page');
  const storyGrid = document.getElementById('story-grid');
  const shuffleBtn = document.getElementById('shuffle-quotes');
  const resetBtn = document.getElementById('reset-quotes');
  const tocList = document.getElementById('toc-list');
  const reportSearch = document.getElementById('report-search');
  const clearSearchBtn = document.getElementById('clear-search');
  const searchResults = document.getElementById('search-results');
  const updatesList = document.getElementById('updates-list');
  const updateForm = document.getElementById('update-form');

  let currentPage = 1;
  let pageObserver;
  let storyData = [];
  let defaultStoryData = [];
  let sectionData = [];
  let updatesData = [];
  let pageTextCache = [];

  const html = {
    escape(text) {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    },
    highlight(text, query) {
      if (!query) return html.escape(text);
      const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedQuery})`, 'ig');
      return html.escape(text).replace(regex, '<strong>$1</strong>');
    }
  };

  function initNav() {
    const navToggle = document.querySelector('.nav-toggle');
    const siteNav = document.getElementById('site-nav');
    if (!navToggle || !siteNav) return;

    navToggle.addEventListener('click', () => {
      const isOpen = siteNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    siteNav.querySelectorAll('a').forEach(link =>
      link.addEventListener('click', () => {
        siteNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      })
    );
  }

  function pageImagePath(index) {
    return `${SITE.pagePrefix}${String(index).padStart(2, '0')}.png`;
  }

  function renderPages() {
    if (!pageScroller) return;
    const frag = document.createDocumentFragment();
    for (let i = 1; i <= SITE.totalPages; i += 1) {
      const figure = document.createElement('figure');
      figure.className = 'page-illustration';
      figure.id = `page-${i}`;

      const img = document.createElement('img');
      img.src = pageImagePath(i);
      img.alt = `Mounty Yarns report page ${i}`;
      img.loading = i <= 2 ? 'eager' : 'lazy';

      figure.appendChild(img);
      frag.appendChild(figure);
    }
    pageScroller.appendChild(frag);
    initPageObserver();
  }

  function initPageObserver() {
    if (!pageScroller) return;

    pageObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const page = Number(entry.target.id.split('-')[1]);
            updateCurrentPage(page);
          }
        });
      },
      {
        root: pageScroller,
        threshold: 0.6
      }
    );

    document.querySelectorAll('.page-illustration').forEach(el => pageObserver.observe(el));
  }

  function updateCurrentPage(page) {
    if (Number.isNaN(page)) return;
    currentPage = Math.min(Math.max(page, 1), SITE.totalPages);
    if (pageIndicator) {
      pageIndicator.textContent = `Page ${currentPage}`;
    }
  }

  function jumpToPage(page) {
    if (!pageScroller) return;
    const target = document.getElementById(`page-${page}`);
    if (!target) return;
    target.scrollIntoView({ block: 'start', behavior: 'smooth' });
    updateCurrentPage(page);
  }

  function bindPagingControls() {
    if (prevPageBtn) {
      prevPageBtn.addEventListener('click', () => {
        const target = Math.max(currentPage - 1, 1);
        jumpToPage(target);
      });
    }

    if (nextPageBtn) {
      nextPageBtn.addEventListener('click', () => {
        const target = Math.min(currentPage + 1, SITE.totalPages);
        jumpToPage(target);
      });
    }
  }

  function renderStoryCard(story) {
    const card = document.createElement('article');
    card.className = 'story-card';
    card.dataset.page = `p.${story.page}`;

    if (story.image) {
      const img = document.createElement('img');
      img.src = story.image;
      img.alt = `${story.title} artwork preview`;
      img.loading = 'lazy';
      card.appendChild(img);
    }

    const meta = document.createElement('div');
    meta.className = 'story-meta';
    meta.textContent = story.tags.join(' • ');
    card.appendChild(meta);

    const quote = document.createElement('blockquote');
    quote.textContent = story.quote;
    card.appendChild(quote);

    const summary = document.createElement('p');
    summary.textContent = story.summary;
    card.appendChild(summary);

    const button = document.createElement('button');
    button.className = 'btn tertiary';
    button.type = 'button';
    button.textContent = 'Read this yarn';
    button.addEventListener('click', () => jumpToPage(story.page));
    card.appendChild(button);

    return card;
  }

  function renderStories(list) {
    if (!storyGrid) return;
    storyGrid.innerHTML = '';
    const frag = document.createDocumentFragment();
    list.forEach(story => frag.appendChild(renderStoryCard(story)));
    storyGrid.appendChild(frag);
  }

  function shuffleStories() {
    const shuffled = storyData.slice();
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    renderStories(shuffled);
  }

  function initStoryControls() {
    if (shuffleBtn) {
      shuffleBtn.addEventListener('click', shuffleStories);
    }
    if (resetBtn) {
      resetBtn.addEventListener('click', () => renderStories(defaultStoryData));
    }
  }

  async function loadStories() {
    if (!storyGrid) return;
    try {
      const response = await fetch(SITE.storiesPath);
      storyData = await response.json();
      defaultStoryData = storyData.slice();
      renderStories(defaultStoryData);
    } catch (error) {
      console.error('Failed to load stories', error);
      storyGrid.innerHTML = '<p>Unable to load story highlights right now.</p>';
    }
  }

  function renderToc() {
    if (!tocList || !sectionData.length) return;
    const frag = document.createDocumentFragment();
    sectionData.forEach(section => {
      const item = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = section.title;
      btn.addEventListener('click', () => jumpToPage(section.page));
      item.appendChild(btn);
      frag.appendChild(item);
    });
    tocList.appendChild(frag);
  }

  async function loadSections() {
    if (!tocList) return;
    try {
      const response = await fetch(SITE.sectionsPath);
      sectionData = await response.json();
      renderToc();
    } catch (error) {
      console.error('Failed to load table of contents', error);
      tocList.innerHTML = '<li>Contents unavailable</li>';
    }
  }

  function renderUpdates() {
    if (!updatesList) return;
    updatesList.innerHTML = '';
    const frag = document.createDocumentFragment();
    updatesData.forEach(update => {
      const card = document.createElement('article');
      card.className = 'update-card';

      const heading = document.createElement('h4');
      heading.textContent = update.title;
      card.appendChild(heading);

      const summary = document.createElement('p');
      summary.textContent = update.summary;
      card.appendChild(summary);

      if (update.page) {
        const button = document.createElement('button');
        button.className = 'btn tertiary';
        button.type = 'button';
        button.textContent = `Open page ${update.page}`;
        button.addEventListener('click', () => jumpToPage(update.page));
        card.appendChild(button);
      } else if (update.link) {
        const anchor = document.createElement('a');
        anchor.href = update.link;
        anchor.target = '_blank';
        anchor.rel = 'noopener';
        anchor.textContent = 'Learn more';
        card.appendChild(anchor);
      }

      frag.appendChild(card);
    });
    updatesList.appendChild(frag);
  }

  async function loadUpdates() {
    if (!updatesList) return;
    try {
      const response = await fetch(SITE.updatesPath);
      updatesData = await response.json();
      renderUpdates();
    } catch (error) {
      console.error('Failed to load updates', error);
      updatesList.innerHTML = '<p>Updates will appear here soon.</p>';
    }
  }

  function handleUpdateSubmit(event) {
    event.preventDefault();
    if (!updateForm) return;
    if (!updateForm.reportValidity()) return;

    const formData = new FormData(updateForm);
    const nextUpdate = {
      title: formData.get('title').trim(),
      summary: formData.get('summary').trim(),
      link: (formData.get('link') || '').trim()
    };

    updatesData.unshift(nextUpdate);
    renderUpdates();
    updateForm.reset();
  }

  async function loadReportText() {
    if (!reportSearch) return;
    try {
      const response = await fetch(SITE.textPath);
      const raw = await response.text();
      const pages = raw.split('\f');
      pageTextCache = pages.map((page, index) => ({
        number: index + 1,
        text: page.replace(/MOUNTY YARNS\s+\d+/g, '').trim()
      }));
    } catch (error) {
      console.error('Failed to load report text', error);
    }
  }

  function searchReport(query) {
    if (!searchResults) return;
    const trimmed = query.trim();
    if (!trimmed) {
      searchResults.innerHTML = '<p class="search-empty">Search the report to jump to specific yarns or solutions.</p>';
      return;
    }

    if (!pageTextCache.length) {
      searchResults.innerHTML = '<p>Search is unavailable right now.</p>';
      return;
    }

    const matches = [];
    pageTextCache.forEach(page => {
      if (!page.text) {
        return;
      }
      const matchIndex = page.text.toLowerCase().indexOf(trimmed.toLowerCase());
      if (matchIndex !== -1) {
        const snippetStart = Math.max(matchIndex - 80, 0);
        const snippetEnd = Math.min(matchIndex + trimmed.length + 120, page.text.length);
        const snippet = page.text.slice(snippetStart, snippetEnd).replace(/\s+/g, ' ');
        matches.push({
          page: page.number,
          snippet
        });
      }
    });

    if (!matches.length) {
      searchResults.innerHTML = '<p class="search-empty">No matches yet. Try another word like “bail”, “education”, or “Elder”.</p>';
      return;
    }

    const frag = document.createDocumentFragment();
    matches.slice(0, 10).forEach(match => {
      const hit = document.createElement('div');
      hit.className = 'search-hit';
      hit.innerHTML = `<div>${html.highlight(match.snippet, trimmed)}</div>`;

      const button = document.createElement('button');
      button.className = 'btn tertiary';
      button.type = 'button';
      button.textContent = `Open page ${match.page}`;
      button.addEventListener('click', () => jumpToPage(match.page));

      hit.appendChild(button);
      frag.appendChild(hit);
    });

    searchResults.innerHTML = '';
    searchResults.appendChild(frag);
  }

  function debounce(fn, delay = 250) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  }

  function initSearch() {
    if (!reportSearch) return;
    const debounced = debounce(searchReport, 180);
    reportSearch.addEventListener('input', event => debounced(event.target.value));
    reportSearch.addEventListener('search', event => searchReport(event.target.value));

    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        reportSearch.value = '';
        searchReport('');
        reportSearch.focus();
      });
    }

    searchReport('');
  }

  function bootstrap() {
    initNav();
    renderPages();
    bindPagingControls();
    initStoryControls();
    loadStories();
    loadSections();
    loadUpdates();
    loadReportText();
    initSearch();

    if (updateForm) {
      updateForm.addEventListener('submit', handleUpdateSubmit);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
