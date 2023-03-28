/* eslint-disable import/no-extraneous-dependencies */
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import axios from 'axios';

const bcrypt = require('bcryptjs');

dotenv.config();

const uri = process.env.DB_KEY;
const gameApiPath = process.env.GAME_API_PATH;
const movieApiPath = process.env.MOVIE_API_PATH;
const bookApiPath = process.env.BOOK_API_PATH;

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
		const token = jwt.sign(
			{
				email,
				id,
				firstName,
				lastName,
			},
			process.env.JWT_SECRET as string,
			{
				expiresIn: '48h',
			}
		);
		return token;
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

const getAllReviewsFromUser = async userId => {
	const client = new MongoClient(uri);
	try {
		await client.connect();
		const db = client.db('mobogadb');
		const collection = db.collection('reviews');
		const reviews = await collection.find({ userId }).toArray();
		console.log('AM I GETTING THE REVIEWS?: ', reviews);
		return reviews;
	} catch (err) {
		return null;
	} finally {
		await client.close();
	}
};

// eslint-disable-next-line consistent-return
const addNewReview = async (mediaId, content, rating, name, userId) => {
	let user;
	let media;
	try {
		user = await getUserbyId(userId);
		media = await fetchMediasByOid(mediaId);
	} catch (err) {
		return { message: 'could not fetch user or media' };
	}
	if (media && user) {
		const id = randomUUID();
		const client = new MongoClient(uri);
		try {
			await client.connect();
			const db = client.db('mobogadb');
			const collection = db.collection('reviews');
			await collection.insertOne({
				id,
				mediaId,
				name,
				content,
				rating,
				userId,
			});
		} catch (err) {
			return { message: 'could not add new review' };
		} finally {
			await client.close();
		}
	}
};

const updateReview = async (userId, reviewId) => {};
const deleteReview = async (userId, reviewId) => {
	const client = new MongoClient(uri);
	try {
		await client.connect();
		const db = client.db('mobogadb');
		const collection = db.collection('reviews');
		await collection.remove({ reviewId });
	} catch (err) {
		return null;
	} finally {
		await client.close();
	}
};

// Fengs working area
const generateStory = async (storyName: string) => {
	const client = new MongoClient(uri);
	try {
		await client.connect();
		const db = client.db('mobogadb');
		const collection = db.collection('stories');
		const response = await collection.insertOne({
			id: randomUUID(),
			storyname: storyName,
			labels: [],
			books: [],
			movies: [],
			games: [],
			rating: 0,
		});
		return response;
	} catch (err) {
		return null;
	} finally {
		await client.close();
	}
};

const generateGameMedias = async (storyName: string) => {
	// SETTINGS
	const amoutsOfMedia = 10;
	// fetch data from game api
	const url = gameApiPath + storyName;
	console.log('👀👀👀', url);
	const rawData = await axios(url);
	// get top ten results into <bulkMedia>
	const bulkMedias = [];
	rawData.data.results.slice(0, amoutsOfMedia).forEach(element => {
		bulkMedias.push({
			id: randomUUID(),
			name: element.name,
			description: 'to be written',
			type: 'games',
			released: element.released,
			imgurl: element.background_image,
			ratingFromAPI: element.metacritic,
			voteNumberFromAPI: element.ratings_count,
			metaData: element,
		});
	});
	console.log('⏺️⏺️⏺️', bulkMedias);

	const client = new MongoClient(uri);
	try {
		await client.connect();
		const db = client.db('mobogadb');
		const storiesCollection = db.collection('stories');
		const mediasCollection = db.collection('medias');
		// write in media collection
		const responseAddDB = await mediasCollection.insertMany(bulkMedias);
		// write in to respective story
		const mediaArrayForStory = [];
		responseAddDB.ops.forEach(element => {
			mediaArrayForStory.push({
				// eslint-disable-next-line no-underscore-dangle
				oid: element._id.toString(),
				name: element.name,
			});
		});
		console.log(
			'😃 Writting following data into games area',
			mediaArrayForStory
		);
		const responseAddToStory = await storiesCollection.updateOne(
			{ storyname: storyName },
			{ $set: { games: mediaArrayForStory } }
		);

		return { responseAddDB, responseAddToStory };
	} catch (err) {
		return null;
	} finally {
		await client.close();
	}
};

