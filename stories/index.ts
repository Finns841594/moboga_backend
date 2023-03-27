import db from './db';

const allStories = async () => db.fetchAllStories();

const getOneStoryById = async (storyId: number) => db.fetchStoryById(storyId);

const getStoriesByLabel = async (storyLabel: string) => db.fetchStoryByLabel(storyLabel);

const fetchMediasByOid = async (mediaOid: string) => db.fetchMediasByOid(mediaOid);

const getAllUsers = async () => db.fetchAllUsers();

const createUser = async (firstName, lastName, email, password) => db.addNewUser(firstName, lastName, email, password);

const getExistingUser = async email => db.getUser(email);

const createReview = async (mediaId, content, rating, name, userId) => db.addNewReview(mediaId, content, rating, name, userId);

const generateStory = async (storyName:string) => db.generateStory(storyName);

const generateGameMedias = async (storyName:string) => db.generateGameMedias(storyName);

const generateMovieMedias = async (storyName:string) => db.generateMovieMedias(storyName);

export {
  allStories,
  getOneStoryById,
  getStoriesByLabel,
  fetchMediasByOid,
  getAllUsers,
  createUser,
  getExistingUser,
  createReview,
  generateStory,
  generateGameMedias,
  generateMovieMedias,
};
