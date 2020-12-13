import { GraphQLServer } from 'graphql-yoga';

// Scalar Types - ID, Boolean, String, Float, Int - Can only store one value

const users = [
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

const posts = [
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

const comments = [
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
	Post: {
		author: (parent, args, ctx, info) => {
			return users.find((user) => {
				return parent.author === user.id;
			});
        },
        comments: (parent, args, ctx, info) => {
            return comments.filter(comment => {
                return comment.post === parent.id
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
