/* ============================================
   Kilo Code 中文文档 - 交互逻辑
   ============================================ */

(function () {
  'use strict';

  // --- 主题管理 ---
  const ThemeManager = {
    STORAGE_KEY: 'kilo-docs-theme',

    init() {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        document.documentElement.setAttribute('data-theme', saved);
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
      }
      this.updateIcon();

      // 监听系统主题变化
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem(this.STORAGE_KEY)) {
          document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
          this.updateIcon();
        }
      });
    },

    toggle() {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem(this.STORAGE_KEY, next);
      this.updateIcon();
    },

    updateIcon() {
      const btn = document.querySelector('.theme-toggle');
      if (!btn) return;
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      btn.innerHTML = isDark
        ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
        : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    }
  };

  // --- 侧边栏管理 ---
  const SidebarManager = {
    init() {
      const toggle = document.querySelector('.sidebar-toggle');
      const sidebar = document.getElementById('sidebar');
      const overlay = document.getElementById('sidebar-overlay');

      if (toggle && sidebar) {
        toggle.addEventListener('click', () => this.toggle());
      }
      if (overlay) {
        overlay.addEventListener('click', () => this.close());
      }

      // 高亮当前页
      this.highlightCurrent();
    },

    toggle() {
      const sidebar = document.getElementById('sidebar');
      const overlay = document.getElementById('sidebar-overlay');
      sidebar?.classList.toggle('open');
      overlay?.classList.toggle('open');
    },

    close() {
      const sidebar = document.getElementById('sidebar');
      const overlay = document.getElementById('sidebar-overlay');
      sidebar?.classList.remove('open');
      overlay?.classList.remove('open');
    },

    highlightCurrent() {
      const path = window.location.pathname;
      const links = document.querySelectorAll('.sidebar-link');
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;
        // 规范化路径比较
        const linkPath = new URL(href, window.location.origin).pathname;
        if (path === linkPath || (path.endsWith('/') && path.slice(0, -1) === linkPath) || (linkPath.endsWith('/') && linkPath.slice(0, -1) === path)) {
          link.classList.add('active');
        }
      });
    }
  };

  // --- TOC 自动生成 ---
  const TOCManager = {
    init() {
      const tocNav = document.getElementById('toc-nav');
      const content = document.querySelector('.doc-content');
      if (!tocNav || !content) return;

      const headings = content.querySelectorAll('h2, h3');
      if (headings.length === 0) {
        const toc = document.querySelector('.toc');
        if (toc) toc.style.display = 'none';
        return;
      }

      // 生成 TOC 链接
      const fragment = document.createDocumentFragment();
      headings.forEach((heading, index) => {
        const id = heading.id || `heading-${index}`;
        heading.id = id;

        const a = document.createElement('a');
        a.href = `#${id}`;
        a.textContent = heading.textContent;
        a.className = heading.tagName === 'H3' ? 'toc-h3' : '';
        a.dataset.target = id;
        fragment.appendChild(a);
      });
      tocNav.appendChild(fragment);

      // IntersectionObserver 追踪当前标题
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            tocNav.querySelectorAll('a').forEach(a => a.classList.remove('active'));
            const link = tocNav.querySelector(`a[data-target="${entry.target.id}"]`);
            if (link) link.classList.add('active');
          }
        });
      }, { rootMargin: '-80px 0px -70% 0px', threshold: 0 });

      headings.forEach(h => observer.observe(h));
    }
  };

  // --- 搜索功能 ---
  const SearchManager = {
    init() {
      const searchBtn = document.querySelector('.search-btn');
      const modal = document.getElementById('search-modal');
      const input = document.getElementById('search-input');
      const results = document.getElementById('search-results');
      const overlay = modal?.querySelector('.search-overlay');

      if (!modal || !input || !results) return;

      // Ctrl+K / Cmd+K 快捷键
      document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          this.open();
        }
        if (e.key === 'Escape') {
          this.close();
        }
      });

      if (searchBtn) {
        searchBtn.addEventListener('click', () => this.open());
      }
      if (overlay) {
        overlay.addEventListener('click', () => this.close());
      }

      // 输入搜索
      let debounceTimer;
      input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => this.search(input.value), 200);
      });
    },

    open() {
      const modal = document.getElementById('search-modal');
      const input = document.getElementById('search-input');
      modal?.classList.add('open');
      if (input) {
        input.value = '';
        setTimeout(() => input.focus(), 100);
      }
      const results = document.getElementById('search-results');
      if (results) results.innerHTML = '';
    },

    close() {
      const modal = document.getElementById('search-modal');
      modal?.classList.remove('open');
    },

    search(query) {
      const results = document.getElementById('search-results');
      if (!results) return;

      if (!query.trim()) {
        results.innerHTML = '';
        return;
      }

      const index = typeof SEARCH_INDEX !== 'undefined' ? SEARCH_INDEX : [];
      const q = query.toLowerCase().trim();
      const matches = index.filter(item =>
        item.title.toLowerCase().includes(q) ||
        item.section.toLowerCase().includes(q) ||
        (item.keywords && item.keywords.toLowerCase().includes(q))
      ).slice(0, 10);

      if (matches.length === 0) {
        results.innerHTML = '<div class="search-empty">未找到相关结果</div>';
        return;
      }

      results.innerHTML = matches.map(item =>
        `<a href="${item.url}" class="search-result-item">
          <div class="search-result-title">${this.highlight(item.title, q)}</div>
          <div class="search-result-section">${item.section}</div>
        </a>`
      ).join('');
    },

    highlight(text, query) {
      const idx = text.toLowerCase().indexOf(query);
      if (idx === -1) return text;
      return text.slice(0, idx) + '<strong>' + text.slice(idx, idx + query.length) + '</strong>' + text.slice(idx + query.length);
    }
  };

  // --- 代码块复制按钮 ---
  const CodeBlockManager = {
    init() {
      document.querySelectorAll('pre').forEach(pre => {
        const code = pre.querySelector('code');
        if (!code) return;

        // 包装代码块
        const wrapper = document.createElement('div');
        wrapper.className = 'code-block';
        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);

        // 添加头部
        const header = document.createElement('div');
        header.className = 'code-block-header';

        // 检测语言
        const langClass = [...code.classList].find(c => c.startsWith('language-') || c.startsWith('lang-'));
        const lang = langClass ? langClass.replace(/^(language-|lang-)/, '') : '';

        const langSpan = document.createElement('span');
        langSpan.className = 'code-block-lang';
        langSpan.textContent = lang;
        header.appendChild(langSpan);

        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.textContent = '复制';
        copyBtn.addEventListener('click', () => {
          navigator.clipboard.writeText(code.textContent).then(() => {
            copyBtn.textContent = '已复制!';
            setTimeout(() => { copyBtn.textContent = '复制'; }, 2000);
          });
        });
        header.appendChild(copyBtn);

        wrapper.insertBefore(header, pre);
      });
    }
  };

  // --- 标签页 ---
  const TabsManager = {
    init() {
      document.querySelectorAll('.tabs').forEach(tabGroup => {
        const btns = tabGroup.querySelectorAll('.tab-btn');
        const panels = tabGroup.querySelectorAll('.tab-panel');

        btns.forEach(btn => {
          btn.addEventListener('click', () => {
            const target = btn.dataset.tab;
            btns.forEach(b => b.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            const panel = tabGroup.querySelector(`[data-panel="${target}"]`);
            if (panel) panel.classList.add('active');
          });
        });
      });
    }
  };

  // --- 初始化 ---
  document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
    SidebarManager.init();
    TOCManager.init();
    SearchManager.init();
    CodeBlockManager.init();
    TabsManager.init();

    // 主题切换按钮
    document.querySelector('.theme-toggle')?.addEventListener('click', () => {
      ThemeManager.toggle();
    });
  });
})();
