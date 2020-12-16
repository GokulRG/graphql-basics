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
	updateUser: (parent, args, { db }, info) => {
		const { id, data } = args;
		const user = db.users.find((user) => user.id === id);

		if (!user) {
			throw new Error('User not found!');
		}

		if (typeof data.email === 'string') {
			const emailTaken = db.users.some((user) => user.email === data.email);

			if (emailTaken) {
				throw new Error('Email already in use!');
			}

			user.email = data.email;
		}

		if (typeof data.name === 'string') {
			user.name = data.name;
		}

		if (typeof data.age !== 'undefined') {
			user.age = data.age;
		}

		return user;
	},
	createPost: (parent, args, { db, pubsub }, info) => {
		const isAuthorValid = db.users.some((user) => user.id === args.data.author);

		if (!isAuthorValid) {
			throw new Error('Invalid Author');
		}

		const post = {
			id: uuidv4(),
			...args.data
		};

		db.posts.push(post);

		if (post.published) {
			pubsub.publish('post', { post: { mutation: 'CREATED', data: post } });
		}

		return post;
	},
	deletePost: (parent, args, { db, pubsub }, info) => {
		const postIndex = db.posts.findIndex((post) => post.id === args.id);

		if (postIndex < 0) {
			throw new Error('Post not found');
		}

		const deletedPosts = db.posts.splice(postIndex, 1);
		db.comments = db.comments.filter((comment) => comment.post !== deletedPosts[0].id);

		if (deletedPosts[0].published) {
			pubsub.publish('post', {
				post: {
					mutation: 'DELETED',
					data: deletedPosts[0]
				}
			});
		}

		return deletedPosts[0];
	},
	updatePost: (parent, args, { db, pubsub }, info) => {
		const { id, data } = args;

		const post = db.posts.find((post) => post.id === id);

		const originalPost = { ...post };

		if (!post) {
			throw new Error('Post Not Found');
		}

		if (typeof data.title === 'string') {
			post.title = data.title;
		}

		if (typeof data.body === 'string') {
			post.body = data.body;
		}

		if (typeof data.published === 'boolean') {
			post.published = data.published;

			if (originalPost.published && !post.published) {
				// deleted event
				pubsub.publish('post', {
					post: {
						mutation: 'DELETED',
						data: originalPost
					}
				});
			} else if (!originalPost.published && post.published) {
				//created event
				pubsub.publish('post', {
					post: {
						mutation: 'CREATED',
						data: post
					}
				});
			}
		} else if (post.published) {
			//updated event
			pubsub.publish('post', {
				post: {
					mutation: 'UPDATED',
					data: post
				}
			});
		}

		return post;
	},
	createComment: (parent, args, { db, pubsub }, info) => {
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

		// Subscription
		pubsub.publish(`comment ${args.data.post}`, { comment: { mutation: 'CREATED', data: comment } });

		return comment;
	},
	deleteComment: (parent, args, { db, pubsub }, info) => {
		const commentIndex = db.comments.findIndex((comment) => comment.id === args.id);

		if (commentIndex < 0) {
			throw new Error('Comment Not found!');
		}

		const removedComments = db.comments.splice(commentIndex, 1);

		pubsub.publish(`comment ${removedComments[0].post}`, { comment: { mutation: 'DELETED', data: removedComments[0] } });
		return removedComments[0];
	},
	updateComment: (parent, args, { db, pubsub }, info) => {
		const { id, data } = args;

		const comment = db.comments.find((comment) => comment.id === id);

		if (!comment) {
			throw new Error('Comment not Found!');
		}

		if (typeof data.text === 'string') {
			comment.text = data.text;
        }
        
        pubsub.publish(`comment ${comment.post}`, { comment: { mutation: 'UPDATED', data: comment } });

		return comment;
	}
};

export default Mutation;
