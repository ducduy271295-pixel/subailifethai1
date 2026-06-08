import { state, colorPalette } from './state.js';
import { escapeHTML, safeUrl, formatDate } from './utils.js';

function categoryById(id) {
  return state.categories.find((cat) => cat.id === id) || { name: 'ทั่วไป', icon: 'fa-solid fa-circle', color: 'slate' };
}

export function applyGlobalSettings() {
  const settings = state.globalSettings || {};
  document.getElementById('footer-about-text').innerText = settings.about || 'เว็บไซต์รีวิวและรวบรวมสาระสุขภาพสมุนไพรธรรมชาติ';
  document.getElementById('footer-email-text').innerHTML = `<i class="fa-solid fa-envelope mr-1"></i> ${escapeHTML(settings.email || 'ducduy271295@gmail.com')}`;
  document.getElementById('footer-fb-link').href = safeUrl(settings.fb);
  document.getElementById('footer-tw-link').href = safeUrl(settings.tw);
  document.getElementById('footer-yt-link').href = safeUrl(settings.yt);
  document.getElementById('footer-phone-link').href = settings.phone ? `tel:${encodeURIComponent(settings.phone)}` : '#';
}

export function renderCategories() {
  const container = document.getElementById('categories-list-container');
  container.innerHTML = '';
  const allActive = state.selectedCategoryFilter === 'all';
  container.insertAdjacentHTML('beforeend', `<button onclick="selectCategory('all')" class="flex-shrink-0 flex items-center space-x-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all border ${allActive ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}"><i class="fa-solid fa-border-all"></i><span>ทั้งหมด</span></button>`);

  state.categories.forEach((cat) => {
    const active = state.selectedCategoryFilter === cat.id;
    const textColor = colorPalette[cat.color] || colorPalette.slate;
    container.insertAdjacentHTML('beforeend', `<button onclick="selectCategory('${escapeHTML(cat.id)}')" class="flex-shrink-0 flex items-center space-x-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all border ${active ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}"><span class="${active ? 'text-emerald-400' : textColor}"><i class="${escapeHTML(cat.icon)}"></i></span><span>${escapeHTML(cat.name)}</span></button>`);
  });
}
export function renderBlogCategories() {
  const container = document.getElementById('blog-categories-list-container');
  if (!container) return;

  container.innerHTML = '';

  const totalBlogs = state.posts.filter((post) => post.type === 'blog').length;
  const allActive = state.selectedBlogCategoryFilter === 'all';

  container.insertAdjacentHTML(
    'beforeend',
    `<button onclick="selectBlogCategory('all')" class="flex-shrink-0 flex items-center space-x-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all border ${
      allActive
        ? 'bg-teal-600 text-white border-teal-600'
        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
    }">
      <i class="fa-solid fa-border-all"></i>
      <span>ทั้งหมด</span>
      <span class="px-1.5 py-0.5 rounded-full text-[9px] ${
        allActive ? 'bg-teal-800 text-teal-100' : 'bg-slate-200 text-slate-600'
      }">${totalBlogs}</span>
    </button>`
  );

  state.categories.forEach((cat) => {
    const count = state.posts.filter(
      (post) => post.type === 'blog' && post.categoryId === cat.id
    ).length;

    if (count === 0) return;

    const active = state.selectedBlogCategoryFilter === cat.id;
    const textColor = colorPalette[cat.color] || colorPalette.slate;

    container.insertAdjacentHTML(
      'beforeend',
      `<button onclick="selectBlogCategory('${escapeHTML(cat.id)}')" class="flex-shrink-0 flex items-center space-x-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all border ${
        active
          ? 'bg-slate-900 text-white border-slate-900'
          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
      }">
        <span class="${active ? 'text-teal-400' : textColor}">
          <i class="${escapeHTML(cat.icon)}"></i>
        </span>
        <span>${escapeHTML(cat.name)}</span>
        <span class="px-1.5 py-0.5 rounded-full text-[9px] ${
          active ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-600'
        }">${count}</span>
      </button>`
    );
  });
}
export function filterPosts() {
  const query = document.getElementById('search-input').value.toLowerCase().trim();
  const sortVal = document.getElementById('sort-select').value;
  let filtered = state.posts.filter((post) => {
    const isReview = post.type === 'review' || !post.type;
    const inCategory = state.selectedCategoryFilter === 'all' || post.categoryId === state.selectedCategoryFilter;
    const matches = `${post.title || ''} ${post.content || ''} ${post.productName || ''}`.toLowerCase().includes(query);
    return isReview && inCategory && matches;
  });
  if (sortVal === 'newest') filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  if (sortVal === 'oldest') filtered.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
  if (sortVal === 'price-high') filtered.sort((a, b) => Number(b.productPrice || 0) - Number(a.productPrice || 0));
  if (sortVal === 'price-low') filtered.sort((a, b) => Number(a.productPrice || 0) - Number(b.productPrice || 0));
  document.getElementById('posts-count-label').innerText = `กำลังแสดงทั้งหมด ${filtered.length} รายการ`;
  renderPostsGrid(filtered);
}

