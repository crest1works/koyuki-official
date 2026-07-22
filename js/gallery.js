// ギャラリーのライトボックス（画像拡大表示）
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('gallery-grid');
  const lightbox = document.getElementById('lightbox');
  if (!grid || !lightbox) return;

  const img = document.getElementById('lightbox-img');
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');

  const items = Array.from(grid.querySelectorAll('button[data-full]'));
  let currentIndex = 0;
  let lastFocused = null;

  const show = (index) => {
    currentIndex = (index + items.length) % items.length;
    const btn = items[currentIndex];
    img.src = btn.dataset.full;
    img.alt = btn.querySelector('img')?.alt || '';
  };

  const open = (index) => {
    lastFocused = document.activeElement;
    show(index);
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  };

  const close = () => {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    img.src = '';
    if (lastFocused) lastFocused.focus();
  };

  items.forEach((btn, index) => {
    btn.addEventListener('click', () => open(index));
  });

  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', () => show(currentIndex - 1));
  nextBtn.addEventListener('click', () => show(currentIndex + 1));

  // 背景クリックで閉じる
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) close();
  });

  // キーボード操作（Esc / ← / →）
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(currentIndex - 1);
    if (e.key === 'ArrowRight') show(currentIndex + 1);
  });
});
