// お問い合わせフォームの送信処理
// - JS有効時：fetchで送信し、ページ遷移せず完了メッセージを表示
// - JS無効時：フォームのaction/methodによる通常送信にフォールバック
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const status = document.getElementById('form-status');
  const loadedAtField = document.getElementById('cf-loaded-at');
  const submitBtn = form.querySelector('.form-submit');

  // フォームが表示された時刻を記録（スパム対策：一定時間内の即時送信を弾く）
  if (loadedAtField) loadedAtField.value = String(Date.now());

  const showStatus = (type, message) => {
    status.textContent = message;
    status.className = `form-status show ${type}`;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // ハニーポット：隠しフィールドに値が入っていればBotとみなして送信しない
    const honeypot = form.querySelector('[name="_gotcha"]');
    if (honeypot && honeypot.value) {
      showStatus('success', 'お問い合わせを受け付けました。');
      form.reset();
      return;
    }

    // 表示から3秒未満での送信はBotの可能性が高いため確認を挟む
    const loadedAt = Number(loadedAtField?.value || 0);
    if (loadedAt && Date.now() - loadedAt < 3000) {
      showStatus('error', '恐れ入りますが、少し時間をおいて再度お試しください。');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = '送信中...';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        showStatus('success', 'お問い合わせありがとうございます。内容を確認のうえ、担当より折り返しご連絡いたします。');
        form.reset();
        if (loadedAtField) loadedAtField.value = String(Date.now());
      } else {
        showStatus('error', '送信に失敗しました。お手数ですが時間をおいて再度お試しください。');
      }
    } catch (err) {
      showStatus('error', '送信に失敗しました。通信環境をご確認のうえ、再度お試しください。');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = '送信する';
    }
  });
});
