/* eslint-disable object-curly-newline */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable no-trailing-spaces */
/* eslint-disable no-tabs */
/* eslint-disable consistent-return */
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

// Capitalize first letter of each word
const capitalize = (str: string) => str
		.split(' ')
		.map(word => word[0].toUpperCase() + word.slice(1))
		.join(' ');

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

const fetchStoryById = async (storyId: string) => {
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

const getStoriesByLabel = async (searchLabel: string) => {
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
				expiresIn: '2d',
			},
		);
		return token;
	} catch (err) {
		return { message: 'could not add new user' };
	} finally {
		await client.close();
	}
};
const createGoogleUser = async profile => {
	const id = randomUUID();
	const {
 given_name, family_name, email, picture, 
} = profile;
	const client = new MongoClient(uri);
	try {
		await client.connect();
		const db = client.db('mobogadb');
		const collection = db.collection('users');
		const user = await collection.insertOne({
			id,
			firstName: given_name,
			lastName: family_name,
			email,
			picture,
		});
		const token = jwt.sign(
			{
				id,
				firstName: given_name,
				lastName: family_name,
				email,
				picture,
			},
			process.env.JWT_SECRET as string,
			{
				expiresIn: '2d',
			},
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

const getAllReviewsFromUser = async userId => {
	const client = new MongoClient(uri);
	try {
		await client.connect();
		const db = client.db('mobogadb');
		const collection = db.collection('reviews');
		const reviews = await collection.find({ userId }).toArray();
		return reviews;
	} catch (err) {
		return null;
	} finally {
		await client.close();
	}
};

const getReviewsByStoryId = async storyId => {
	const client = new MongoClient(uri);
	try {
		await client.connect();
		const db = client.db('mobogadb');
		const collection = db.collection('reviews');
		const reviews = await collection.find({ storyId }).toArray();
		return reviews;
	} catch (err) {
		return null;
	} finally {
		await client.close();
	}
};

// eslint-disable-next-line consistent-return
const addNewReview = async reviewObj => {
	const {
 userId, userName, content, rating, mediaType, storyId, storyName, 
} =		reviewObj;
	const id = randomUUID();
	const client = new MongoClient(uri);
	try {
		await client.connect();
		const db = client.db('mobogadb');
		const collection = db.collection('reviews');
		await collection.insertOne({
			id,
			userId,
			userName,
			content,
			rating,
			mediaType,
			storyId,
			storyName,
		});
	} catch (err) {
		return { message: 'could not add new review' };
	} finally {
		await client.close();
	}
};

const updateReview = async (reviewId, newContent) => {
	const client = new MongoClient(uri);
	try {
		await client.connect();
		const db = client.db('mobogadb');
		const collection = db.collection('reviews');
		await collection.updateOne(
			{ id: reviewId },
			{ $set: { content: newContent } },
		);
	} catch (err) {
		return { message: 'could not update review' };
	} finally {
		await client.close();
	}
};

const deleteReview = async reviewId => {
	const client = new MongoClient(uri);
	try {
		await client.connect();
		const db = client.db('mobogadb');
		const collection = db.collection('reviews');
		await collection.deleteOne({ id: reviewId });
	} catch (err) {
		return { message: 'could not delete review' };
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
		// check if the story already exists
		const checkResult = await collection.find({ storyname: capitalize(storyName.toLowerCase()) }).toArray();
		if (checkResult.length === 0) {
			const response = await collection.insertOne({
				id: randomUUID(),
				storyname: capitalize(storyName.toLowerCase()),
				labels: [],
				books: [],
				movies: [],
				games: [],
				rating: 0,
			});
			return response;
		}
		return null;
  } catch (err) {
    return null;
  } finally {
    await client.close();
  }
};

const deleteAStory = async (storyId: string) => {
	const client = new MongoClient(uri);
	try {
		await client.connect();
		const db = client.db('mobogadb');
		const collection = db.collection('stories');
		const deleteStoryResponse = collection.deleteOne({ id: storyId });
		return deleteStoryResponse;
	} catch (err) {
		return null;
	} finally {
		await client.close();
	}
};

const generateGameMedias = async (storyName: string) => {
  const amoutsOfMedia = 10;
  const url = gameApiPath + storyName;
  const rawData = await axios(url);
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

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('mobogadb');
    const storiesCollection = db.collection('stories');
    const mediasCollection = db.collection('medias');
    const responseAddDB = await mediasCollection.insertMany(bulkMedias);
    const mediaArrayForStory = [];
    responseAddDB.ops.forEach(element => {
      mediaArrayForStory.push({
        // eslint-disable-next-line no-underscore-dangle
        oid: element._id.toString(),
        name: element.name,
      });
    });
    const responseAddToStory = await storiesCollection.updateOne(
      { storyname: storyName },
      { $set: { games: mediaArrayForStory } },
    );

		const addedStoryInfo = await storiesCollection.find(
			{ storyname: storyName },
		).toArray();
		const addedStoryId = addedStoryInfo[0].id;

    return { addedToStoryWithId: addedStoryId, responseAddDB, responseAddToStory };
  } catch (err) {
    return null;
  } finally {
    await client.close();
  }
};

const generateMovieMedias = async (storyName: string) => {
	const amoutsOfMedia = 15;
	const url = movieApiPath + storyName;
	const rawData = await axios(url);
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
		const responseAddDB = await mediasCollection.insertMany(bulkMedias);
		const mediaArrayForStory = [];
		responseAddDB.ops.forEach(element => {
			mediaArrayForStory.push({
				// eslint-disable-next-line no-underscore-dangle
				oid: element._id.toString(),
				name: element.name,
			});
		});
		const responseAddToStory = await storiesCollection.updateOne(
			{ storyname: storyName },
			{ $set: { movies: mediaArrayForStory } },
		);

		return { responseAddDB, responseAddToStory };
	} catch (err) {
		return null;
	} finally {
		await client.close();
	}
};

const generateBooksMedias = async (storyName: string) => {
	const amoutsOfMedia = 10;
	const url = bookApiPath + storyName;
	const rawData = await axios(url);
	const bulkMedias = [];
	rawData.data.items.slice(0, amoutsOfMedia).forEach(element => {
		bulkMedias.push({
			id: randomUUID(),
			name: element.volumeInfo.title,
			description: element.volumeInfo.description,
			type: 'books',
			released: element.volumeInfo.publishedDate,
			imgurl: element.volumeInfo.imageLinks?.thumbnail,
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
		const responseAddDB = await mediasCollection.insertMany(bulkMedias);
		const mediaArrayForStory = [];

		responseAddDB.ops.forEach(element => {
			mediaArrayForStory.push({
				// eslint-disable-next-line no-underscore-dangle
				oid: element._id.toString(),
				name: element.name,
			});
		});
		const responseAddToStory = await storiesCollection.updateOne(
			{ storyname: storyName },
			{ $set: { books: mediaArrayForStory } },
		);

		return { responseAddDB, responseAddToStory };
	} catch (err) {
		return null;
	} finally {
		await client.close();
	}
};

const removeMediaFromStory = async (storyId: string, mediaId: string) => {
	console.log('❌ Removing media with id:', mediaId, 'from story with id:', storyId, '...');
	const client = new MongoClient(uri);
	try {
		await client.connect();
		const db = client.db('mobogadb');
		const storiesCollection = db.collection('stories');
		// Should I remove the media from the medias collection?
		// const mediasCollection = db.collection('medias');

		// Method 1: Remove media from story here in backend 
		const RemovingMediaStory = await storiesCollection.find({ id: storyId }).toArray();
		const filteredMovies = RemovingMediaStory[0].movies.filter((element: any) => element.oid !== mediaId);
		const filteredBooks = RemovingMediaStory[0].books.filter((element: any) => element.oid !== mediaId);
		const filteredGames = RemovingMediaStory[0].games.filter((element: any) => element.oid !== mediaId);
		RemovingMediaStory[0].movies = filteredMovies;
		RemovingMediaStory[0].books = filteredBooks;
		RemovingMediaStory[0].games = filteredGames;
		const responseRemoveFromStory = await storiesCollection.updateOne(
			{ id: storyId }, 
			{ $set: { movies: RemovingMediaStory[0].movies, books: RemovingMediaStory[0].books, games: RemovingMediaStory[0].games } },
		);

		// Method 2: Remove media from story in Database
		// To be implemented
		
		return responseRemoveFromStory;
		} catch (err) {
			return null;
		} finally {
			await client.close();
		}
	};

// const addStoryFromTestStoriesCollectionToStoriesCollection = async (storyId: string) => {
// 	const client = new MongoClient(uri);
// 	try {
// 		await client.connect();
// 		const db = client.db('mobogadb');
// 		const testStoriesCollection = db.collection('teststories');
// 		const response = await testStoriesCollection.aggregate([{ $match: { id: storyId } }, { $out: 'teststories' }]);
// 		return response;
// 	} catch (err) {
// 		return null;
// 	} finally {
// 		await client.close();
// 	}
// };

const getAllLabels = async () => {
	const client = new MongoClient(uri);
	try {
		await client.connect();
		const db = client.db('mobogadb');
		const collection = db.collection('labels');
		const labels = await collection.find({}).toArray();
		return labels;
	} catch (err) {
		return null;
	} finally {
		await client.close();
	}
};

const addAlabelInDB = async (labelName: string) => {
	const client = new MongoClient(uri);
	try {
		await client.connect();
		const db = client.db('mobogadb');
		const collection = db.collection('labels');
		// check if label already exist
		const checkResult = await collection.findOne({ name: labelName });
		if (!checkResult) {
			const response = await collection.insertOne({
				id: 0,
				name: labelName,
				voted_users: [],
			});
			return response;
		}
		return null;
	} catch (err) {
		return null;
	} finally {
		await client.close();
	}
};

const deleteAlabelInDB = async (labelName: string) => {
	const client = new MongoClient(uri);
	try {
		await client.connect();
		const db = client.db('mobogadb');
		const collection = db.collection('labels');
		const deleteResult = await collection.deleteOne({ name: labelName });
		return deleteResult;
	} catch (err) {
		return null;
	} finally {
		await client.close();
	}
};

const setALabelToAStory = async (labelName: string, StoryId: string) => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('mobogadb');
    const storyColl = db.collection('stories');
    const labelColl = db.collection('labels');
    const labelObjs = await labelColl.findOne({ name: labelName });
    // check if label already exist
    const checkResult = await storyColl
      .find({
        $and: [
          { labels: { $elemMatch: { name: labelName } } },
          { id: StoryId },
        ],
      })
      .toArray();
    console.log('🤪checkResult', checkResult);
    if (checkResult.length === 0) {
      const responseAddLabel = await storyColl.updateOne(
        { id: StoryId },
        { $push: { labels: labelObjs } },
      );
      return responseAddLabel;
    }
    return null;
  } catch (err) {
    return null;
  } finally {
    await client.close();
  }
};

const deleteALabelFromAStory = async (labelName: string, StoryId: string) => {
	const client = new MongoClient(uri);
	try {
		await client.connect();
		const db = client.db('mobogadb');
		const storyColl = db.collection('stories');
		// delete the label from the story
		const responseRemoveLabel = await storyColl.updateOne(
			{ id: StoryId },
			{ $pull: { labels: { name: labelName } } },
		);
		return responseRemoveLabel;
	} catch (err) {
		return null;
	} finally {
		await client.close();
	}
};	

const voteALabelToAStory = async (labelName: string, StoryId: string, userId: string) => {
  console.log('Removing userId:', userId, 'from label:', labelName, 'in story(id):', StoryId);
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('mobogadb');
    const storyColl = db.collection('stories');
    // check if the label in the story
    const checkResult = await await storyColl
      .find({ $and: [{ labels: { $elemMatch: { name: labelName } } }, { id: StoryId }] }).toArray();
    // if not, return null
    if (checkResult.length === 0) {
      return null;
    }
    // if yes, go through the labels array
    await checkResult[0].labels.forEach(async label => {
      // if the label name is the same as the labelName
      if (label.name === labelName) {
        // if user has voted, remove the user from the voted_users array
        if (label.voted_users.includes(userId)) {
          const removeUser = await storyColl.updateOne(
            { id: StoryId },
            { $pull: { 'labels.$[label].voted_users': userId } },
            { arrayFilters: [{ 'label.name': labelName }] },
          );
          return removeUser;
        }
        // if user has not voted, add the user to the voted_users array
        const addUser = await storyColl.updateOne(
          { id: StoryId },
          { $push: { 'labels.$[label].voted_users': userId } },
					{ arrayFilters: [{ 'label.name': labelName }] },
        );
        return addUser;
      }
    });
  } catch (err) {
    console.log(err);
    return null;
  } finally {
    await client.close();
  }
};

// Fengs working area

export default {
	fetchAllStories,
	fetchStoryById,
	getStoriesByLabel,
	fetchMediasByOid,

	addNewUser,
	getUser,
	createGoogleUser,

	addNewReview,
	getReviewsByStoryId,
	updateReview,
	deleteReview,

	generateStory,	
  deleteAStory,
	generateGameMedias,
	generateMovieMedias,
	generateBooksMedias,
	removeMediaFromStory,
	getAllReviewsFromUser,

	getAllLabels,
	addAlabelInDB,
	deleteAlabelInDB,
	setALabelToAStory,
  deleteALabelFromAStory,
  voteALabelToAStory,
};
