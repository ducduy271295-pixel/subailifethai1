import { state } from './state.js';
import { getDBData, saveDBData, deleteDBData } from './firestore.js';
import { uploadPostImage } from './storage.js';
import { escapeHTML, safeUrl, askConfirm, showToast } from './utils.js';
import { refreshPublicUI, populateCategoryDropdown } from './render.js';
import { loadLeadsForAdmin, renderAdminLeadsTable } from './leads.js';

function requireAdmin() {
  if (!window.isAdminAuthenticated) {
    showToast('Bạn chưa có quyền Admin!', 'error');
    return false;
  }
  return true;
}

export function initAdminGlobals() {
  window.setImageSourceMode = setImageSourceMode;
  window.previewImageFile = previewImageFile;
  window.removeImagePreview = removeImagePreview;
  window.togglePostFormFields = togglePostFormFields;
  window.toggleAdminSubTab = toggleAdminSubTab;
  window.savePost = savePost;
  window.editPost = editPost;
  window.resetPostForm = resetPostForm;
  window.deletePost = deletePost;
  window.saveCategory = saveCategory;
  window.editCategory = editCategory;
  window.resetCategoryForm = resetCategoryForm;
  window.deleteCategory = deleteCategory;
  window.saveGlobalSettings = saveGlobalSettings;
  window.loadClicksForAdmin = loadClicksForAdmin;
  window.renderAdminClicksTable = renderAdminClicksTable;
  window.exportClicksCSV = exportClicksCSV;
}

export function toggleAdminSubTab(subTab) {
  document.getElementById('admin-section-posts').classList.toggle('hidden', subTab !== 'posts');
  document.getElementById('admin-section-categories').classList.toggle('hidden', subTab !== 'categories');
  document.getElementById('admin-section-settings').classList.toggle('hidden', subTab !== 'settings');
  document.getElementById('admin-section-leads').classList.toggle('hidden', subTab !== 'leads');
  document.getElementById('admin-section-clicks').classList.toggle('hidden', subTab !== 'clicks');
  ['posts', 'categories', 'settings', 'leads', 'clicks'].forEach((name) => {
    document.getElementById(`admin-subtab-${name}`).classList.toggle('active', name === subTab);
  });
  if (subTab === 'settings') loadSettingsToForm();
  if (subTab === 'leads') loadLeadsForAdmin();
  if (subTab === 'clicks') loadClicksForAdmin();
}

export function setImageSourceMode(mode) {
  state.selectedImgSourceMode = mode;
  document.getElementById('img-file-box').classList.toggle('hidden', mode !== 'file');
  document.getElementById('img-url-box').classList.toggle('hidden', mode === 'file');
  document.getElementById('btn-img-file').classList.toggle('active', mode === 'file');
  document.getElementById('btn-img-url').classList.toggle('active', mode === 'url');
}

export function previewImageFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  state.currentPreviewFile = file;
  state.currentPreviewUrl = URL.createObjectURL(file);
  document.getElementById('image-preview').src = state.currentPreviewUrl;
  document.getElementById('image-filename').innerText = file.name;
  document.getElementById('image-preview-container').classList.remove('hidden');
}

export function removeImagePreview() {
  state.currentPreviewFile = null;
  if (state.currentPreviewUrl) URL.revokeObjectURL(state.currentPreviewUrl);
  state.currentPreviewUrl = '';
  document.getElementById('post-image-file').value = '';
  document.getElementById('post-image-url').value = '';
  document.getElementById('post-existing-image').value = '';
  document.getElementById('image-preview-container').classList.add('hidden');
}

export function togglePostFormFields() {
  const isReview = document.getElementById('post-type').value === 'review';
  document.getElementById('product-name-container').classList.toggle('hidden', !isReview);
  document.getElementById('product-details-container').classList.toggle('hidden', !isReview);
  document.getElementById('post-product-name').required = isReview;
  document.getElementById('post-product-price').required = isReview;
}

