import { GraphQLServer } from 'graphql-yoga';

// Scalar Types - ID, Boolean, String, Float, Int - Can only store one value


// Type Defs
const typeDefs = `
    type Query {
        greeting(name: String, position: String): String!
        me: User!
        post: Post!
        add(a: Float!, b: Float!): Float!
    }

    type User {
        id: ID!
        name: String!
        age: Int
        email: String!
    }

    type Post {
        id: ID!
        title: String!
        body: String!
        published: Boolean!
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
            }
        },
        post: () => {
            return {
                id: '4653666',
                title: 'Example Post',
                body: 'This is the content of the example post',
                published: true
            }
        },
        greeting: (parent, args, ctx, info) => {
            if (args.name && args.position) {
                return `Hello, ${args.name}. You are my favorite ${args.position}`;
            }
            return 'Hello';
        },
        add: (parent, args, ctx, info) => args.a + args.b
    }
}

const server = new GraphQLServer({
    typeDefs,
    resolvers
});

server.start(() => console.log('GraphQL playground is up and running on port 4000'));