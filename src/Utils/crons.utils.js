import { scheduleJob } from "node-schedule";
import { Coupon } from "../../DB/Models/index.js";
import { DateTime } from "luxon";


export const disableCouponsCron = () => {
  scheduleJob('0 59 23 * * *', async () => {
    const enabledCoupons = await Coupon.find({ isEnabled: true })

    if (enabledCoupons.length > 0) {
      for (const coupon of enabledCoupons) {
        if (DateTime.now() > DateTime.fromJSDate(coupon.till)) {
          coupon.isEnabled = false;
          await coupon.save();
        }
      }
    }
  })
}