import db from './db';

const allStories = async () => db.fetchAllStories();
const getOneStoryById = async (storyId: number) => db.fetchStoryById(storyId);
const getStoriesByLabel = async (storyLabel: string) =>
	db.fetchStoryByLabel(storyLabel);
const fetchMediasByOid = async (mediaOid: string) =>
	db.fetchMediasByOid(mediaOid);
const createUser = async (firstName, lastName, email, password) =>
	db.addNewUser(firstName, lastName, email, password);
const getExistingUser = async email => db.getUser(email);

export {
	allStories,
	getOneStoryById,
	getStoriesByLabel,
	fetchMediasByOid,
	createUser,
	getExistingUser,
};
