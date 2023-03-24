import db from './db';

const allStories = async () => db.fetchAllStories();
const getOneStoryById = async (storyId:number) => db.fetchStoryById(storyId);
const getStoriesByLabel = async (storyLabel:string) => db.fetchStoryByLabel(storyLabel);

export {
  allStories, getOneStoryById, getStoriesByLabel,
};
