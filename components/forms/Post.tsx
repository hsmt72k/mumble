'use client';

import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useOrganization } from '@clerk/nextjs';

import { useRouter, usePathname } from '@/hooks/navigation';
import { PostValidation } from '@/lib/validations/post';
import { createPost } from '@/lib/actions/post.actions';

interface Props {
  userId: string;
}

function Post({ userId }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { organization } = useOrganization();

  const form = useForm({
    resolver: zodResolver(PostValidation),
    defaultValues: {
      post: '',
      accountId: userId,
    },
  });

  const onSubmit = async (values: z.infer<typeof PostValidation>) => {
    await createPost({
      text: values.post,
      author: userId,
      communityId: organization ? organization.id : null,
      path: pathname,
    });

    router.push('/');
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mt-10 flex flex-col justify-start gap-10">
        <FormField
          control={form.control}
          name="post"
          render={({ field }) => (
            <FormItem className="flex flex-col w-full gap-3">
              <FormLabel className="text-base-semibold text-light-2">
                Content
              </FormLabel>
              <FormControl
                className="no-focus border border-dark-4 bg-dark-3 
                  text-light-1">
                <Textarea
                  rows={15}
                  className="account-form_input no-focus"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="bg-primary-500 text-light-1">
          Post this post
        </Button>
      </form>
    </Form>
  );
}

export default Post;
