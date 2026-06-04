import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js';
import { auth, ADMIN_EMAIL } from './firebase-config.js';
import { escapeHTML, showToast } from './utils.js';

export function canRevealAdminFromUrl() {
  return new URLSearchParams(window.location.search).has('duy1');
}

function updateAdminButton(user) {
  const navAdmin = document.getElementById('nav-admin');
  const reveal = canRevealAdminFromUrl() || user?.email === ADMIN_EMAIL;
  navAdmin.classList.toggle('hidden', !reveal);
}

export function isAdminUser() {
  return Boolean(window.currentUser && window.currentUser.email === ADMIN_EMAIL);
}

export function initAuth() {
  window.currentUser = null;
  window.isAdminAuthenticated = false;

  window.openAuthLogin = () => document.getElementById('auth-login-modal').classList.remove('hidden');
  window.closeAuthLogin = () => document.getElementById('auth-login-modal').classList.add('hidden');

  window.loginWithEmail = async () => {
    const email = document.getElementById('auth-email-input').value.trim();
    const password = document.getElementById('auth-password-input').value;
    if (!email || !password) return showToast('Vui lòng nhập email và mật khẩu!', 'warning');
    if (email !== ADMIN_EMAIL) return showToast('Email này không có quyền Admin!', 'error');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.closeAuthLogin();
      showToast('Đăng nhập Admin thành công!');
      window.changeTab('admin');
    } catch (err) {
      console.error(err);
      showToast('Sai email/mật khẩu hoặc domain chưa được cấp quyền.', 'error');
    }
  };

  window.userLogout = async () => {
    await signOut(auth);
    showToast('Đã đăng xuất!');
    if (!document.getElementById('view-admin').classList.contains('hidden')) window.changeTab('home');
  };

  onAuthStateChanged(auth, (user) => {
    window.currentUser = user;
    window.isAdminAuthenticated = user?.email === ADMIN_EMAIL;
    updateAdminButton(user);

    const profile = document.getElementById('user-profile-section');
    if (user) {
      profile.innerHTML = `<div class="flex items-center space-x-2 bg-slate-100 pl-1 pr-3 py-1 rounded-xl border border-slate-200"><img src="https://www.gravatar.com/avatar/?d=mp" alt="Avatar" class="w-7 h-7 rounded-full border border-slate-300"><div class="hidden md:block text-left"><div class="text-[10px] font-bold text-slate-800 truncate max-w-[120px]">${escapeHTML(user.email)}</div><div class="text-[8px] text-slate-500 font-semibold">Admin</div></div><button onclick="userLogout()" class="text-slate-400 hover:text-rose-600 transition ml-2 px-1" title="Đăng xuất"><i class="fa-solid fa-right-from-bracket"></i></button></div>`;
    } else if (canRevealAdminFromUrl()) {
      profile.innerHTML = `<button onclick="openAuthLogin()" class="flex items-center space-x-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition border border-emerald-200"><i class="fa-solid fa-user-lock text-xs"></i><span class="hidden sm:inline">Admin Login</span></button>`;
    } else {
      profile.innerHTML = '';
    }
  });
}
