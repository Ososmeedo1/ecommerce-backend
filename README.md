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
