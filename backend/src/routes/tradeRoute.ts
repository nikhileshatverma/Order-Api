import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

export const tradeRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
  };
}>(); // Create a new router for trade-related endpoints

// Endpoint to fetch all trades
tradeRouter.get('/', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const trades = await prisma.trade.findMany(); // Fetch all trades from the database
    return c.json({
      trades,
    });
  } catch (e) {
    c.status(500);
    console.error('Error:', e);
    return c.json({
      message: 'Internal Server Error',
    });
  }
});
