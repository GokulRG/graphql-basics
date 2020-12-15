import { v4 as uuidv4 } from 'uuid';

const Mutation = {
    createUser: (parent, args, { db }, info) => {
        const emailTaken = db.users.some((user) => user.email === args.data.email);

        if (emailTaken) {
            throw new Error('Email taken');
        }

        // Using babel transform spread
        const user = {
            id: uuidv4(),
            ...args.data
        };

        db.users.push(user);

        return user;
    },
    deleteUser: (parent, args, { db }, info) => {
        const userIndex = db.users.findIndex((user) => user.id === args.id);

        if (userIndex < 0) {
            throw new Error('User Not Found!');
        }

        const removedUsers = db.users.splice(userIndex, 1);
        db.posts = db.posts.filter((post) => {
            const toBeRemoved = post.author === removedUsers[0].id;

            if (toBeRemoved) {
                // Remove the comments from the post that is to be removed
                db.comments = db.comments.filter((comment) => post.id !== comment.post);
            }

            return !toBeRemoved;
        });

        // Remove the comments from the user
        db.comments = db.comments.filter((comment) => comment.author !== removedUsers[0].id);

        return removedUsers[0];
    },
    createPost: (parent, args, { db }, info) => {
        const isAuthorValid = db.users.some((user) => user.id === args.data.author);

        if (!isAuthorValid) {
            throw new Error('Invalid Author');
        }

        const post = {
            id: uuidv4(),
            ...args.data
        };

        db.posts.push(post);

        return post;
    },
    deletePost: (parent, args, { db }, info) => {
        const postIndex = db.posts.findIndex((post) => post.id === args.id);

        if (postIndex < 0) {
            throw new Error('Post not found');
        }

        const deletedPosts = db.posts.splice(postIndex, 1);
        db.comments = db.comments.filter((comment) => comment.post !== deletedPosts[0].id);

        return deletedPosts[0];
    },
    createComment: (parent, args, { db }, info) => {
        const isAuthorValid = db.users.some((user) => user.id === args.data.author);
        const isPostValidAndPublished = db.posts.some((post) => {
            return post.id === args.data.post && post.published;
        });

        if (!isAuthorValid) {
            throw new Error('Invalid Author');
        }

        if (!isPostValidAndPublished) {
            throw new Error('Invalid or unpublished post');
        }

        const comment = {
            id: uuidv4(),
            ...args.data
        };

        db.comments.push(comment);

        return comment;
    },
    deleteComment: (parent, args, { db }, info) => {
        const commentIndex = db.comments.findIndex((comment) => comment.id === args.id);

        if (commentIndex < 0) {
            throw new Error('Comment Not found!');
        }

        const removedComments = db.comments.splice(commentIndex, 1);

        return removedComments[0];
    }
};

export default Mutation;