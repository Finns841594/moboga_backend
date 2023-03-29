/* eslint-disable max-len */
import db from './db';

const allStories = async () => db.fetchAllStories();

const getOneStoryById = async (storyId: string) => db.fetchStoryById(storyId);

const getStoriesByLabel = async (storyLabel: string) => db.getStoriesByLabel(storyLabel);

const fetchMediasByOid = async (mediaOid: string) => db.fetchMediasByOid(mediaOid);

const createUser = async (firstName, lastName, email, password) => db.addNewUser(firstName, lastName, email, password);

const getExistingUser = async email => db.getUser(email);

const getAllUserReviews = async (userId:string) => db.getAllReviewsFromUser(userId);

const getReviewsByStoryId = async (userId:string) => db.getReviewsByStoryId(userId);

const createReview = async reviewObj => db.addNewReview(reviewObj);

const updateReview = async (userId:string, reviewId:string) => db.updateReview(userId, reviewId);

const deleteReview = async (userId:string, reviewId:string) => db.deleteReview(userId, reviewId);

const generateStory = async (storyName:string) => db.generateStory(storyName);

const generateGameMedias = async (storyName:string) => db.generateGameMedias(storyName);

const generateMovieMedias = async (storyName:string) => db.generateMovieMedias(storyName);

const generateBooksMedias = async (storyName:string) => db.generateBooksMedias(storyName);

const getAllLabels = async () => db.getAllLabels();

const addAlabelInDB = async (labelName:string) => db.addAlabelInDB(labelName);

const setALabelToAStory = async (labelName:string, StoryId:string) => db.setALabelToAStory(labelName, StoryId);

export {
  allStories,
  getOneStoryById,
  getStoriesByLabel,
  fetchMediasByOid,
  createUser,
  getExistingUser,
  getAllUserReviews,
  getReviewsByStoryId,
  createReview,
  updateReview,
  deleteReview,
  generateStory,
  generateGameMedias,
  generateMovieMedias,
  generateBooksMedias,
  getAllLabels,
  addAlabelInDB,
  setALabelToAStory,

};