export function renderPostsGrid(items) {
  const grid = document.getElementById('blog-posts-container');
  const empty = document.getElementById('empty-posts-state');
  grid.innerHTML = '';
  if (!items.length) {
    grid.classList.add('hidden');
    empty.classList.remove('hidden');
    return;
  }
  grid.classList.remove('hidden');
  empty.classList.add('hidden');
  items.forEach((post) => {
    const cat = categoryById(post.categoryId);
    const img = safeUrl(post.image) || 'https://placehold.co/800x600/059669/ffffff?text=Review';
    const catColor = colorPalette[cat.color] || colorPalette.slate;
    grid.insertAdjacentHTML('beforeend', `<article class="group bg-white rounded-3xl overflow-hidden border border-slate-200 hover:border-emerald-500 transition duration-300 flex flex-col hover:shadow-lg"><div class="relative h-48 sm:h-52 overflow-hidden bg-slate-100 cursor-pointer" onclick="openPostDetail('${escapeHTML(post.id)}')"><img src="${img}" alt="${escapeHTML(post.title)}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" onerror="this.src='https://placehold.co/800x600/1e293b/ffffff?text=Image'"><div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div><span class="absolute top-4 left-4 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-white text-slate-800 shadow-sm"><i class="${escapeHTML(cat.icon)} ${catColor}"></i><span>${escapeHTML(cat.name)}</span></span></div><div class="p-5 flex-grow flex flex-col justify-between space-y-4"><div class="space-y-2"><span class="text-[10px] text-slate-400 font-bold block"><i class="fa-regular fa-clock"></i> ${formatDate(post.createdAt)}</span><h3 class="font-bold text-xs sm:text-sm text-slate-950 group-hover:text-emerald-600 cursor-pointer line-clamp-2 transition leading-snug" onclick="openPostDetail('${escapeHTML(post.id)}')">${escapeHTML(post.title)}</h3><p class="text-xs text-slate-500 line-clamp-2 leading-relaxed">${escapeHTML(post.content || '')}</p></div><div class="border-t border-slate-100 pt-4 flex justify-between items-center mt-auto"><div><span class="text-[10px] text-slate-400 block font-semibold">ราคาประมาณ</span><span class="text-xs sm:text-sm font-extrabold text-amber-600">${Number(post.productPrice || 0).toLocaleString('th-TH')} ฿</span></div><button onclick="openPostDetail('${escapeHTML(post.id)}')" class="px-3 py-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition">ดูรายละเอียด</button></div></div></article>`);
  });
}

export function filterBlogs() {
  const query = document.getElementById('blog-search-input').value.toLowerCase().trim();
  const filtered = state.posts
    .filter((post) => post.type === 'blog' && `${post.title || ''} ${post.content || ''}`.toLowerCase().includes(query))
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  document.getElementById('blogs-count-label').innerText = `กำลังแสดง ${filtered.length} บทความ`;
  renderBlogsGrid(filtered);
}

