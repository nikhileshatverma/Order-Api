import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { sign } from 'hono/jwt';

export const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

// Signup endpoint
// This endpoint allows users to sign up by providing their email, password, and name.
// Upon successful signup, it generates a JWT token for authentication.
userRouter.post('/signup', async (c) => {
  // Parse the request body to get user details
  const body = await c.req.json();
  
  // Connect to the database
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: c.env.DATABASE_URL,
      },
    },
  }).$extends(withAccelerate());

  try {
    // Create a new user in the database
    const user = await prisma.user.create({
      data: {
        email : body.email,
        password : body.password,
        name : body.name
      },
    });
    
    // Generate JWT token for the new user
    const jwtToken = await sign({ id: user.id }, c.env.JWT_SECRET);
    
    // Return the JWT token as the response
    return c.json({ token: jwtToken });
  } catch (e) {
    // Handle server errors
    c.status(500);
    console.error('Error:', e);
    return c.json({
      message: 'Internal Server Error',
    });
  }
});

// Signin endpoint
// This endpoint allows users to sign in using their email and password.
// Upon successful signin, it generates a JWT token for authentication.
userRouter.post('/signin', async (c) => {
  // Parse the request body to get user credentials
  const body = await c.req.json();
  const { email, password } = body;

  // Connect to the database
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: c.env.DATABASE_URL,
      },
    },
  }).$extends(withAccelerate());

  try {
    // Find the user in the database based on provided email and password
    const user = await prisma.user.findFirst({
      where: {
        email,
        password,
      },
    });

    // If user is not found, return 401 Unauthorized
    if (!user) {
      c.status(401);
      return c.json({ message: 'Invalid credentials' });
    }

    // Generate JWT token for the signed-in user
    const jwtToken = await sign({ id: user.id }, c.env.JWT_SECRET);

    // Return the JWT token as the response
    return c.json({ token: jwtToken });
  } catch (e) {
    // Handle server errors
    c.status(500);
    console.error('Error:', e);
    return c.json({
      message: 'Internal Server Error',
    });
  }
});
