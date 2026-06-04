export function escapeHTML(str = '') {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function safeUrl(url = '#') {
  const value = String(url || '').trim();
  if (!value) return '#';
  try {
    const parsed = new URL(value, window.location.origin);
    if (['http:', 'https:', 'tel:', 'mailto:'].includes(parsed.protocol)) return parsed.href;
    return '#';
  } catch {
    return '#';
  }
}

export function formatDate(dateStr) {
  const d = dateStr ? new Date(dateStr) : new Date();
  const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`;
}

export function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  const icon = type === 'error' ? 'fa-circle-xmark' : type === 'warning' ? 'fa-triangle-exclamation' : 'fa-circle-check';
  const color = type === 'error' ? 'text-rose-600 border-rose-100' : type === 'warning' ? 'text-amber-600 border-amber-100' : 'text-emerald-600 border-emerald-100';
  toast.className = `flex items-center gap-3 p-4 rounded-xl shadow-lg border text-xs font-bold transition-all duration-300 transform translate-y-2 opacity-0 bg-white ${color}`;
  toast.innerHTML = `<i class="fa-solid ${icon}"></i><span>${escapeHTML(message)}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.classList.add('toast-active'), 50);
  setTimeout(() => {
    toast.classList.remove('toast-active');
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

let confirmCallback = null;
export function askConfirm(title, msg, onConfirm) {
  document.getElementById('confirm-title').innerText = title;
  document.getElementById('confirm-message').innerText = msg;
  document.getElementById('confirm-modal').classList.remove('hidden');
  confirmCallback = onConfirm;
}

export function initConfirmModal() {
  document.getElementById('confirm-cancel-btn').onclick = () => {
    document.getElementById('confirm-modal').classList.add('hidden');
    confirmCallback = null;
  };
  document.getElementById('confirm-success-btn').onclick = () => {
    document.getElementById('confirm-modal').classList.add('hidden');
    if (confirmCallback) confirmCallback();
    confirmCallback = null;
  };
}