export function renderAdminPostsTable() {
  const body = document.getElementById('admin-posts-table-body');
  const empty = document.getElementById('admin-table-empty');
  body.innerHTML = '';
  empty.classList.toggle('hidden', state.posts.length > 0);
  state.posts.forEach((post) => {
    const img = safeUrl(post.image) || 'https://placehold.co/100x100';
    body.insertAdjacentHTML('beforeend', `<tr class="hover:bg-slate-50 border-b text-xs text-slate-700"><td class="py-3 px-4"><div class="flex items-center space-x-3"><img src="${img}" class="w-10 h-10 rounded-lg object-cover"><div class="min-w-0"><span class="font-bold block truncate max-w-[260px]">${escapeHTML(post.title)}</span><span class="text-[10px] text-slate-400">${post.type === 'blog' ? 'Blog' : 'Review'}</span></div></div></td><td class="py-3 px-4"><span class="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-slate-100">${post.type === 'blog' ? 'Kiến thức' : 'Đánh giá SP'}</span></td><td class="py-3 px-4 text-right font-extrabold">${post.type === 'blog' ? '-' : `${Number(post.productPrice || 0).toLocaleString('th-TH')} ฿`}</td><td class="py-3 px-4 text-center"><button onclick="editPost('${escapeHTML(post.id)}')" class="h-8 w-8 rounded bg-indigo-50 text-indigo-600 mr-1"><i class="fa-solid fa-pen-to-square"></i></button><button onclick="deletePost('${escapeHTML(post.id)}')" class="h-8 w-8 rounded bg-rose-50 text-rose-600"><i class="fa-solid fa-trash-can"></i></button></td></tr>`);
  });
}

export async function savePost(event) {
  event.preventDefault();
  if (!requireAdmin()) return;

  const id = document.getElementById('post-id').value || `post-${Date.now()}`;
  const oldPost = state.posts.find((item) => item.id === id);
  const type = document.getElementById('post-type').value;
  let imageUrl = document.getElementById('post-existing-image').value || oldPost?.image || '';

  try {
    if (state.selectedImgSourceMode === 'file' && state.currentPreviewFile) {
      imageUrl = await uploadPostImage(state.currentPreviewFile, id);
    } else if (state.selectedImgSourceMode === 'url' && document.getElementById('post-image-url').value.trim()) {
      imageUrl = document.getElementById('post-image-url').value.trim();
    }

    const postData = {
      id,
      type,
      title: document.getElementById('post-title').value.trim(),
      categoryId: document.getElementById('post-category').value,
      productName: type === 'review' ? document.getElementById('post-product-name').value.trim() : '',
      productPrice: type === 'review' ? Number(document.getElementById('post-product-price').value || 0) : 0,
      productLink: type === 'review' ? document.getElementById('post-product-link').value.trim() : '',
      image: imageUrl,
      content: document.getElementById('post-content').value.trim(),
      createdAt: oldPost?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!postData.title || !postData.content) return showToast('Vui lòng nhập tiêu đề và nội dung!', 'warning');
    if (!postData.image) return showToast('Vui lòng thêm ảnh bài viết!', 'warning');
    if (type === 'review') {
      if (!postData.productName) return showToast('Vui lòng nhập tên sản phẩm!', 'warning');
      if (!postData.productLink) return showToast('Vui lòng nhập Link mua hàng / Landing để hiện nút chuyển đổi!', 'warning');
      if (safeUrl(postData.productLink) === '#') return showToast('Link mua hàng chưa đúng định dạng. Link phải bắt đầu bằng https://', 'warning');
    }

    const index = state.posts.findIndex((item) => item.id === id);
    if (index >= 0) state.posts[index] = postData;
    else state.posts.unshift(postData);

    await saveDBData('posts', postData);
    showToast('Đã lưu bài viết lên Cloud!');
    resetPostForm();
    refreshPublicUI();
    renderAdminPostsTable();
  } catch (err) {
    console.error(err);
    showToast(err.message || 'Lỗi lưu bài viết!', 'error');
  }
}

export function editPost(id) {
  const post = state.posts.find((item) => item.id === id);
  if (!post) return;
  document.getElementById('post-id').value = post.id;
  document.getElementById('post-existing-image').value = post.image || '';
  document.getElementById('post-type').value = post.type || 'review';
  document.getElementById('post-title').value = post.title || '';
  document.getElementById('post-category').value = post.categoryId || '';
  document.getElementById('post-product-name').value = post.productName || '';
  document.getElementById('post-product-price').value = post.productPrice || 0;
  document.getElementById('post-product-link').value = post.productLink || '';
  document.getElementById('post-content').value = post.content || '';
  document.getElementById('image-preview').src = post.image || '';
  document.getElementById('image-filename').innerText = post.image ? 'Ảnh hiện tại' : '';
  document.getElementById('image-preview-container').classList.toggle('hidden', !post.image);
  document.getElementById('submit-btn-text').innerText = 'Cập nhật bài viết';
  document.getElementById('cancel-edit-btn').classList.remove('hidden');
  togglePostFormFields();
  document.getElementById('post-form').scrollIntoView({ behavior: 'smooth' });
}

