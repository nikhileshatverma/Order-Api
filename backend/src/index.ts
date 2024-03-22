// index.ts

import { Hono } from 'hono';
import { orderRouter } from './routes/orderRoute';
import { tradeRouter } from './routes/tradeRoute';
import { userRouter } from './routes/user';
import { cors } from 'hono/cors'; // Importing CORS middleware if needed

export const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

// Apply CORS middleware if needed
app.use('/api/*', cors());

// Mount routers
app.route('/api/v1/order', orderRouter);
app.route("api/v1/user", userRouter);
app.route('/api/v1/trades', tradeRouter);


export default app;
