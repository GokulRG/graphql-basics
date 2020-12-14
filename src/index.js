import { GraphQLServer } from 'graphql-yoga';
import { v4 as uuidv4 } from 'uuid';

// Scalar Types - ID, Boolean, String, Float, Int - Can only store one value

let users = [
	{
		id: '1',
		name: 'David Warner',
		age: 35,
		email: 'davidwarner@mailinator.com'
	},
	{
		id: '2',
		name: 'Kane Williamson',
		age: 34,
		email: 'kanew@mailinator.com'
	}
];

let posts = [
	{
		id: '101',
		title: 'Post One',
		body: 'This is the body of Post one',
		published: true,
		author: '1'
	},
	{
		id: '102',
		title: 'Post Two',
		body: 'This is the body of Post two',
		published: false,
		author: '2'
	},
	{
		id: '103',
		title: 'Post Three',
		body: 'This is the body of Post three',
		published: true,
		author: '1'
	}
];

let comments = [
	{
		id: '1',
		text: 'Comment One',
		author: '1',
		post: '101'
	},
	{
		id: '2',
		text: 'Comment Two',
		author: '2',
		post: '102'
	},
	{
		id: '3',
		text: 'Comment Three',
		author: '1',
		post: '103'
	},
	{
		id: '4',
		text: 'Comment Four',
		author: '2',
		post: '103'
	}
];

// Type Defs
const typeDefs = `
    type Query {
        users(query: String): [User!]!
        me: User!
        post: Post!
        posts(query: String): [Post!]!
        comments: [Comment!]!
    }

    type Mutation {
        createUser(data: CreateUserInput!): User!
        deleteUser(id: ID!): User
        createPost(data: CreatePostInput!): Post!
        deletePost(id: ID!): Post
        createComment(data: CreateCommentInput!): Comment!
        deleteComment(id: ID!): Comment
    }

    input CreateUserInput {
        name: String!
        email: String!
        age: Int
    }

    input CreatePostInput {
        title: String!
        body: String!
        published: Boolean!
        author: ID!
    }

    input CreateCommentInput {
        text: String!
        author: ID!
        post: ID!
    }

    type User {
        id: ID!
        name: String!
        age: Int
        email: String!
        posts: [Post!]!
        comments: [Comment!]!
    }

    type Post {
        id: ID!
        title: String!
        body: String!
        published: Boolean!
        author: User!
        comments: [Comment!]!
    }

    type Comment {
        id: ID!
        text: String!
        author: User!
        post: Post!
    }
`;

// Resolvers
const resolvers = {
	Query: {
		me: () => {
			return {
				id: '123422',
				name: 'Kane Williamson',
				age: 34,
				email: 'kanew@mailinator.com'
			};
		},
		post: () => {
			return {
				id: '4653666',
				title: 'Example Post',
				body: 'This is the content of the example post',
				published: true,
				author: {
					id: '123422',
					name: 'Kane Williamson',
					age: 34,
					email: 'kanew@mailinator.com'
				}
			};
		},
		users: (parent, args, ctx, info) => {
			if (!args.query) {
				return users;
			}

			return users.filter((user) => {
				return user.name.toLowerCase().includes(args.query.toLowerCase());
			});
		},
		posts: (parents, args, ctx, info) => {
			if (!args.query) {
				return posts;
			}

			return posts.filter((post) => {
				return (
					post.body.toLowerCase().includes(args.query.toLowerCase()) ||
					post.title.toLowerCase().includes(args.query.toLowerCase())
				);
			});
		},
		comments: () => comments
	},
	Mutation: {
		createUser: (parent, args, ctx, info) => {
			const emailTaken = users.some((user) => user.email === args.data.email);

			if (emailTaken) {
				throw new Error('Email taken');
			}

			// Using babel transform spread
			const user = {
				id: uuidv4(),
				...args.data
			};

			users.push(user);

			return user;
		},
		deleteUser: (parent, args, ctx, info) => {
			const userIndex = users.findIndex((user) => user.id === args.id);

			if (userIndex < 0) {
				throw new Error('User Not Found!');
            }
            
            const removedUsers = users.splice(userIndex, 1);
            posts = posts.filter(post => {
                const toBeRemoved = post.author === removedUsers[0].id;
                
                if (toBeRemoved) {
                    // Remove the comments from the post that is to be removed
                    comments = comments.filter(comment => post.id !== comment.post);
                }

                return !toBeRemoved;
            });

            // Remove the comments from the user
            comments = comments.filter(comment => comment.author !== removedUsers[0].id);
            
            return removedUsers[0];

		},
		createPost: (parent, args, ctx, info) => {
			const isAuthorValid = users.some((user) => user.id === args.data.author);

			if (!isAuthorValid) {
				throw new Error('Invalid Author');
			}

			const post = {
				id: uuidv4(),
				...args.data
			};

			posts.push(post);

			return post;
        },
        deletePost: (parent, args, ctx, info) => {
            const postIndex = posts.findIndex(post => post.id === args.id);

            if (postIndex < 0) {
                throw new Error('Post not found');
            }

            const deletedPosts = posts.splice(postIndex, 1);
            comments = comments.filter(comment => comment.post !== deletedPosts[0].id);

            return deletedPosts[0];
        },
		createComment: (parent, args, ctx, info) => {
			const isAuthorValid = users.some((user) => user.id === args.data.author);
			const isPostValidAndPublished = posts.some((post) => {
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

			comments.push(comment);

			return comment;
        },
        deleteComment: (parent, args, ctx, info) => {
            const commentIndex = comments.findIndex(comment => comment.id === args.id);

            if (commentIndex < 0) {
                throw new Error('Comment Not found!');
            }

            const removedComments = comments.splice(commentIndex, 1);

            return removedComments[0];
        }
	},
	Post: {
		author: (parent, args, ctx, info) => {
			return users.find((user) => {
				return parent.author === user.id;
			});
		},
		comments: (parent, args, ctx, info) => {
			return comments.filter((comment) => {
				return comment.post === parent.id;
			});
		}
	},
	User: {
		posts: (parent, args, ctx, info) => {
			return posts.filter((post) => {
				return parent.id === post.author;
			});
		},
		comments: (parent, args, ctx, info) => {
			return comments.filter((comment) => {
				return comment.author === parent.id;
			});
		}
	},
	Comment: {
		author: (parent, args, ctx, info) => {
			return users.find((user) => {
				return user.id === parent.author;
			});
		},
		post: (parent, args, ctx, info) => {
			return posts.find((post) => {
				return post.id === parent.post;
			});
		}
	}
};

const server = new GraphQLServer({
	typeDefs,
	resolvers
});

server.start(() => console.log('GraphQL playground is up and running on port 4000'));
