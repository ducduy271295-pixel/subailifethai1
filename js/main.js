import { initAuth, isAdminUser } from './auth.js';
import { getDBData, saveDBData } from './firestore.js';
import { state } from './state.js';
import { initConfirmModal, showToast } from './utils.js';
import {
refreshPublicUI,
filterPosts,
filterBlogs,
renderBlogCategories,
openPostDetail,
closePostDetail
} from './render.js';
import { initAdminGlobals, renderAdminUI, toggleAdminSubTab } from './admin.js';
import { initLeadGlobals } from './leads.js';

async function seedDefaultsIfNeeded() {
if (!state.categories.length) {
state.categories = [
{
id: 'cat-1',
name: 'ยาหม่อง & น้ำมันนวด',
icon: 'fa-solid fa-prescription-bottle-medical',
color: 'emerald',
updatedAt: new Date().toISOString()
},
{
id: 'cat-2',
name: 'สมุนไพรแห้ง & ชาชง',
icon: 'fa-solid fa-leaf',
color: 'amber',
updatedAt: new Date().toISOString()
},
{
id: 'cat-3',
name: 'อาหารเสริมธรรมชาติ',
icon: 'fa-solid fa-capsules',
color: 'sky',
updatedAt: new Date().toISOString()
}
];

```
for (const cat of state.categories) {
  await saveDBData('categories', cat);
}
```

}

if (!state.globalSettings?.id) {
state.globalSettings = {
id: 'site-config',
about: 'เว็บไซต์รีวิวและรวบรวมสาระสุขภาพสมุนไพรธรรมชาติ เนื้อหาใช้เพื่อการศึกษาและประกอบการตัดสินใจเท่านั้น',
email: '[ducduy271295@gmail.com](mailto:ducduy271295@gmail.com)',
phone: '',
fb: '',
tw: '',
yt: '',
updatedAt: new Date().toISOString()
};

```
await saveDBData('settings', state.globalSettings);
```

}
}

async function initApp() {
try {
state.categories = await getDBData('categories');
state.posts = await getDBData('posts');

```
const settings = await getDBData('settings');
state.globalSettings = settings.find((item) => item.id === 'site-config') || {};

await seedDefaultsIfNeeded();
refreshPublicUI();
```

} catch (err) {
console.error(err);
showToast('Lỗi kết nối Firebase. Hãy kiểm tra Rules/Config/Domain.', 'error');
}
}

window.changeTab = (tab, subTab = 'posts') => {
if (tab === 'admin') {
if (!window.currentUser) {
window.openAuthLogin();
return;
}

```
if (!isAdminUser()) {
  showToast('Tài khoản không có quyền Admin!', 'error');
  return;
}
```

}

['home', 'blog', 'admin'].forEach((name) => {
document.getElementById(`view-${name}`).classList.toggle('hidden', name !== tab);

```
const nav = document.getElementById(`nav-${name}`);
if (nav) nav.classList.toggle('nav-active', name === tab);
```

});

if (tab === 'home') {
refreshPublicUI();
}

if (tab === 'blog') {
renderBlogCategories();
filterBlogs();
}

if (tab === 'admin') {
toggleAdminSubTab(subTab);
renderAdminUI();
}

window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.selectCategory = (catId) => {
state.selectedCategoryFilter = catId;
refreshPublicUI();
};

window.selectBlogCategory = (catId) => {
state.selectedBlogCategoryFilter = catId;
renderBlogCategories();
filterBlogs();
};

window.clearFilters = () => {
const searchInput = document.getElementById('search-input');

if (searchInput) {
searchInput.value = '';
}

state.selectedCategoryFilter = 'all';
refreshPublicUI();
};

window.filterPosts = filterPosts;
window.filterBlogs = filterBlogs;
window.openPostDetail = openPostDetail;
window.closePostDetail = closePostDetail;

function clearBrowserAutofillSearchFields() {
const ids = ['search-input', 'blog-search-input'];

ids.forEach((id) => {
const el = document.getElementById(id);
if (!el) return;

```
if (el.value && el.value.includes('@')) {
  el.value = '';
}

el.setAttribute('autocomplete', 'new-password');

/*
  Chặn Chrome tự điền email vào ô search.
  Sau khi người dùng bấm vào ô, bỏ readonly để vẫn gõ tìm kiếm bình thường.
*/
el.setAttribute('readonly', 'readonly');

el.addEventListener(
  'focus',
  () => {
    el.removeAttribute('readonly');
  },
  { once: true }
);
```

});
}

window.addEventListener('DOMContentLoaded', clearBrowserAutofillSearchFields);
window.addEventListener('pageshow', clearBrowserAutofillSearchFields);

setTimeout(clearBrowserAutofillSearchFields, 200);
setTimeout(clearBrowserAutofillSearchFields, 800);
setTimeout(clearBrowserAutofillSearchFields, 1800);

initConfirmModal();
initAdminGlobals();
initLeadGlobals();
initAuth();
initApp();
