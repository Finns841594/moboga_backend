import db from './db';

const allStories = async () => db.fetchAllStories();
const getOneStoryById = async (storyId:number) => db.fetchStoryById(storyId);
const getStoriesByLabel = async (storyLabel:string) => db.fetchStoryByLabel(storyLabel);
const fetchMediasByOid = async (mediaOid:string) => db.fetchMediasByOid(mediaOid);
const generateStory = async (storyName:string) => db.generateStory(storyName);
const generateGameMedias = async (storyName:string) => db.generateGameMedias(storyName);
const generateMovieMedias = async (storyName:string) => db.generateMovieMedias(storyName);

export {
  allStories, getOneStoryById, getStoriesByLabel, fetchMediasByOid,
  generateStory, generateGameMedias, generateMovieMedias,
};
