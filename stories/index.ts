import db from './db';

const allStories = async () => db.fetchAllStories();

const getOneStoryById = async (storyId: number) => db.fetchStoryById(storyId);

const getStoriesByLabel = async (storyLabel: string) => db.fetchStoryByLabel(storyLabel);

const fetchMediasByOid = async (mediaOid: string) => db.fetchMediasByOid(mediaOid);

const getAllUsers = async () => db.fetchAllUsers();

const createUser = async (firstName, lastName, email, password) => db.addNewUser(firstName, lastName, email, password);

const getExistingUser = async email => db.getUser(email);

const getAllUserReviews = async (userId:string) => db.getAllReviewsFromUser(userId);

const createReview = async (mediaId, content, rating, name, userId) => db.addNewReview(mediaId, content, rating, name, userId);

const updateReview = async (userId:string, reviewId:string) => db.updateReview(userId, reviewId);

const deleteReview = async (userId:string, reviewId:string) => db.deleteReview(userId, reviewId);

const generateStory = async (storyName:string) => db.generateStory(storyName);

const generateGameMedias = async (storyName:string) => db.generateGameMedias(storyName);

const generateMovieMedias = async (storyName:string) => db.generateMovieMedias(storyName);

const generateBooksMedias = async (storyName:string) => db.generateBooksMedias(storyName);

export {
  allStories,
  getOneStoryById,
  getStoriesByLabel,
  fetchMediasByOid,
  getAllUsers,
  createUser,
  getExistingUser,
  getAllUserReviews,
  createReview, 
  updateReview,
  deleteReview,
  generateStory,
  generateGameMedias,
  generateMovieMedias,
  generateBooksMedias,
 
};
