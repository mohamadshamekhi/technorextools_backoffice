# Auth API

### POST /auth/otp/request

**Request OTP**

Body: `otpRequestSchema` — mobile (09xxxxxxxxx / +989…), optional referralCode.
Response: `{ expiresIn, resendAfter, devCode? }`. `devCode` only when OTP_DEV_ECHO=true.

- auth: none

```json
{
  "mobile": "{{mobile}}",
  "referralCode": null
}
```

### POST /auth/otp/verify

**Verify OTP**

Body: `otpVerifySchema`. Response: `{ accessToken, expiresIn, refreshToken, isNewUser, user }`.
Creates the user (role=customer) on first login. `cartToken` اختیاری: سبد مهمان را در سبد کاربر ادغام می‌کند.

- auth: none

```json
{
  "mobile": "{{mobile}}",
  "code": "{{otpCode}}",
  "cartToken": "{{cartToken}}"
}
```

### POST /auth/refresh

**Refresh Token**

Rotates the refresh token: the presented one is revoked, a fresh pair returned.

- auth: none

```json
{
  "refreshToken": "{{refreshToken}}"
}
```

### GET /auth/me

**Get Current User**

Bearer. Response: `{ id, fullName, mobile, email, role, referralCode }`.

- auth: (inherits collection default: Bearer {{accessToken}})

### POST /auth/logout

**Logout**

Bearer, no body. Revokes every refresh token for the user. 204.

- auth: (inherits collection default: Bearer {{accessToken}})

### PATCH /auth/me

**Update Profile**

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "fullName": "کاربر نمونه",
  "email": "user@example.com"
}
```