export function renderBlogsGrid(items) {
  const grid = document.getElementById('blog-knowledge-container');
  grid.innerHTML = '';
  items.forEach((post) => {
    const cat = categoryById(post.categoryId);
    const img = safeUrl(post.image) || 'https://placehold.co/800x600/0d9488/ffffff?text=Blog';
    grid.insertAdjacentHTML('beforeend', `<article class="group bg-white rounded-3xl overflow-hidden border border-slate-200 hover:border-teal-500 transition duration-300 flex flex-col hover:shadow-lg"><div class="relative h-48 sm:h-52 overflow-hidden bg-slate-100 cursor-pointer" onclick="openPostDetail('${escapeHTML(post.id)}')"><img src="${img}" alt="${escapeHTML(post.title)}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500"><div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div><span class="absolute top-4 left-4 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-white text-slate-800 shadow-sm"><i class="${escapeHTML(cat.icon)}"></i><span>${escapeHTML(cat.name)}</span></span></div><div class="p-5 flex-grow flex flex-col justify-between space-y-4"><div><span class="text-[10px] text-slate-400 font-bold block"><i class="fa-regular fa-clock"></i> ${formatDate(post.createdAt)}</span><h3 class="font-bold text-xs sm:text-sm text-slate-950 group-hover:text-teal-600 cursor-pointer line-clamp-2 transition leading-snug" onclick="openPostDetail('${escapeHTML(post.id)}')">${escapeHTML(post.title)}</h3><p class="text-xs text-slate-500 line-clamp-3 leading-relaxed mt-2">${escapeHTML(post.content || '')}</p></div><div class="border-t border-slate-100 pt-3 text-right"><button onclick="openPostDetail('${escapeHTML(post.id)}')" class="text-xs font-bold text-teal-600 hover:underline">อ่านสาระต่อ</button></div></div></article>`);
  });
}

export function openPostDetail(id) {
  const post = state.posts.find((item) => item.id === id);
  if (!post) return;
  const cat = categoryById(post.categoryId);
  document.getElementById('detail-image').src = safeUrl(post.image) || 'https://placehold.co/800x600/1e293b/ffffff?text=Image';
  document.getElementById('detail-category-tag').innerText = cat.name;
  document.getElementById('detail-title').innerText = post.title || '';
  document.getElementById('detail-date').innerText = formatDate(post.createdAt);
  document.getElementById('detail-content').innerText = post.content || '';
  const productCard = document.getElementById('detail-product-card');
  if (post.type === 'review' || !post.type) {
    productCard.classList.remove('hidden');
    document.getElementById('detail-product-name').innerText = post.productName || '';
    document.getElementById('detail-product-price').innerText = `${Number(post.productPrice || 0).toLocaleString('th-TH')} ฿`;
    const link = document.getElementById('detail-product-link');
    const href = safeUrl(post.productLink);
    link.href = href;
    link.classList.toggle('hidden', href === '#');
  } else {
    productCard.classList.add('hidden');
  }
  document.getElementById('post-detail-modal').classList.remove('hidden');
  document.body.classList.add('overflow-hidden');
}

export function closePostDetail() {
  document.getElementById('post-detail-modal').classList.add('hidden');
  document.body.classList.remove('overflow-hidden');
}

export function populateCategoryDropdown() {
  const dropdown = document.getElementById('post-category');
  dropdown.innerHTML = '';
  state.categories.forEach((cat) => {
    dropdown.insertAdjacentHTML('beforeend', `<option value="${escapeHTML(cat.id)}">${escapeHTML(cat.name)}</option>`);
  });
}

export function refreshPublicUI() {
  renderCategories();
  filterPosts();
  filterBlogs();
  populateCategoryDropdown();
  applyGlobalSettings();
}
