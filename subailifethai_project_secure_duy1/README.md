# subailifethai.com Firebase Project

## Cách chạy
1. Upload toàn bộ thư mục này lên GitHub/Vercel.
2. File chính là `index.html`.
3. Trang thường sẽ không hiện nút Admin.
4. Muốn hiện Admin, truy cập: `https://tenmiencuaban.com/?duy1`
5. Đăng nhập bằng email admin: `ducduy271295@gmail.com`.

## Firebase cần bật
- Authentication → Email/Password
- Firestore Database
- Storage
- Authorized domains: thêm domain Vercel/domain thật

## Firestore Rules
```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null
        && request.auth.token.email == "ducduy271295@gmail.com";
    }

    match /posts/{docId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }

    match /categories/{docId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }

    match /settings/{docId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }
  }
}
```

## Storage Rules
```js
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    function isAdmin() {
      return request.auth != null
        && request.auth.token.email == "ducduy271295@gmail.com";
    }

    match /posts/{fileName} {
      allow read: if true;
      allow write: if isAdmin()
        && request.resource.size < 5 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }
  }
}
```
