/* eslint-disable max-len */
import db from './db';

const allStories = async () => db.fetchAllStories();

const getOneStoryById = async (storyId: string) => db.fetchStoryById(storyId);

const getStoriesByLabel = async (storyLabel: string) => db.getStoriesByLabel(storyLabel);

const fetchMediasByOid = async (mediaOid: string) => db.fetchMediasByOid(mediaOid);

const createUser = async (firstName, lastName, email, password) => db.addNewUser(firstName, lastName, email, password);

const createGoogleUser = async profile => db.createGoogleUser(profile);

const getExistingUser = async email => db.getUser(email);

const getAllUserReviews = async (userId: string) => db.getAllReviewsFromUser(userId);

const getReviewsByStoryId = async (userId: string) => db.getReviewsByStoryId(userId);

const createReview = async reviewObj => db.addNewReview(reviewObj);

const updateReview = async (reviewId: string, newContent: string) => db.updateReview(reviewId, newContent);

const deleteReview = async (reviewId: string) => db.deleteReview(reviewId);

const generateStory = async (storyName: string) => db.generateStory(storyName);

const deleteAStory = async (storyId: string) => db.deleteAStory(storyId);

const generateGameMedias = async (storyName: string) => db.generateGameMedias(storyName);

const generateMovieMedias = async (storyName: string) => db.generateMovieMedias(storyName);

const generateBooksMedias = async (storyName: string) => db.generateBooksMedias(storyName);

const removeMediaFromStory = async (storyId: string, mediaOid: string) => db.removeMediaFromStory(storyId, mediaOid);

const getAllLabels = async () => db.getAllLabels();

const addAlabelInDB = async (labelName: string) => db.addAlabelInDB(labelName);

const deleteAlabelInDB = async (labelName: string) => db.deleteAlabelInDB(labelName);

const setALabelToAStory = async (labelName: string, StoryId: string) => db.setALabelToAStory(labelName, StoryId);

const voteALabelToAStory = async (labelName: string, StoryId: string, userId:string) => db.voteALabelToAStory(labelName, StoryId, userId);

const deleteALabelFromAStory = async (labelName: string, StoryId: string) => db.deleteALabelFromAStory(labelName, StoryId);

export {
  allStories,
  getOneStoryById,
  getStoriesByLabel,
  fetchMediasByOid,
  createUser,
  createGoogleUser,
  getExistingUser,
  getAllUserReviews,
  getReviewsByStoryId,
  createReview,
  updateReview,
  deleteReview,
  generateStory,
  deleteAStory,
  generateGameMedias,
  generateMovieMedias,
  generateBooksMedias,
  removeMediaFromStory,
  getAllLabels,
  addAlabelInDB,
  deleteAlabelInDB,
  setALabelToAStory,
  deleteALabelFromAStory,
  voteALabelToAStory,
};
