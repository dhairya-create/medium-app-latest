import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { decode, verify } from "hono/jwt";
import { createblogInput,updateblogInput } from "@demo_d/medium-common";
export const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: string;
  };
}>();

blogRouter.use("/*", async (c, next) => {
  const authHeader = c.req.header("authorization") || "";

  try {
    const user = await verify(authHeader, c.env.JWT_SECRET);

    if (user) {
      c.set("userId", user.id as string);
      await next();
    } else {
      c.status(403);
      return c.json({ message: "You are not logged in!" });
    }
  } catch (err) {
    return c.json({message:"You are not logged in"})
  }
});

blogRouter.post("/", async (c) => {
  const body = await c.req.json();
  const {success} = createblogInput.safeParse(body);
  if(!success){
    c.status(411);
    return c.json({message:"Inputs are not correct"})
  }
  const userId = c.get("userId");
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const blog = await prisma.blog.create({
    data: {
      title: body.title,
      content: body.content,
      authorId: Number(userId),
    },
  });
  return c.json({
    id: blog.id,
  });
});

blogRouter.put("/", async (c) => {
  const body = await c.req.json();
  const {success} = createblogInput.safeParse(body);
  if(!success){
    c.status(411);
    return c.json({message:"Inputs are not correct"})
  }
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const blog = await prisma.blog.update({
    where: {
      id: body.id,
    },
    data: {
      title: body.title,
      content: body.content,
    },
  });
  return c.json({
    id: blog.id,
  });
});

//TODO: Infinte Scroll implementation in future
blogRouter.get("/bulk", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const allBlogs = await prisma.blog.findMany();
  return c.json({ allBlogs });
});

blogRouter.get("/:id", async (c) => {
  const id = await c.req.param("id");
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const blog = await prisma.blog.findFirst({
      where: {
        id: Number(id),
      },
    });
    return c.json({
      blog,
    });
  } catch (err) {
    c.status(411);
    return c.json({
      message: "Error while fetching blog post",
    });
  }
});
