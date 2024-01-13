'use server';

import { revalidatePath } from 'next/cache';

import { connectToDB } from '@/lib/mongoose';
import User from '@/lib/models/user.model';
import Post from '../models/post.model';
import { FilterQuery, SortOrder } from 'mongoose';

interface Params {
  userId: string;
  username: string;
  name: string;
  bio: string;
  image: string;
  path: string;
}

export async function updateUser({
  userId,
  username,
  name,
  bio,
  image,
  path,
}: Params): Promise<void> {
  connectToDB();

  try {
    await User.findOneAndUpdate(
      { id: userId },
      {
        username: username.toLowerCase(),
        name,
        bio,
        image,
        onboarded: true,
      },

      // upsert:
      // データベースのテーブルに
      // レコードが存在しない場合はそのレコードを新規挿入（INSERT）し、
      // レコードが既に存在する場合は既存のレコードを更新（UPDATE）する処理
      { upsert: true },
    );

    // プロファイルを更新している場合
    if (path === '/profile/edit') {
      // revalidatePath は Next.js の関数
      // パスを再検証する
      revalidatePath(path);
    }
  } catch (error: any) {
    throw new Error(`Failed to create/update user: ${error.message}`);
  }
}

export async function fetchUser(userId: string) {
  try {
    connectToDB();

    return await User.findOne({ id: userId });
    // .populate({
    //   path: 'communities',
    //   model: Community
    // })
  } catch (error: any) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
}

export async function fetchUserPosts(userId: string) {
  try {
    connectToDB();

    // Find all posts authored by user with the given userId
    // TODO: Populate community
    const posts = await User.findOne({ id: userId }).populate({
      path: 'posts',
      model: Post,
      populate: {
        path: 'children',
        model: Post,
        populate: {
          path: 'author',
          model: User,
          select: 'name image id',
        },
      },
    });

    return posts;
  } catch (error: any) {
    throw new Error(`Filed to fetch user posts: ${error.message}`);
  }
}

export async function fetchUsers({
  userId,
  searchString = '',
  pageNumber = 1,
  pageSize = 20,
  sortBy = 'desc',
}: {
  userId: string;
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: SortOrder;
}) {
  try {
    connectToDB();

    const skipAmount = (pageNumber - 1) * pageSize;

    // case-sensitive
    const regex = new RegExp(searchString, 'i');

    const query: FilterQuery<typeof User> = {
      id: { $ne: userId },
    };

    if (searchString.trim() !== '') {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ];
    }

    const sortOptions = { createdAt: sortBy };

    const usersQuery = User.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize);

    const totalUsersCount = await User.countDocuments(query);

    const users = await usersQuery.exec();

    const isNext = totalUsersCount > skipAmount + users.length;

    return { users, isNext };
  } catch (error: any) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }
}

export async function getActivity(userId: string) {
  try {
    connectToDB();

    // find all posts created by the user
    const userPosts = await Post.find({ author: userId });

    // Collect all the child post ids (replies) from the 'children' field
    const childPostIds = userPosts.reduce((acc, userPost) => {
      return acc.concat(userPost.children);
    }, []);

    const replies = await Post.find({
      _id: { $in: childPostIds },
      author: { $ne: userId },
    }).populate({
      path: 'author',
      model: User,
      select: 'name image _id',
    });

    return replies;
  } catch (error: any) {
    throw new Error(`Failed to fetch activity: ${error.message}`);
  }
}
