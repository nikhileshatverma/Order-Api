import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { verify } from 'hono/jwt';

export const orderRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: string;
  };
}>();

// Middleware to handle authentication and authorization
// This middleware fetches the user ID from the request header and sets it as 'userId' available for further requests.
orderRouter.use(async (c, next) => {
    const authHeader = c.req.header('authorization') || '';
    try {
      const user = await verify(authHeader, c.env.JWT_SECRET);
      console.log("user middleware: :" + user);
      if (user) {
        c.set('userId', user.id);
        console.log("user id in middleware: :" + user.id);
        await next();
      } else {
        c.status(401);
        return c.json({ message: 'Unauthorized' });
      }
    } catch (e) {
      c.status(401);
      console.error('Error:', e);
      return c.json({ message: 'Unauthorized' });
    }
  });
  
// Place order endpoint
// This endpoint allows users to place a new order.
orderRouter.post('/', async (c) => {
    const body = await c.req.json();
    const authorId = c.get("userId");
  
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
  
    try {
      // Create the order in the database
      const order = await prisma.order.create({
        data: {
          quantity: body.quantity,
          price: body.price,
          side: body.side,
          userId: authorId
        },
      });

      const i = order.id
      
      // Create the corresponding trade entry and associate it with the order
      const trade = await prisma.trade.create({
        data: {
          order: {
            connect: {
                id: order.id
            }
           },
          executionTimestamp: new Date(),
          price: body.price,
          quantity: body.quantity,
          bidOrderId: String(body.price), // Convert price to string
          askOrderId: String(body.price), // Convert price to string
        }
      });

      console.log("user trade: :" + trade);

  
      // Return the order ID and trade ID as the response
      return c.json({
        orderId: order.id,
        tradeId: trade.id
      });
    } catch (e) {
      // Handle server errors
      c.status(500);
      console.error('Error:', e);
      return c.json({
        message: 'Internal Server Error',
      });
    }
});


  
  
  // Modify order endpoint
  // This endpoint allows users to modify an existing order.
orderRouter.put('/:id', async (c) => {
    // Get the order ID from the request parameter
    const id  = c.req.param("id");
    console.log("id :" + id);
  
    // Parse the request body to get updated order details
    const body = await c.req.json();
    console.log("body :", body);
  
    // Retrieve the user ID from the request context
    const userId = c.get('userId');
    console.log("set userid :" + userId);
  
    // Connect to the database
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
  
    try {
      // Fetch the order to ensure it belongs to the authenticated user
      const order = await prisma.order.findUnique({
        where: {
          id: id,
        },
      });
  
      // Check if the order exists and belongs to the authenticated user
      if (!order || order.userId !== userId) {
        console.log("userId: " + userId);
        c.status(404);
        return c.json({
          message: 'Order not found or unauthorized to modify',
        });
      }
  
      // Update the order in the database
      const updatedOrder = await prisma.order.update({
        where: {
          id: id,
        },
        data: {
          quantity: body.updatedQuantity,
          price: body.updatedPrice,
        },
      });
  
      // Return the updated order as the response
      return c.json({
        success: true,
        updatedOrder,
      });
    } catch (e) {
      // Handle server errors
      c.status(500);
      console.error('Error:', e);
      return c.json({
        message: 'Internal Server Error',
      });
    }
});
  
  // Cancel order endpoint
  // This endpoint allows users to cancel an existing order.
  orderRouter.delete('/:orderId', async (c) => {
    const orderId = c.req.param("orderId");

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
        // Delete related trade records first
        await prisma.trade.deleteMany({
            where: {
                orderId: orderId,
            },
        });

        // Then delete the order
        await prisma.order.delete({
            where: {
                id: orderId,
            },
        });

        return c.json({
            success: true,
        });
    } catch (e) {
        c.status(500);
        console.error('Error:', e);
        return c.json({
            message: 'Internal Server Error',
        });
    }
});

  
  // Fetch order endpoint
  // This endpoint allows users to fetch details of a specific order by its ID.
orderRouter.get('/:orderId', async (c) => {
    // Get the order ID from the request parameter
    const orderId = c.req.param("orderId");
  
    // Connect to the database
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
  
    try {
      // Fetch the order details from the database
      const order = await prisma.order.findUnique({
        where: {
          id: orderId,
        },
      });
      // If order is not found, return 404
      if (!order) {
        c.status(404);
        return c.json({
          message: 'Order not found',
        });
      }
      // Return the order details as the response
      return c.json({
        order,
      });
    } catch (e) {
      // Handle server errors
      c.status(500);
      console.error('Error:', e);
      return c.json({
        message: 'Internal Server Error',
      });
    }
});
  
  // Fetch all orders endpoint
  // This endpoint allows users to fetch details of all orders.
  orderRouter.get('/', async (c) => {
    // Connect to the database
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
  
    try {
      // Fetch all orders from the database
      const orders = await prisma.order.findMany();
      // Return the list of orders as the response
      return c.json({
        orders,
      });
    } catch (e) {
      // Handle server errors
      c.status(500);
      console.error('Error:', e);
      return c.json({
        message: 'Internal Server Error',
      });
    }
  });

  // // Fetch all trades endpoint
  // orderRouter.get('/trades', async (c) => {
  //   const prisma = new PrismaClient({
  //     datasourceUrl: c.env.DATABASE_URL,
  //   }).$extends(withAccelerate());
  
  //   try {
  //     const trades = await prisma.trade.findMany();
  //     return c.json({
  //       trades,
  //     });
  //   } catch (e) {
  //     c.status(500);
  //     console.error('Error:', e);
  //     return c.json({
  //       message: 'Internal Server Error',
  //     });
  //   }
  // });
  
  
  
  