const generateMovieMedias = async (storyName: string) => {
	// SETTINGS
	// maybe should consider use dynamic amount of media !!!!!!
	const amoutsOfMedia = 15;
	// fetch data from movie api
	// maybe should fetch data from tv api as well !!!!!!
	const url = movieApiPath + storyName;
	const rawData = await axios(url);
	// get top ten results into <bulkMedia>
	const bulkMedias = [];
	rawData.data.results.slice(0, amoutsOfMedia).forEach(element => {
		bulkMedias.push({
			id: randomUUID(),
			name: element.original_title,
			description: element.overview,
			type: 'movies',
			released: element.release_date,
			imgurl: `https://image.tmdb.org/t/p/original/${element.poster_path}`,
			ratingFromAPI: element.vote_average * 10,
			voteNumberFromAPI: element.vote_count,
			metaData: element,
		});
	});

	const client = new MongoClient(uri);
	try {
		await client.connect();
		const db = client.db('mobogadb');
		const storiesCollection = db.collection('stories');
		const mediasCollection = db.collection('medias');
		// write in media collection
		// console.log('⏺️⏺️⏺️ Writting into <medias>', bulkMedias);
		const responseAddDB = await mediasCollection.insertMany(bulkMedias);
		console.log('⏺️⏺️⏺️ RESPONSE', responseAddDB);
		console.log(
			'⏺️⏺️⏺️ RESPONSE ONE ITEM',
			responseAddDB.insertedIds[String(2)]
		);
		// write in to respective story
		const mediaArrayForStory = [];

		responseAddDB.ops.forEach(element => {
			mediaArrayForStory.push({
				// eslint-disable-next-line no-underscore-dangle
				oid: element._id.toString(),
				name: element.name,
			});
		});

		console.log(
			'😃 Writting following data into movies area',
			mediaArrayForStory
		);
		const responseAddToStory = await storiesCollection.updateOne(
			{ storyname: storyName },
			{ $set: { movies: mediaArrayForStory } }
		);

		return { responseAddDB, responseAddToStory };
	} catch (err) {
		console.log('🤬🤬🤬', err);
		return null;
	} finally {
		await client.close();
	}
};

const generateBooksMedias = async (storyName: string) => {
	// SETTINGS
	// maybe should consider use dynamic amount of media !!!!!!
	const amoutsOfMedia = 10;
	// fetch data from movie api
	// maybe should fetch data from tv api as well !!!!!!
	const url = bookApiPath + storyName;
	const rawData = await axios(url);
	// get top ten results into <bulkMedia>
	const bulkMedias = [];
	rawData.data.items.slice(0, amoutsOfMedia).forEach(element => {
		bulkMedias.push({
			id: randomUUID(),
			name: element.volumeInfo.title,
			description: element.volumeInfo.description,
			type: 'books',
			released: element.volumeInfo.publishedDate,
			imgurl: element.volumeInfo.imageLinks.thumbnail,
			ratingFromAPI: element.volumeInfo.averageRating * 20,
			voteNumberFromAPI: element.volumeInfo.ratingsCount,
			metaData: element,
		});
	});

	const client = new MongoClient(uri);
	try {
		await client.connect();
		const db = client.db('mobogadb');
		const storiesCollection = db.collection('stories');
		const mediasCollection = db.collection('medias');
		// write in media collection
		const responseAddDB = await mediasCollection.insertMany(bulkMedias);
		console.log('⏺️⏺️⏺️ RESPONSE', responseAddDB);
		// write in to respective story
		const mediaArrayForStory = [];

		responseAddDB.ops.forEach(element => {
			mediaArrayForStory.push({
				// eslint-disable-next-line no-underscore-dangle
				oid: element._id.toString(),
				name: element.name,
			});
		});

		console.log(
			'😃 Writting following data into movies area',
			mediaArrayForStory
		);
		const responseAddToStory = await storiesCollection.updateOne(
			{ storyname: storyName },
			{ $set: { books: mediaArrayForStory } }
		);

		return { responseAddDB, responseAddToStory };
	} catch (err) {
		console.log('🤬🤬🤬', err);
		return null;
	} finally {
		await client.close();
	}
};

// Fengs working area

export default {
	fetchAllStories,
	fetchStoryById,
	fetchStoryByLabel,
	fetchMediasByOid,
	addNewUser,
	getUser,
	addNewReview,
	updateReview,
	deleteReview,
	fetchAllUsers,
	generateStory,
	generateGameMedias,
	generateMovieMedias,
	generateBooksMedias,
	getAllReviewsFromUser,
};
