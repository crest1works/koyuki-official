document.addEventListener('DOMContentLoaded', () => {
  // モバイルメニューの開閉
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('main-nav');
  if (toggle && nav) {
    // メニュー表示中は背景ページをスクロールできないようにする。
    // overflow:hiddenだけだとブラウザによっては（特にiOS Safari）スクロールを
    // 完全には防げないため、bodyをposition:fixedにして固定する、より確実な方法を使う。
    let lockedScrollY = 0;
    const setOpen = (open) => {
      nav.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) {
        lockedScrollY = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${lockedScrollY}px`;
        document.body.style.left = '0';
        document.body.style.right = '0';
      } else {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        window.scrollTo(0, lockedScrollY);
      }
    };
    toggle.addEventListener('click', () => {
      setOpen(!nav.classList.contains('open'));
    });
    nav.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => setOpen(false));
    });
  }

  // スクロールで要素をフェードイン表示
  const revealEls = document.querySelectorAll('.reveal:not(.in)');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
  }

  // ヘッダーの影（スクロール時）
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => {
      header.style.boxShadow = window.scrollY > 10
        ? '0 8px 24px rgba(90,70,130,.12)'
        : 'none';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // トップへ戻るボタンの表示切り替え
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    const onScroll2 = () => {
      backToTop.classList.toggle('show', window.scrollY > 600);
    };
    window.addEventListener('scroll', onScroll2, { passive: true });
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    onScroll2();
  }
});