export function resetPostForm() {
  document.getElementById('post-form').reset();
  document.getElementById('post-id').value = '';
  document.getElementById('post-existing-image').value = '';
  document.getElementById('submit-btn-text').innerText = 'Đăng bài viết';
  document.getElementById('cancel-edit-btn').classList.add('hidden');
  removeImagePreview();
  setImageSourceMode('file');
  togglePostFormFields();
}

export function deletePost(id) {
  if (!requireAdmin()) return;
  askConfirm('Xóa bài này?', 'Bài viết sẽ bị xóa vĩnh viễn trên Cloud.', async () => {
    try {
      state.posts = state.posts.filter((item) => item.id !== id);
      await deleteDBData('posts', id);
      showToast('Đã xóa bài viết!');
      refreshPublicUI();
      renderAdminPostsTable();
    } catch (err) {
      console.error(err);
      showToast('Lỗi xóa bài viết!', 'error');
    }
  });
}

export function renderAdminCategoriesGrid() {
  const container = document.getElementById('admin-categories-grid');
  container.innerHTML = '';
  state.categories.forEach((cat) => {
    container.insertAdjacentHTML('beforeend', `<div class="p-4 bg-slate-50 border rounded-2xl flex justify-between items-center"><h4 class="font-bold text-xs"><i class="${escapeHTML(cat.icon)} mr-2"></i>${escapeHTML(cat.name)}</h4><div><button onclick="editCategory('${escapeHTML(cat.id)}')" class="mr-2 text-indigo-600 text-xs font-bold">Sửa</button><button onclick="deleteCategory('${escapeHTML(cat.id)}')" class="text-rose-600 text-xs font-bold">Xóa</button></div></div>`);
  });
}

export async function saveCategory(event) {
  event.preventDefault();
  if (!requireAdmin()) return;
  const id = document.getElementById('category-id').value || `cat-${Date.now()}`;
  const catData = {
    id,
    name: document.getElementById('category-name-input').value.trim(),
    icon: document.getElementById('category-icon').value,
    color: document.getElementById('category-color').value,
    updatedAt: new Date().toISOString()
  };
  if (!catData.name) return showToast('Vui lòng nhập tên danh mục!', 'warning');
  const index = state.categories.findIndex((cat) => cat.id === id);
  if (index >= 0) state.categories[index] = catData;
  else state.categories.push(catData);
  await saveDBData('categories', catData);
  showToast('Đã lưu danh mục!');
  resetCategoryForm();
  refreshPublicUI();
  renderAdminCategoriesGrid();
}

export function editCategory(id) {
  const cat = state.categories.find((item) => item.id === id);
  if (!cat) return;
  document.getElementById('category-id').value = cat.id;
  document.getElementById('category-name-input').value = cat.name || '';
  document.getElementById('category-icon').value = cat.icon || 'fa-solid fa-circle';
  document.getElementById('category-color').value = cat.color || 'emerald';
  document.getElementById('submit-cat-btn-text').innerText = 'Cập nhật danh mục';
  document.getElementById('cancel-cat-edit-btn').classList.remove('hidden');
}

export function resetCategoryForm() {
  document.getElementById('category-form').reset();
  document.getElementById('category-id').value = '';
  document.getElementById('submit-cat-btn-text').innerText = 'Lưu chuyên mục';
  document.getElementById('cancel-cat-edit-btn').classList.add('hidden');
}

export function deleteCategory(id) {
  if (!requireAdmin()) return;
  askConfirm('Xóa danh mục?', 'Danh mục sẽ bị xóa vĩnh viễn trên Cloud.', async () => {
    state.categories = state.categories.filter((cat) => cat.id !== id);
    await deleteDBData('categories', id);
    showToast('Đã xóa danh mục!');
    refreshPublicUI();
    renderAdminCategoriesGrid();
  });
}

function loadSettingsToForm() {
  document.getElementById('set-about').value = state.globalSettings.about || '';
  document.getElementById('set-email').value = state.globalSettings.email || '';
  document.getElementById('set-phone').value = state.globalSettings.phone || '';
  document.getElementById('set-fb').value = state.globalSettings.fb || '';
  document.getElementById('set-tw').value = state.globalSettings.tw || '';
  document.getElementById('set-yt').value = state.globalSettings.yt || '';
}

