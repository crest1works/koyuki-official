// ギャラリー：横スクロールカルーセル（無限ループ・自動再生・ドラッグ）＋ ライトボックス（画像拡大表示）
document.addEventListener('DOMContentLoaded', () => {
  const viewport = document.getElementById('gallery-viewport');
  const grid = document.getElementById('gallery-grid');
  const lightbox = document.getElementById('lightbox');
  if (!grid || !lightbox) return;

  // カルーセルの複製・自動再生・ドラッグ操作をセットアップ（ライトボックスより先に実行し、
  // 複製されたボタンにもライトボックスのクリック判定が効くようにする）
  setupCarousel(viewport, grid);

  const img = document.getElementById('lightbox-img');
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');

  // ループ用に複製したボタンは aria-hidden="true" を付けてあるので、ライトボックスの
  // 前後移動（本来の枚数）からは除外する
  const items = Array.from(grid.querySelectorAll('button[data-full]:not([aria-hidden="true"])'));
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

  // 複製されたクローンも含めて全ボタンにクリックを紐づける（どちらをクリックしても、
  // 対応するオリジナル写真がライトボックスで開く）
  Array.from(grid.querySelectorAll('button[data-full]')).forEach((btn) => {
    btn.addEventListener('click', () => {
      const realIndex = items.findIndex((it) => it.dataset.full === btn.dataset.full);
      open(realIndex === -1 ? 0 : realIndex);
    });
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

// カルーセル本体：写真を複製して無限ループ化し、ゆっくり自動で横に流す。
// ホバー/タッチ/ドラッグ中は自動再生を止め、操作が終わるとしばらくして再開する。
function setupCarousel(viewport, track) {
  if (!viewport || !track) return;

  const originals = Array.from(track.children);
  if (originals.length === 0) return;

  // 無限ループ用に1セット複製する。クローンは装飾扱いにして、
  // スクリーンリーダーやTabキー移動からは見えないようにする（クリックは有効なまま）
  originals.forEach((node) => {
    const clone = node.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.querySelectorAll('button').forEach((b) => { b.tabIndex = -1; });
    track.appendChild(clone);
  });

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const SPEED = 30; // px/秒。上品にゆっくり流れる速度
  const RESUME_DELAY = 2500; // 操作が終わってから自動再生を再開するまでの時間(ms)

  // 「オリジナル1セット分」の幅（＝ここまでスクロールしたら先頭に戻す）
  let setWidth = 0;
  const measure = () => {
    let w = 0;
    for (let i = 0; i < originals.length; i++) {
      w += track.children[i].offsetWidth;
    }
    const style = getComputedStyle(track);
    const gap = parseFloat(style.columnGap || style.gap || '0') || 0;
    w += gap * originals.length;
    setWidth = w;
  };
  measure();
  window.addEventListener('resize', measure);

  let playing = !reduceMotion;
  let isDragging = false;
  let isVisible = true;
  let lastTime = null;
  let resumeTimer = null;

  const pause = () => { playing = false; };
  const scheduleResume = () => {
    if (reduceMotion) return;
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => {
      playing = true;
      lastTime = null;
    }, RESUME_DELAY);
  };

  // シームレスに無限ループさせる：端まで来たら複製したセット分だけ位置をずらす
  // （中身が同じ写真なので見た目には一切ジャンプして見えない）
  const wrapScroll = () => {
    if (setWidth <= 0) return;
    if (viewport.scrollLeft >= setWidth) {
      viewport.scrollLeft -= setWidth;
      if (isDragging) dragStartScroll -= setWidth;
    } else if (viewport.scrollLeft <= 0) {
      viewport.scrollLeft += setWidth;
      if (isDragging) dragStartScroll += setWidth;
    }
  };

  const tick = (time) => {
    if (playing && !isDragging && isVisible && setWidth > 0) {
      if (lastTime === null) lastTime = time;
      const dt = (time - lastTime) / 1000;
      lastTime = time;
      viewport.scrollLeft += SPEED * dt;
      wrapScroll();
    } else {
      lastTime = null;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  // 自動再生・ドラッグ以外（指でのスワイプ、トラックパッド、スクロールバー操作など）で
  // 端まで到達した場合も無限ループになるよう、実際のscrollイベントでも判定する
  viewport.addEventListener('scroll', wrapScroll, { passive: true });

  // 画面外にある間は自動再生を止める（無駄なCPU・バッテリー消費を防ぐ）
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { isVisible = entry.isIntersecting; });
    }, { threshold: 0.05 });
    io.observe(viewport);
  }

  // ホバー中は自動再生を止める（PC・マウス操作時のみ）
  viewport.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'mouse') pause();
  });
  viewport.addEventListener('pointerleave', (e) => {
    if (e.pointerType === 'mouse' && !isDragging) scheduleResume();
  });

  // タッチ操作中も自動再生を止める
  viewport.addEventListener('touchstart', () => pause(), { passive: true });
  viewport.addEventListener('touchend', () => scheduleResume(), { passive: true });

  // キーボードでカード内にフォーカスしている間も止める（動く内容を止められるようにする配慮）
  viewport.addEventListener('focusin', pause);
  viewport.addEventListener('focusout', () => scheduleResume());

  // マウスドラッグでの横移動
  let dragStartX = 0;
  let dragStartScroll = 0;
  let moved = false;

  viewport.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') return;
    isDragging = true;
    moved = false;
    pause();
    dragStartX = e.clientX;
    dragStartScroll = viewport.scrollLeft;
    // setPointerCaptureはここでは呼ばない：先にキャプチャすると、動かさずに
    // 離しただけの普通のクリック（拡大表示）までブラウザにclickイベントごと
    // 握りつぶされてしまう。実際にドラッグと判定してから(pointermove側で)キャプチャする。
  });

  viewport.addEventListener('pointermove', (e) => {
    if (!isDragging || e.pointerType !== 'mouse') return;
    const dx = e.clientX - dragStartX;
    if (Math.abs(dx) > 3 && !moved) {
      moved = true;
      viewport.classList.add('is-dragging');
      viewport.setPointerCapture(e.pointerId);
    }
    if (!moved) return;
    viewport.scrollLeft = dragStartScroll - dx;
    wrapScroll();
  });

  const endDrag = (e) => {
    if (!isDragging || (e.pointerType && e.pointerType !== 'mouse')) return;
    isDragging = false;
    viewport.classList.remove('is-dragging');
    scheduleResume();
  };
  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);

  // ドラッグで指/カーソルが動いた場合は、離した瞬間のクリックでライトボックスが
  // 誤って開かないようにする
  track.addEventListener('click', (e) => {
    if (moved) {
      e.stopPropagation();
      e.preventDefault();
      moved = false;
    }
  }, true);
}
