# ecommerce-backend

## One-off scripts

### `scripts/migrate-discount-type.mjs`

Migrates legacy title-case `products.appliedDiscount.type` values
(`"Percentage"` / `"Fixed"`) to the uppercase values required by the
`DiscountType` enum (`"PERCENTAGE"` / `"FIXED"`).

Run it **before** deploying the Option A discountType fix, against each
database that holds products:

```bash
# local / dev database (.env)
node scripts/migrate-discount-type.mjs

# production database (point MONGO_URI at prod first)
MONGO_URI="mongodb+srv://<user>:<pass>@<cluster>/<prod-db>" node scripts/migrate-discount-type.mjs
```

The script prints `{ percentageMigrated, fixedMigrated, leftoverOldValues }`.
`leftoverOldValues` must be `0` (the script exits non-zero otherwise).

## Known open items

- Checkout is cash-only. PaymentMethods supports only cash; no payment gateway integration exists or is planned.
- [BACKEND OWNER] Product badges cannot be updated via PUT /products/update/:id — the controller reads req.body.badges but Joi rejects the field before it reaches the controller. Fix requires adding badges to the update schema with valid(...Object.values(Badges)). No frontend UI currently consumes this.

## Password reset and password change

### Flow

1. `PATCH /users/forgot-password` — body `{ "email": "user@example.com" }`.
   Generates a 6-character OTP (unambiguous uppercase letters + digits), stores
   only its bcrypt hash, stores a SHA-256 hash of a random 256-bit
   `otpToken`, and emails the OTP. Response:
   `{ "message": "...", "data": "<otpToken>" }`.
2. `POST /users/verify-otp` — body
   `{ "otp": "ABC123", "otpToken": "<otpToken>" }`.
   Validates the OTP and expiry, consumes the OTP, and returns a one-time
   `resetToken`: `{ "message": "OTP verified successfully", "data": "<resetToken>" }`.
   The legacy field name `token` is also accepted in place of `otpToken`.
3. `POST /users/reset-password` — body
   `{ "resetToken": "<resetToken>", "newPassword": "NewPass123#" }`.
   Consumes the reset token, hashes the new password with bcryptjs, and
   invalidates every JWT issued before the change.

Both OTP and reset tokens expire after 10 minutes. They are single-use:
verifying an OTP removes it, and resetting a password removes the reset
token. Raw OTPs and reset tokens are never stored in MongoDB and never
logged.

### Change password while logged in

`PUT /users/change-password` (auth header required) — body
`{ "currentPassword": "OldPass123#", "newPassword": "NewPass123#" }`.

The current password is verified before the new one is saved. A successful
change invalidates all existing JWTs, so the caller must log in again.

`PUT /users/update` still supports a `password` field for backward
compatibility, but now requires `currentPassword` alongside it.

### Email configuration

Copy `.env.example` to `.env` and fill in the values. The minimum for Gmail:

```dotenv
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-google-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Masar
```

For another SMTP provider, set `EMAIL_HOST`, `EMAIL_PORT`, and
`EMAIL_SECURE` instead of `EMAIL_SERVICE` (`true` for port 465, `false` for
587/25). `EMAIL_USER` / `EMAIL_PASS` are still required.

The older reference names `USER_SEND_EMAIL_SERVICE` and
`PASSWORD_SEND_EMAIL_SERVICE` are accepted as fallbacks when `EMAIL_USER` /
`EMAIL_PASS` are unset.

### Reset email contents

The reset email places one clearly-labelled OTP near the top of both the HTML
and plain-text alternatives, and uses a code-first verification subject. It
also includes a prominent **Copy code manually** visual control that tells the
recipient to select the visible OTP and use their device's Copy command.

Email clients block JavaScript and clipboard access, so this visual control is
not clickable and does not claim to copy anything itself. Gmail may show its
own native "Copy code" card when it recognizes the message, but that behavior
is controlled by Gmail and cannot be forced or guaranteed by email markup.

Because the email contains no server link, no public app URL configuration is
needed.

If SMTP is not configured or delivery fails, `forgot-password` returns a
502 error and removes the generated OTP; it never reports a false success.