export async function saveGlobalSettings(event) {
  event.preventDefault();
  if (!requireAdmin()) return;
  state.globalSettings = {
    id: 'site-config',
    about: document.getElementById('set-about').value.trim(),
    email: document.getElementById('set-email').value.trim(),
    phone: document.getElementById('set-phone').value.trim(),
    fb: document.getElementById('set-fb').value.trim(),
    tw: document.getElementById('set-tw').value.trim(),
    yt: document.getElementById('set-yt').value.trim(),
    updatedAt: new Date().toISOString()
  };
  await saveDBData('settings', state.globalSettings);
  showToast('Đã lưu cài đặt website!');
  refreshPublicUI();
}


function clickDateValue(item) {
  return item.createdAt || item.createdAtISO || item.time || '';
}

function isToday(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

export async function loadClicksForAdmin() {
  if (!requireAdmin()) return;
  try {
    state.clicks = await getDBData('clicks');
    state.clicks.sort((a, b) => new Date(clickDateValue(b) || 0) - new Date(clickDateValue(a) || 0));
    renderAdminClicksTable();
  } catch (err) {
    console.error(err);
    showToast('Không tải được thống kê click. Kiểm tra Firestore Rules.', 'error');
  }
}

export function renderAdminClicksTable() {
  const body = document.getElementById('admin-clicks-table-body');
  const empty = document.getElementById('admin-clicks-empty');
  if (!body || !empty) return;
  const clicks = state.clicks || [];
  body.innerHTML = '';
  empty.classList.toggle('hidden', clicks.length > 0);

  const productCounts = clicks.reduce((acc, click) => {
    const key = click.product || click.offer || 'unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const topProduct = Object.entries(productCounts).sort((a, b) => b[1] - a[1])[0];

  const totalEl = document.getElementById('click-total-count');
  const todayEl = document.getElementById('click-today-count');
  const topEl = document.getElementById('click-top-product');
  if (totalEl) totalEl.innerText = String(clicks.length);
  if (todayEl) todayEl.innerText = String(clicks.filter((item) => isToday(clickDateValue(item))).length);
  if (topEl) topEl.innerText = topProduct ? `${topProduct[0]} (${topProduct[1]})` : '-';

  const summary = document.getElementById('click-product-summary');
  if (summary) {
    summary.innerHTML = '';
    Object.entries(productCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).forEach(([product, count]) => {
      summary.insertAdjacentHTML('beforeend', `<div class="rounded-2xl border border-slate-100 bg-slate-50 p-4 flex items-center justify-between"><div><div class="text-[10px] text-slate-400 font-bold uppercase">Product</div><div class="text-xs font-extrabold text-slate-900">${escapeHTML(product)}</div></div><div class="text-lg font-black text-emerald-600">${count}</div></div>`);
    });
  }

  clicks.slice(0, 100).forEach((click) => {
    body.insertAdjacentHTML('beforeend', `
      <tr class="hover:bg-slate-50 border-b text-xs text-slate-700">
        <td class="py-3 px-4 font-bold">${escapeHTML(click.product || click.offer || '-')}</td>
        <td class="py-3 px-4">${escapeHTML(click.source || click.utm_source || 'direct')}</td>
        <td class="py-3 px-4 max-w-[260px] truncate" title="${escapeHTML(click.referrer || '')}">${escapeHTML(click.referrer || '-')}</td>
        <td class="py-3 px-4 whitespace-nowrap">${escapeHTML(clickDateValue(click) ? new Date(clickDateValue(click)).toLocaleString('vi-VN') : '-')}</td>
      </tr>
    `);
  });
}

export function exportClicksCSV() {
  if (!requireAdmin()) return;
  if (!state.clicks?.length) {
    return showToast('Chưa có dữ liệu click để xuất CSV!', 'warning');
  }

  const header = ['product', 'source', 'utm_source', 'referrer', 'destination', 'createdAt'];

  const rows = state.clicks.map((click) =>
    header.map((key) => {
      const value = key === 'createdAt'
        ? clickDateValue(click)
        : (click[key] || '');

      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(',')
  );

  const csv = [header.join(','), ...rows].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');

  a.href = url;
  a.download = `subailifethai-clicks-${new Date().toISOString().slice(0, 10)}.csv`;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}

export function renderAdminUI() {
  renderAdminPostsTable();
  renderAdminCategoriesGrid();
  populateCategoryDropdown();
  renderAdminLeadsTable();
  renderAdminClicksTable();
}
