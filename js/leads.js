import { state } from './state.js';
import { getDBData, saveDBData, deleteDBData } from './firestore.js';
import { escapeHTML, formatDate, askConfirm, showToast } from './utils.js';

function requireAdmin() {
  if (!window.isAdminAuthenticated) {
    showToast('Bạn chưa có quyền Admin!', 'error');
    return false;
  }
  return true;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function initLeadGlobals() {
  window.saveLeadEmail = saveLeadEmail;
  window.renderAdminLeadsTable = renderAdminLeadsTable;
  window.deleteLead = deleteLead;
  window.exportLeadsCSV = exportLeadsCSV;
}

export async function saveLeadEmail(event) {
  if (event) event.preventDefault();

  const nameInput = document.getElementById('lead-name');
  const emailInput = document.getElementById('lead-email');
  const consentInput = document.getElementById('lead-consent');

  const name = (nameInput?.value || '').trim();
  const email = (emailInput?.value || '').trim().toLowerCase();
  const consent = Boolean(consentInput?.checked);

  if (!email) return showToast('กรุณากรอกอีเมล', 'warning');
  if (!isValidEmail(email)) return showToast('รูปแบบอีเมลไม่ถูกต้อง', 'error');
  if (!consent) return showToast('กรุณายินยอมก่อนสมัครรับข้อมูล', 'warning');

  const leadData = {
    id: `lead-${Date.now()}`,
    name,
    email,
    consent: true,
    source: 'website-newsletter',
    page: window.location.href,
    userAgent: navigator.userAgent || '',
    createdAt: new Date().toISOString()
  };

  try {
    await saveDBData('leads', leadData);
    if (nameInput) nameInput.value = '';
    if (emailInput) emailInput.value = '';
    if (consentInput) consentInput.checked = false;
    showToast('สมัครรับข้อมูลสำเร็จ!');
  } catch (err) {
    console.error(err);
    showToast('บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่', 'error');
  }
}

export async function loadLeadsForAdmin() {
  if (!requireAdmin()) return;
  try {
    state.leads = await getDBData('leads');
    state.leads.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    renderAdminLeadsTable();
  } catch (err) {
    console.error(err);
    showToast('Không tải được danh sách khách. Kiểm tra Firestore Rules.', 'error');
  }
}

export function renderAdminLeadsTable() {
  const body = document.getElementById('admin-leads-table-body');
  const empty = document.getElementById('admin-leads-empty');
  if (!body || !empty) return;

  body.innerHTML = '';
  empty.classList.toggle('hidden', state.leads.length > 0);

  state.leads.forEach((lead) => {
    body.insertAdjacentHTML('beforeend', `
      <tr class="hover:bg-slate-50 border-b text-xs text-slate-700">
        <td class="py-3 px-4 font-bold">${escapeHTML(lead.name || '-')}</td>
        <td class="py-3 px-4">${escapeHTML(lead.email || '')}</td>
        <td class="py-3 px-4 max-w-[240px] truncate" title="${escapeHTML(lead.page || '')}">${escapeHTML(lead.source || 'website')}</td>
        <td class="py-3 px-4 whitespace-nowrap">${formatDate(lead.createdAt)}</td>
        <td class="py-3 px-4 text-center">
          <button onclick="deleteLead('${escapeHTML(lead.id)}')" class="h-8 w-8 rounded bg-rose-50 text-rose-600"><i class="fa-solid fa-trash-can"></i></button>
        </td>
      </tr>
    `);
  });
}

export function deleteLead(id) {
  if (!requireAdmin()) return;
  askConfirm('Xóa email khách?', 'Email này sẽ bị xóa vĩnh viễn khỏi Cloud.', async () => {
    try {
      state.leads = state.leads.filter((lead) => lead.id !== id);
      await deleteDBData('leads', id);
      showToast('Đã xóa email khách!');
      renderAdminLeadsTable();
    } catch (err) {
      console.error(err);
      showToast('Lỗi xóa email khách!', 'error');
    }
  });
}

export function exportLeadsCSV() {
  if (!requireAdmin()) return;
  if (!state.leads.length) return showToast('Chưa có dữ liệu để xuất CSV!', 'warning');

  const header = ['name', 'email', 'source', 'page', 'createdAt'];
  const rows = state.leads.map((lead) => header.map((key) => `"${String(lead[key] || '').replaceAll('"', '""')}"`).join(','));
  const csv = [header.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `subailifethai-leads-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
