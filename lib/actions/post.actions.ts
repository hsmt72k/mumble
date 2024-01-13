'use server';

import { revalidatePath } from 'next/cache';

import { connectToDB } from '@/lib/mongoose';
import Post from '@/lib/models/post.model';
import User from '@/lib/models/user.model';
import Community from '@/lib/models/community.model';

interface Params {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}

export async function createPost({
  text,
  author,
  communityId,
  path,
}: Params) {
  try {
    connectToDB();

    const communityIdObject = await Community.findOne(
      { id: communityId },
      { _id: 1 },
    );

    // const createdPost = await Post.create({
    //   text,
    //   author,
    //   // Assign communityId if provided,
    //   // or leave it null for personal account
    //   community: communityIdObject,
    // });

    // // Update User model
    // await User.findByIdAndUpdate(author, {
    //   $push: { posts: createdPost._id },
    // });
    console.log('here: ');
    if (communityIdObject) {
      // Update Community model
      // await Community.findByIdAndUpdate(communityIdObject, {
      //   $push: { posts: createdPost._id },
      // });
      console.log('communityIdObject: ', communityIdObject);
    }

    // revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Error creating post: ${error.message}`);
  }
}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
  connectToDB();

  // Calculate the number of posts to skip
  // based on the page number and page size
  const skipAmount = (pageNumber - 1) * pageSize;

  // Create a query to fetch the posts that have no parent
  // (top-level posts) (a post that is not a comment/reply)
  const postsQuery = Post.find({
    parentId: { $in: [null, undefined] },
  })
    .sort({ createdAt: 'desc' })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({ path: 'author', model: User })
    .populate({
      path: 'community',
      model: Community,
    })
    .populate({
      // Populate the children field
      path: 'children',
      populate: {
        // Populate the author field within children
        path: 'author',
        model: User,
        // Select only _id and username fields of the author
        select: '_id name parentId image',
      },
    });

  // Count the total number of top-level posts
  // i.e., posts that are not comments
  const totalPostsCount = await Post.countDocuments({
    parentId: { $in: [null, undefined] },
  });

  const posts = await postsQuery.exec();

  const isNext = totalPostsCount > skipAmount + posts.length;

  return { posts, isNext };
}

async function fetchAllChildPosts(postId: string): Promise<any[]> {
  const childPosts = await Post.find({ parentId: postId });

  const descendantPosts = [];
  for (const childPost of childPosts) {
    const descendants = await fetchAllChildPosts(childPost._id);
    descendantPosts.push(childPost, ...descendants);
  }

  return descendantPosts;
}

export async function deletePost(id: string, path: string): Promise<void> {
  try {
    connectToDB();

    // Find the post to be deleted (the main post)
    const mainPost = await Post.findById(id).populate('author community');

    if (!mainPost) {
      throw new Error('Post not found');
    }

    // Fetch all child posts and their descendants recursively
    const descendantPosts = await fetchAllChildPosts(id);

    // Get all descendant post IDs including the main post ID and child post IDs
    const descendantPostIds = [
      id,
      ...descendantPosts.map((post) => post._id),
    ];

    // Extract the authorIds and communityIds
    // to update User and Community models respectively
    const uniqueAuthorIds = new Set(
      [
        // Use optional chaining to handle possible undefined values
        ...descendantPosts.map((post) => post.author?._id?.toString()),
        mainPost.author?._id?.toString(),
      ].filter((id) => id !== undefined),
    );

    const uniqueCommunityIds = new Set(
      [
        // Use optional chaining to handle possible undefined values
        ...descendantPosts.map((post) => post.community?._id?.toString()),
        mainPost.community?._id?.toString(),
      ].filter((id) => id !== undefined),
    );

    // Recursively delete child posts and their descendants
    await Post.deleteMany({ _id: { $in: descendantPostIds } });

    // Update User model
    await User.updateMany(
      { _id: { $in: Array.from(uniqueAuthorIds) } },
      { $pull: { posts: { $in: descendantPostIds } } },
    );

    // Update Community model
    await Community.updateMany(
      { _id: { $in: Array.from(uniqueCommunityIds) } },
      { $pull: { posts: { $in: descendantPostIds } } },
    );

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to delete post: ${error.message}`);
  }
}

export async function fetchPostById(postId: string) {
  connectToDB();

  try {
    const post = await Post.findById(postId)
      // Populate the author field with _id and username
      .populate({
        path: 'author',
        model: User,
        select: '_id id name image',
      })
      // Populate the community field with _id and name
      .populate({
        path: 'community',
        model: Community,
        select: '_id id name image',
      })
      // Populate the children field
      .populate({
        path: 'children',
        populate: [
          {
            // Populate the author field within children
            path: 'author',
            model: User,
            // Select only _id and username fields of the author
            select: '_id id name parentId image',
          },
          {
            // Populate the children field within children
            path: 'children',
            // The model of the nested children
            // (assuming it's the same "Post" model)
            model: Post,
            populate: {
              // Populate the author field within nested children
              path: 'author',
              model: User,
              // Select only _id and username fields of the author
              select: '_id id name parentId image',
            },
          },
        ],
      })
      .exec();

    return post;
  } catch (error: any) {
    console.error('Error while fetching post:', error);
    throw new Error(`Error fetching post: ${error.message}`);
  }
}

export async function addCommentToPost(
  postId: string,
  commentText: string,
  userId: string,
  path: string,
) {
  connectToDB();

  try {
    // Find the original post by its ID
    const originalPost = await Post.findById(postId);

    if (!originalPost) {
      throw new Error('Post not found');
    }

    // Create a new post with the comment text
    const commentPost = new Post({
      text: commentText,
      author: userId,
      // Set the parentId to the original post's ID
      parentId: postId,
    });

    // Save the new post
    const savedCommentPost = await commentPost.save();

    // Update the original post to inclue the new comment
    originalPost.children.push(savedCommentPost._id);

    // Save the original post
    await originalPost.save();

    revalidatePath(path);
  } catch (error: any) {
    console.error('Error while adding comment:', error);
    throw new Error(`Error adding comment to post: ${error.message}`);
  }
}
