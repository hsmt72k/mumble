import * as z from 'zod';

export const PostValidation = z.object({
  post: z
    .string({ required_error: 'Post is required' })
    .min(3, { message: 'Minimum 3 characters.' }),
  accountId: z.string({ required_error: 'Account ID is required' }),
});

export const CommentValidation = z.object({
  post: z
    .string({ required_error: 'Post is required' })
    .min(3, { message: 'Minimum 3 characters.' }),
});
