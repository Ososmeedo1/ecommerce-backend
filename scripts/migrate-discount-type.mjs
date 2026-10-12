// One-off migration: products.appliedDiscount.type title-case -> UPPERCASE
// Required by the Option A discountType fix (Mongoose DiscountType enum
// aligned to the Joi contract: PERCENTAGE / FIXED).
//
// Old docs store "Percentage" / "Fixed". Reads don't fail, but any
// .save() on those docs re-validates and throws. Run BEFORE deploying
// the enum change (and against the PROD database for production).
//
// Usage:
//   node scripts/migrate-discount-type.mjs
// (.env must point at the database you intend to migrate;
//  for production, set MONGO_URI to the production URI first.)
import { config } from 'dotenv';
config();

const mongoose = (await import('mongoose')).default;

await mongoose.connect(process.env.MONGO_URI);
const c = mongoose.connection.db.collection('products');

const toUpper = await c.updateMany(
  { 'appliedDiscount.type': 'Percentage' },
  { $set: { 'appliedDiscount.type': 'PERCENTAGE' } }
);
const toFixed = await c.updateMany(
  { 'appliedDiscount.type': 'Fixed' },
  { $set: { 'appliedDiscount.type': 'FIXED' } }
);

console.log(JSON.stringify({
  db: mongoose.connection.db.databaseName,
  percentageMigrated: toUpper.modifiedCount,
  fixedMigrated: toFixed.modifiedCount,
}));

const leftover = await c.countDocuments({
  'appliedDiscount.type': { $in: ['Percentage', 'Fixed'] },
});
console.log(JSON.stringify({ leftoverOldValues: leftover }));

await mongoose.disconnect();
if (leftover !== 0) process.exit(1);
