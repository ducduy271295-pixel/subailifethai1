export function renderBlogCategories() {
  const container = document.getElementById('blog-categories-list-container');
  if (!container) return;

  if (!state.selectedBlogCategoryFilter) {
    state.selectedBlogCategoryFilter = 'all';
  }

  container.innerHTML = '';

  const currentFilter = state.selectedBlogCategoryFilter || 'all';
  const totalBlogs = state.posts.filter((post) => post.type === 'blog').length;
  const allActive = currentFilter === 'all';

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

    const active = currentFilter === cat.id;
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
