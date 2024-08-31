import z from "zod";

export const signupInput = z.object({
  username: z.string(),
  password: z.string().min(6),
  name: z.string().optional(),
});

export const signinInput = z.object({
  username: z.string(),
  password: z.string().min(6),
});

export const createblogInput = z.object({
  title: z.string(),
  content: z.string(),
});

export const updateblogInput = z.object({
  title: z.string(),
  content: z.string(),
  id: z.number(),
});

export type SignUpInput = z.infer<typeof signupInput>;
export type SignInInput = z.infer<typeof signinInput>;
export type CreateBlogInput = z.infer<typeof createblogInput>;
export type UpdateBlogInput = z.infer<typeof updateblogInput>;
