// 活動経歴：年タブで表示中のパネルを切り替える（WAI-ARIA Tabsパターン）
document.addEventListener('DOMContentLoaded', () => {
  const tablist = document.querySelector('.year-tabs[role="tablist"]');
  if (!tablist) return;

  const tabs = Array.from(tablist.querySelectorAll('.year-tab'));
  if (tabs.length === 0) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FADE = 220; // css の .year-panel transition と合わせる(ms)

  const panelFor = (tab) => document.getElementById(tab.getAttribute('aria-controls'));

  let switching = false;

  const selectTab = (tab, { focusTab = false } = {}) => {
    if (switching || tab.getAttribute('aria-selected') === 'true') return;

    const currentTab = tabs.find((t) => t.getAttribute('aria-selected') === 'true');
    const currentPanel = currentTab ? panelFor(currentTab) : null;
    const nextPanel = panelFor(tab);
    if (!nextPanel) return;

    tabs.forEach((t) => {
      const selected = t === tab;
      t.setAttribute('aria-selected', String(selected));
      t.tabIndex = selected ? 0 : -1;
    });
    if (focusTab) tab.focus();

    const showNext = () => {
      nextPanel.hidden = false;
      // hidden解除直後に付けると transition が効かないので、1フレーム置いてから付与する
      void nextPanel.offsetWidth;
      nextPanel.classList.add('is-active');
    };

    if (reduceMotion || !currentPanel || currentPanel === nextPanel) {
      if (currentPanel && currentPanel !== nextPanel) {
        currentPanel.classList.remove('is-active');
        currentPanel.hidden = true;
      }
      showNext();
      return;
    }

    switching = true;
    currentPanel.classList.remove('is-active');
    window.setTimeout(() => {
      currentPanel.hidden = true;
      showNext();
      switching = false;
    }, FADE);
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => selectTab(tab));

    tab.addEventListener('keydown', (e) => {
      const i = tabs.indexOf(tab);
      let target = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        target = tabs[(i + 1) % tabs.length];
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        target = tabs[(i - 1 + tabs.length) % tabs.length];
      } else if (e.key === 'Home') {
        target = tabs[0];
      } else if (e.key === 'End') {
        target = tabs[tabs.length - 1];
      }
      if (target) {
        e.preventDefault();
        selectTab(target, { focusTab: true });
      }
    });
  });
});
