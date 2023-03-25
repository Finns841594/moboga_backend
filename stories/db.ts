/* eslint-disable import/no-extraneous-dependencies */
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const uri = process.env.DB_KEY;
const gameApiPath = process.env.GAME_API_PATH;
const movieApiPath = process.env.MOVIE_API_PATH;

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

const fetchStoryById = async (storyId:number) => {
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

const fetchStoryByLabel = async (searchLabel:string) => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('mobogadb');
    const collection = db.collection('stories');
    const stories = await collection.find(
      { labels: { $elemMatch: { name: searchLabel } } },
    ).toArray();
    return stories;
  } catch (err) {
    return null;
  } finally {
    await client.close();
  }
};

const fetchMediasByOid = async (mediaOid:string) => {
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

// Fengs working area
const generateStory = async (storyName:string) => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('mobogadb');
    const collection = db.collection('stories');
    const response = await collection.insertOne({
      id: 0,
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

const generateGameMedias = async (storyName:string) => {
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
      id: 0,
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
    for (let i = 0; i < amoutsOfMedia; i++) {
      mediaArrayForStory.push({
        oid: responseAddDB.insertedIds[String(i)].toString(),
        name: bulkMedias[i].name,
      });
    }
    console.log('😃 Writting following data into games area', mediaArrayForStory);
    const responseAddToStory = await storiesCollection
      .updateOne({ storyname: storyName }, { $set: { games: mediaArrayForStory } });

    return { responseAddDB, responseAddToStory };
  } catch (err) {
    return null;
  } finally {
    await client.close();
  }
};

const generateMovieMedias = async (storyName:string) => {
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
      id: 0,
      name: element.original_title,
      description: element.overview,
      type: 'movies',
      released: element.released_date,
      imgurl: `https://image.tmdb.org/t/p/original/${element.poster_path}`,
      ratingFromAPI: element.vote_average * 10,
      voteNumberFromAPI: element.vote_count,
      metaData: element,
    });
  });
  console.log('⏺️⏺️⏺️ Writting into <medias>', bulkMedias);

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
    for (let i = 0; i < amoutsOfMedia; i++) {
      mediaArrayForStory.push({
        oid: responseAddDB.insertedIds[String(i)].toString(),
        name: bulkMedias[i].name,
      });
    }
    console.log('😃 Writting following data into movies area', mediaArrayForStory);
    const responseAddToStory = await storiesCollection
      .updateOne({ storyname: storyName }, { $set: { movies: mediaArrayForStory } });

    return { responseAddDB, responseAddToStory };
  } catch (err) {
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
  generateStory,
  generateGameMedias,
  generateMovieMedias,
};
