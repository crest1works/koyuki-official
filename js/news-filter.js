// NEWS一覧ページ：カテゴリ絞り込み（ページ遷移なし）
document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.news-filter-btn');
  const items = document.querySelectorAll('#news-index-list .news-index-item');
  const emptyMsg = document.getElementById('news-empty');
  if (!buttons.length || !items.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));

      let visibleCount = 0;
      items.forEach((item) => {
        const match = filter === 'all' || item.dataset.category === filter;
        item.classList.toggle('is-hidden', !match);
        if (match) visibleCount += 1;
      });

      emptyMsg.classList.toggle('show', visibleCount === 0);
    });
  });
});
