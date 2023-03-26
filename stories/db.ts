import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
const bcrypt = require('bcryptjs');
import { randomUUID } from 'crypto';

dotenv.config();

const uri = process.env.DB_KEY;

const fetchAllStories = async () => {
	const client = new MongoClient(uri);
	try {
		await client.connect();
		const db = client.db('mobogadb');
		const collection = db.collection('stories');
		const stories = await collection.find({}).toArray();
		return stories;
	} catch (err) {
		return null;
	} finally {
		await client.close();
	}
};

const fetchStoryById = async (storyId: number) => {
	const client = new MongoClient(uri);
	try {
		await client.connect();
		const db = client.db('mobogadb');
		const collection = db.collection('stories');
		const stories = await collection.findOne({ id: storyId });
		return stories;
	} catch (err) {
		return null;
	} finally {
		await client.close();
	}
};

const fetchStoryByLabel = async (searchLabel: string) => {
	const client = new MongoClient(uri);
	try {
		await client.connect();
		const db = client.db('mobogadb');
		const collection = db.collection('stories');
		const stories = await collection
			.find({ labels: { $elemMatch: { name: searchLabel } } })
			.toArray();
		return stories;
	} catch (err) {
		return null;
	} finally {
		await client.close();
	}
};

const fetchMediasByOid = async (mediaOid: string) => {
	const client = new MongoClient(uri);
	try {
		await client.connect();
		const db = client.db('mobogadb');
		const collection = db.collection('medias');
		let media = await collection.find({ _id: ObjectId(mediaOid) }).toArray();
		// lines below should be removed after fixing the database objectid problem
		if (media.length === 0) {
			media = await collection.find({ _id: mediaOid }).toArray();
		}
		return media[0];
	} catch (err) {
		return null;
	} finally {
		await client.close();
	}
};
const fetchAllUsers = async () => {
	const client = new MongoClient(uri);
	try {
		await client.connect();
		const db = client.db('mobogadb');
		const collection = db.collection('users');
		const users = await collection.find({}).toArray();
		return users;
	} catch (err) {
		return null;
	} finally {
		await client.close();
	}
};

const addNewUser = async (firstName, lastName, email, password) => {
	const hashedPassword = await bcrypt.hash(password, 10);
	const id = randomUUID();
	const client = new MongoClient(uri);
	try {
		await client.connect();
		const db = client.db('mobogadb');
		const collection = db.collection('users');
		await collection.insertOne({
			id,
			firstName,
			lastName,
			email,
			hashedPassword,
		});
	} catch (err) {
		return { message: 'could not add new user' };
	} finally {
		await client.close();
	}
};

const getUser = async email => {
	const client = new MongoClient(uri);
	try {
		await client.connect();
		const db = client.db('mobogadb');
		const collection = db.collection('users');
		const existingUser = await collection.findOne({ email });
		return existingUser;
	} catch (err) {
		return null;
	} finally {
		await client.close();
	}
};
const getUserbyId = async id => {
	const client = new MongoClient(uri);
	try {
		await client.connect();
		const db = client.db('mobogadb');
		const collection = db.collection('users');
		const existingUser = await collection.findOne({ id });
		return existingUser;
	} catch (err) {
		return null;
	} finally {
		await client.close();
	}
};

const addNewReview = async (mediaId, content, rating) => {
	let user, media;
	try {
		// user = await getUserbyId(userId);
		media = await fetchMediasByOid(mediaId);
	} catch (err) {
		return { message: 'could not fetch user or media' };
	}
	if (media) {
		const id = randomUUID();
		const client = new MongoClient(uri);
		try {
			await client.connect();
			const db = client.db('mobogadb');
			const collection = db.collection('reviews');
			await collection.insertOne({
				id,
				mediaId,
				content,
				rating,
			});
		} catch (err) {
			return { message: 'could not add new review' };
		} finally {
			await client.close();
		}
	}
};

// Fengs working area

// Fengs working area

export default {
	fetchAllStories,
	fetchStoryById,
	fetchStoryByLabel,
	fetchMediasByOid,
	addNewUser,
	getUser,
	addNewReview,
	fetchAllUsers,
};
