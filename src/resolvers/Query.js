const Query = {
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
    users: (parent, args, { db }, info) => {
        if (!args.query) {
            return db.users;
        }

        return db.users.filter((user) => {
            return user.name.toLowerCase().includes(args.query.toLowerCase());
        });
    },
    posts: (parent, args, { db }, info) => {
        if (!args.query) {
            return db.posts;
        }

        return db.posts.filter((post) => {
            return (
                post.body.toLowerCase().includes(args.query.toLowerCase()) ||
                post.title.toLowerCase().includes(args.query.toLowerCase())
            );
        });
    },
    comments: (parent, args, { db }, info) => db.comments
};


export default Query;