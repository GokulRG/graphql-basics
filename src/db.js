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


const db = {
    users,
    posts,
    comments
}

export default db;