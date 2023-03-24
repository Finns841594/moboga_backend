import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

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

const fetchStoryById = async (storyId:number) => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('mobogadb');
    const collection = db.collection('stories');
    const stories = await collection.findOne({ id: storyId });
    console.log('🤪🤪🤪', stories);
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
    console.log('🤪', media);
    return media[0];
  } catch (err) {
    return null;
  } finally {
    await client.close();
  }
};

export default {
  fetchAllStories, fetchStoryById, fetchStoryByLabel, fetchMediasByOid,
};
