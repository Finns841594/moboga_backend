import { MongoClient } from 'mongodb';
// import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

// const generateId = () => uuidv4();

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
    // change label path!!
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

export default {
  fetchAllStories, fetchStoryById, fetchStoryByLabel,
};
