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

## Chức năng mới
- Form thu thập email khách tự nguyện đăng ký ở trang chủ.
- Dữ liệu khách lưu vào collection `leads`.
- Admin có tab `Khách Hàng` để xem, xóa và export CSV.

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

    match /leads/{docId} {
      allow create: if true;
      allow read, update, delete: if isAdmin();
    }

    match /clicks/{docId} {
      allow create: if true;
      allow read, update, delete: if isAdmin();
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

## Cập nhật Lead Form
- Form đăng ký email khách được mở bằng nút “สมัครรับข้อมูล”.
- Nút đăng ký hiển thị ở hero trang Review và hero trang Blog để khách dễ thấy hơn.
- Dữ liệu vẫn lưu vào Firestore collection `leads`.


## Tracking Click
- Link redirect mẫu: `/go/carthisin/`
- Click sẽ lưu vào Firestore collection `clicks`.
- Admin → Thống Kê Click để xem tổng click, click hôm nay, top sản phẩm và export CSV.
