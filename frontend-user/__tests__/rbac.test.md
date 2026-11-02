# 🧪 RBAC Testing Guide

## Manual Testing Checklist

### ✅ Test 1: KONSUMEN Login (Should Success)

**Steps:**

1. Buka `http://localhost:3000/login`
2. Login dengan user role KONSUMEN
3. Verify: Login berhasil
4. Verify: Redirect ke homepage `/`
5. Verify: Bisa akses `/profil`, `/keranjang`, `/pesanan`
6. Verify: JWT token tersimpan di cookie
7. Verify: User data tersimpan di localStorage

**Expected Result:**

```
✅ Login successful
✅ Can access all pages
✅ No error messages
✅ Token stored in cookie
```

---

### ❌ Test 2: PENJUAL Login (Should Fail at Backend)

**Steps:**

1. Buka `http://localhost:3000/login`
2. Login dengan user role PENJUAL
3. Verify: Login gagal
4. Verify: Error message muncul

**Expected Result:**

```
❌ Login failed
❌ Error: "Email ini terdaftar di aplikasi Agro lain. Silakan gunakan email lain untuk login di aplikasi ini."
❌ No token generated
❌ Stay at login page
```

---

### ❌ Test 3: KURIR Login (Should Fail at Backend)

**Steps:**

1. Buka `http://localhost:3000/login`
2. Login dengan user role KURIR
3. Verify: Login gagal
4. Verify: Error message muncul

**Expected Result:**

```
❌ Login failed
❌ Error: "Email ini terdaftar di aplikasi Agro lain..."
❌ No token generated
```

---

### ❌ Test 4: Manipulate JWT Token (Should Fail at Middleware)

**Steps:**

1. Login sebagai KONSUMEN (berhasil)
2. Buka DevTools > Application > Cookies
3. Copy JWT token dari cookie `accessToken`
4. Decode JWT di https://jwt.io
5. Ubah `peran` dari `KONSUMEN` ke `PENJUAL`
6. Encode kembali (note: signature akan invalid)
7. Replace cookie dengan JWT yang sudah diubah
8. Refresh page atau navigate ke `/profil`

**Expected Result:**

```
❌ Middleware detects invalid signature
❌ Cookie deleted
❌ Redirect to /login?error=unauthorized_role
❌ Error banner shown
```

---

### ❌ Test 5: Inject Role in localStorage (Should Fail at AuthGuard)

**Steps:**

1. Logout dari aplikasi
2. Buka DevTools > Console
3. Inject fake user data:
   ```javascript
   localStorage.setItem(
     "auth-storage",
     JSON.stringify({
       state: {
         user: {
           id: "fake-id",
           email: "fake@test.com",
           name: "Fake User",
           role: "PENJUAL",
         },
         isAuthenticated: true,
       },
     }),
   );
   ```
4. Refresh page
5. Try to navigate to `/profil`

**Expected Result:**

```
❌ AuthGuard detects role mismatch
❌ Modal shown: "Akses Ditolak"
❌ All storage cleared after 3s
❌ Redirect to /login?error=unauthorized_role
```

---

### ❌ Test 6: Backend Returns 403 (Should Fail at Interceptor)

**Steps:**

1. Login sebagai KONSUMEN
2. Manually change role in Zustand store (via DevTools):
   ```javascript
   useAuthStore.getState().setAuth({
     id: "test",
     email: "test@test.com",
     name: "Test",
     role: "ADMIN_CS",
   });
   ```
3. Make API call (e.g., fetch profile)
4. Backend should return 403 (role mismatch)

**Expected Result:**

```
❌ API returns 403 Forbidden
❌ Interceptor catches error
❌ All storage cleared
❌ Redirect to /login?error=unauthorized_role
```

---

### ✅ Test 7: Public Routes (Should Work Without Auth)

**Steps:**

