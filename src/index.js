import { GraphQLServer } from 'graphql-yoga';
import db from './db';
import Query from './resolvers/Query';
import Mutation from './resolvers/Mutation';
import Comment from './resolvers/Comment';
import Post from './resolvers/Post';
import User from './resolvers/User';

const server = new GraphQLServer({
	typeDefs: './src/schema.graphql',
	resolvers: {
		Query,
		Mutation,
		User,
		Post,
		Comment
	},
	context: {
		db
	}
});

server.start(() => console.log('GraphQL playground is up and running on port 4000'));
