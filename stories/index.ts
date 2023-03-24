import db from './db';

const allStories = async () => db.fetchAllStories();
const getOneStoryById = async (storyId:number) => db.fetchStoryById(storyId);
const getStoriesByLabel = async (storyLabel:string) => db.fetchStoryByLabel(storyLabel);
const fetchMediasByOid = async (mediaOid:string) => db.fetchMediasByOid(mediaOid);

export {
  allStories, getOneStoryById, getStoriesByLabel, fetchMediasByOid,
};