1. Logout atau buka incognito
2. Visit public routes:
   - `http://localhost:3000/`
   - `http://localhost:3000/katalog`
   - `http://localhost:3000/produk/[id]`
   - `http://localhost:3000/toko/[id]`
   - `http://localhost:3000/chat/guest`

**Expected Result:**

```
✅ All public routes accessible
✅ No redirect to login
✅ No error messages
```

---

### ❌ Test 8: Protected Routes Without Auth (Should Redirect)

**Steps:**

1. Logout atau buka incognito
2. Try to visit protected routes:
   - `http://localhost:3000/profil`
   - `http://localhost:3000/keranjang`
   - `http://localhost:3000/pesanan`
   - `http://localhost:3000/checkout`

**Expected Result:**

```
❌ Middleware blocks access
❌ Redirect to /login
❌ URL param: ?redirect=/profil (optional)
```

---

### ✅ Test 9: Session Persistence (Should Work)

**Steps:**

1. Login sebagai KONSUMEN
2. Close browser tab
3. Open new tab
4. Visit `http://localhost:3000/profil`

**Expected Result:**

```
✅ Still authenticated
✅ Can access protected routes
✅ No need to login again
✅ Token still in cookie
```

---

### ❌ Test 10: Token Expiration (Should Logout)

**Steps:**

1. Login sebagai KONSUMEN
2. Wait for JWT to expire (default: 7 days)
3. Or manually set expired token
4. Try to make API call

**Expected Result:**

```
❌ Backend returns 401 Unauthorized
❌ Interceptor catches error
❌ All storage cleared
❌ Redirect to /login?error=session_expired
```

---

## Automated Testing (Optional)

### Playwright E2E Test

```typescript
// __tests__/rbac.spec.ts
import { test, expect } from "@playwright/test";

test.describe("RBAC - Role Based Access Control", () => {
  test("KONSUMEN can login and access protected routes", async ({ page }) => {
    await page.goto("http://localhost:3000/login");

    // Login
    await page.fill('input[type="email"]', "konsumen@test.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');

    // Should redirect to homepage
    await expect(page).toHaveURL("http://localhost:3000/");

    // Should access protected route
    await page.goto("http://localhost:3000/profil");
    await expect(page).toHaveURL("http://localhost:3000/profil");
  });

  test("PENJUAL cannot login", async ({ page }) => {
    await page.goto("http://localhost:3000/login");

    // Try login
    await page.fill('input[type="email"]', "penjual@test.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');

    // Should show error
    await expect(page.locator(".text-red-600")).toBeVisible();
    await expect(page).toHaveURL("http://localhost:3000/login");
  });

  test("Unauthenticated user redirected from protected route", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000/profil");

    // Should redirect to login
    await expect(page).toHaveURL("http://localhost:3000/login");
  });

  test("Public routes accessible without auth", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await expect(page).toHaveURL("http://localhost:3000/");

    await page.goto("http://localhost:3000/katalog");
    await expect(page).toHaveURL("http://localhost:3000/katalog");
  });

  test("AuthGuard shows modal for unauthorized role", async ({
    page,
    context,
  }) => {
    // Inject fake auth with wrong role
    await context.addCookies([
      {
        name: "accessToken",
        value: "fake.jwt.token",
        domain: "localhost",
        path: "/",
      },
    ]);

    await page.goto("http://localhost:3000/profil");

    // Should show modal
    await expect(page.locator("text=Akses Ditolak")).toBeVisible();

    // Should redirect after 3s
    await page.waitForTimeout(3500);
    await expect(page).toHaveURL(/.*login.*error=unauthorized_role/);
  });
});
```

---

## Test Data Setup

### Create Test Users in Database

