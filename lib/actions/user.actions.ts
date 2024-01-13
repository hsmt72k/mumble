'use server';

import { FilterQuery, SortOrder } from 'mongoose';
import { revalidatePath } from 'next/cache';

import Community from '../models/community.model';
import Post from '@/lib/models/post.model';
import User from '@/lib/models/user.model';

import { connectToDB } from '@/lib/mongoose';

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
  try {
    connectToDB();

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

    return await User.findOne({ id: userId }).populate({
      path: 'communities',
      model: Community,
    });
  } catch (error: any) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
}

export async function fetchUserPosts(userId: string) {
  try {
    connectToDB();

    // Find all posts authored by user with the given userId
    const posts = await User.findOne({ id: userId }).populate({
      path: 'posts',
      model: Post,
      populate: [
        {
          path: 'community',
          model: Community,
          // Select the "name" and "_id" fields
          // from the "Community" model
          select: 'name id image _id',
        },
        {
          path: 'children',
          model: Post,
          populate: {
            path: 'author',
            model: User,
            // Select the "name" and "_id" fields
            // from the "User" model
            select: 'name image id',
          },
        },
      ],
    });
    return posts;
  } catch (error: any) {
    console.error('Error fetching user posts:', error);
    throw new Error(`Filed to fetch user posts: ${error.message}`);
  }
}

// Almost similar to Post (search + pagination)
// and Community (search + pagination)
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

    // Calculate the number of users to skip
    // based on the page number and page size
    const skipAmount = (pageNumber - 1) * pageSize;

    // case-sensitive
    const regex = new RegExp(searchString, 'i');

    // Create an initial query object to filter users
    const query: FilterQuery<typeof User> = {
      // Exclude the current user from the results
      id: { $ne: userId },
    };

    // If the search string is not empty,
    // add the $or operator to match either username or name fields
    if (searchString.trim() !== '') {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ];
    }

    // Define the sort options for the fetched users
    // based on createdAt field and provided sort order
    const sortOptions = { createdAt: sortBy };

    const usersQuery = User.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize);

    // Count the total number of users that
    // match the search criteria (without pagination)
    const totalUsersCount = await User.countDocuments(query);

    const users = await usersQuery.exec();

    // Check if there are more users beyond the current page
    const isNext = totalUsersCount > skipAmount + users.length;

    return { users, isNext };
  } catch (error: any) {
    console.error('Error fetching users:', error);
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

    // Find and return the child posts (replies)
    // excluding the ones created by the same user
    const replies = await Post.find({
      _id: { $in: childPostIds },
      // Exclude posts authored by the same user
      author: { $ne: userId },
    }).populate({
      path: 'author',
      model: User,
      select: 'name image _id',
    });

    return replies;
  } catch (error: any) {
    console.error('Error fetching replies: ', error);
    throw new Error(`Failed to fetch activity: ${error.message}`);
  }
}
