import db from './db';

const allStories = async () => db.fetchAllStories();

export {
  allStories
};