```sql
-- KONSUMEN user (allowed)
INSERT INTO core.pengguna (id, email, "kataSandi", nama, peran, "emailTerverifikasiPada")
VALUES (
  'test-konsumen-id',
  'konsumen@test.com',
  '$2b$10$hashed_password', -- hash of 'password123'
  'Test Konsumen',
  'KONSUMEN',
  NOW()
);

-- PENJUAL user (blocked)
INSERT INTO core.pengguna (id, email, "kataSandi", nama, peran, "emailTerverifikasiPada")
VALUES (
  'test-penjual-id',
  'penjual@test.com',
  '$2b$10$hashed_password',
  'Test Penjual',
  'PENJUAL',
  NOW()
);

-- KURIR user (blocked)
INSERT INTO core.pengguna (id, email, "kataSandi", nama, peran, "emailTerverifikasiPada")
VALUES (
  'test-kurir-id',
  'kurir@test.com',
  '$2b$10$hashed_password',
  'Test Kurir',
  'KURIR',
  NOW()
);
```

---

## Browser DevTools Testing

### Check Middleware Logs

Open browser console and look for:

```
🚫 Middleware blocked access: Role PENJUAL attempted to access /profil
```

### Check AuthGuard Logs

```
Unauthorized role accessing user frontend: KURIR
```

### Check Cookie

```javascript
// In browser console
document.cookie;
// Should see: accessToken=eyJhbGc...
```

### Check localStorage

```javascript
// In browser console
localStorage.getItem("auth-storage");
// Should see user data with role
```

---

## Security Audit Checklist

- [ ] Backend validates role on login
- [ ] JWT contains role in payload
- [ ] Middleware runs on all protected routes
- [ ] Middleware decodes JWT correctly
- [ ] Middleware deletes cookie on unauthorized
- [ ] AuthGuard checks role on mount
- [ ] AuthGuard checks role on route change
- [ ] AuthGuard clears all storage
- [ ] AuthGuard shows modal
- [ ] API interceptor handles 401
- [ ] API interceptor handles 403
- [ ] Login page validates role
- [ ] Login page shows error banner
- [ ] Public routes work without auth
- [ ] Protected routes require auth
- [ ] No console errors
- [ ] No infinite redirect loops

---

## Performance Testing

### Middleware Performance

```bash
# Test middleware response time
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000/profil
```

**Expected:** < 50ms overhead

### AuthGuard Performance

Check React DevTools Profiler:

- AuthGuard render time: < 5ms
- No unnecessary re-renders

---

## Troubleshooting

### Issue: Redirect Loop

**Symptoms:**

- Browser keeps redirecting between `/login` and `/profil`
- Console shows multiple redirects

**Solution:**

1. Check `/login` is in middleware publicRoutes
2. Check AuthGuard doesn't redirect on login page
3. Clear all cookies and localStorage

### Issue: Modal Not Showing

**Symptoms:**

- User gets redirected but no modal

**Solution:**

1. Check `showUnauthorizedModal` state
2. Check Tailwind classes are loaded
3. Check z-index conflicts

### Issue: KONSUMEN Can't Login

**Symptoms:**

- Valid KONSUMEN user gets rejected

**Solution:**

1. Check database: role is exactly 'KONSUMEN' (case-sensitive)
2. Check backend allowedRoles includes 'KONSUMEN'
3. Check JWT payload contains correct role
4. Check email is verified

---

## Test Results Template

```
Date: ___________
Tester: ___________

Test 1: KONSUMEN Login          [ ] Pass  [ ] Fail
Test 2: PENJUAL Login           [ ] Pass  [ ] Fail
Test 3: KURIR Login             [ ] Pass  [ ] Fail
Test 4: JWT Manipulation        [ ] Pass  [ ] Fail
Test 5: localStorage Injection  [ ] Pass  [ ] Fail
Test 6: Backend 403             [ ] Pass  [ ] Fail
Test 7: Public Routes           [ ] Pass  [ ] Fail
Test 8: Protected Routes        [ ] Pass  [ ] Fail
Test 9: Session Persistence     [ ] Pass  [ ] Fail
Test 10: Token Expiration       [ ] Pass  [ ] Fail

Notes:
_________________________________
_________________________________
_________________________________
```

---

**Last Updated:** 2026-05-23  
**Version:** 1.0.0
