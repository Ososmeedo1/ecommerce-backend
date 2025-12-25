import { globalResponse } from './src/Middlewares/index.js';
import cors from 'cors'
import * as routers from './src/Modules/index.js'

import { json } from 'express';

export const routerHandler = (app) => {
  app.use(cors())
  

  app.use(json());

  app.use('/categories', routers.categoryRouter)
  app.use('/subcategories', routers.subCategoryRouter)
  app.use('/products', routers.productRouter)
  app.use('/brands', routers.brandRouter)
  app.use('/users', routers.userRouter)
  app.use('/addresses', routers.addressRouter);
  app.use('/users', routers.userRouter)
  app.use('/carts', routers.cartRouter);
  app.use('/coupons', routers.couponRouter);
  app.use('/orders', routers.orderRouter);

  app.use(globalResponse);
}