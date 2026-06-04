import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-storage.js';
import { storage } from './firebase-config.js';

export async function uploadPostImage(file, postId) {
  if (!file) return '';
  if (!file.type.startsWith('image/')) throw new Error('File must be an image');
  if (file.size > 5 * 1024 * 1024) throw new Error('Image must be smaller than 5MB');
  const extension = file.name.split('.').pop() || 'jpg';
  const path = `posts/${postId}-${Date.now()}.${extension}`;
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file, { contentType: file.type });
  return getDownloadURL(fileRef);
}
