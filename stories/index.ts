import db from './db';

const allStories = async () => db.fetchAllStories();
const getOneStoryById = async storyId => db.fetchStoryById(storyId);
const getOneStoryByLabel = async storyId => db.fetchStoryByLabel(storyId);

export {
  allStories, getOneStoryById, getOneStoryByLabel,
};
