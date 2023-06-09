/* eslint-disable @typescript-eslint/indent */
/* eslint-disable no-tabs */
/* eslint-disable consistent-return */
/* eslint-disable max-len */
import express, { Request, Response, Application } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import {
  allStories,
  getOneStoryById,
  getStoriesByLabel,
  fetchMediasByOid,
  createUser,
	createGoogleUser,
  getExistingUser,
  createReview,
  generateStory,
  deleteAStory,
  generateGameMedias,
  generateMovieMedias,
  generateBooksMedias,
	removeMediaFromStory,
  getAllUserReviews,
  getReviewsByStoryId,
  updateReview,
  deleteReview,
  getAllLabels,
  addAlabelInDB,
	deleteAlabelInDB,
  setALabelToAStory,
  deleteALabelFromAStory,
  voteALabelToAStory,
} from './stories';

const { OAuth2Client } = require('google-auth-library');

const bcrypt = require('bcryptjs');

const app: Application = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
dotenv.config();

const { GOOGLE_CLIENT_ID } = process.env;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

async function verifyGoogleToken(token) {
	try {
		const ticket = await client.verifyIdToken({
			idToken: token,
			audience: GOOGLE_CLIENT_ID,
		});

		return { payload: ticket.getPayload() };
	} catch (error) {
		return { error: 'Invalid user detected. Please try again' };
	}
}

app.get('/api/stories', async (req: Request, res: Response) => {
  const stories = await allStories();
  res.status(200).json(stories);
});

app.get('/api/stories/:id', async (req: Request, res: Response) => {
  const storyId = req.params.id;
  const story = await getOneStoryById(storyId);
  res.status(200).json(story);
});

// Get stories by a label id
app.get(
  '/api/stories/getbylabels/:label',
  async (req: Request, res: Response) => {
    const storyLabel = req.params.label;
    const stories = await getStoriesByLabel(storyLabel);
    res.status(200).json(stories);
  },
);

// Get media by media oid
app.get('/api/medias/:id', async (req: Request, res: Response) => {
  const mediaOid = req.params.id;
  const media = await fetchMediasByOid(mediaOid);
  res.status(200).json(media);
});

app.get('/api/users', async (req: Request, res: Response) => {
	const token = req.headers.authorization.split(' ')[1];
	try {
		const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string);
		const user = await getExistingUser(decodedToken.email);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}
		res.status(200).json({
			userId: user.id,
			email: user.email,
			name: user.firstName,
			lastName: user.lastName,
			picture: user.picture,
		});
	} catch (error) {
		res.status(401).json({ message: 'Authorization token invalid' });
	}
});

app.post('/api/users', async (req: Request, res: Response) => {
	const {
 firstName, lastName, email, password,
} = req.body;
	const existingUser = await getExistingUser(email);
	if (existingUser) {
		return res.status(400).json({ message: 'User already exists' });
	}
	const token = await createUser(firstName, lastName, email, password);
	res.status(201).json(token);
});

app.post('/api/google-users', async (req: Request, res: Response) => {
	if (req.body.credential) {
		const verificationResponse = await verifyGoogleToken(req.body.credential);
		if (verificationResponse.error) {
			return res.status(400).json({
				message: verificationResponse.error,
			});
		}
		const profile = verificationResponse?.payload;
		const existingUser = await getExistingUser(profile.email);

		if (existingUser) {
			return res.status(400).json({ message: 'User already exists' });
		}
		const userToken = await createGoogleUser(profile);
		res.status(201).json(userToken);
	}
});

app.post('/api/login', async (req: Request, res: Response) => {
	const { email, password } = req.body;
	try {
		const existingUser = await getExistingUser(email);
		if (!existingUser) {
			return res.status(400).json({ message: 'User name incorrect' });
		}
		const isPasswordCorrect = await bcrypt.compare(
			password,
			existingUser.hashedPassword,
		);
		if (!isPasswordCorrect) {
			return res.status(401).json({ message: 'Password incorrect' });
		}
		const token = jwt.sign({ email }, process.env.JWT_SECRET as string, {
			expiresIn: '2d',
		});
		res.status(200).json(token);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server error' });
	}
});

app.post('/api/login-google', async (req: Request, res: Response) => {
	if (req.body.credential) {
		const verificationResponse = await verifyGoogleToken(req.body.credential);
		if (verificationResponse.error) {
			return res.status(400).json({
				message: verificationResponse.error,
			});
		}
		const profile = verificationResponse?.payload;
		const { email } = profile;
		const token = jwt.sign({ email }, process.env.JWT_SECRET as string, {
			expiresIn: '2d',
		});
		res.status(201).json(token);
	}
});

app.get(
  '/api/reviews_by_user_id/:userId/',
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    const reviews = await getAllUserReviews(userId);
    res.status(200).json(reviews);
  },
);

app.get(
  '/api/reviews_by_story_id/:storyId',
  async (req: Request, res: Response) => {
    const { storyId } = req.params;
    const reviews = await getReviewsByStoryId(storyId);
    res.status(200).json(reviews);
  },
);

app.post('/api/reviews', async (req: Request, res: Response) => {
  const reviewObj = req.body;
  try {
    const review = await createReview(reviewObj);
    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.patch('/api/reviews/:reviewId', async (req: Request, res: Response) => {
  const { reviewId } = req.params;
  const { newContent } = req.body;
  console.log(newContent);
  const review = await updateReview(reviewId, newContent);
  res.status(200).json(review);
});

app.delete('/api/reviews/:reviewId', async (req: Request, res: Response) => {
  const { reviewId } = req.params;
  try {
    await deleteReview(reviewId);
    res.status(200).json({ message: 'Review succesfully deleted!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Fengs working area

// Create a new story
app.post('/api/stories/:storyname', async (req: Request, res: Response) => {
  const storyName = req.params.storyname;
  const response = await generateStory(storyName);
  res.status(200).json(response);
});

// Delete a story
app.delete('/api/stories/:storyid', async (req: Request, res: Response) => {
  const storyId = req.params.storyid;
  const response = await deleteAStory(storyId);
  res.status(200).json(response);
});

// Generate media for a story
app.post(
  '/api/generatemedias/:storyname',
  async (req: Request, res: Response) => {
    const storyName = req.params.storyname;
    const responseGames = await generateGameMedias(storyName);
    const responseMovies = await generateMovieMedias(storyName);
    const responseBooks = await generateBooksMedias(storyName);
    res.status(200).json({ responseGames, responseMovies, responseBooks });
  },
);

// Remove a media from a story
app.delete('/api/removemedias/:storyid/:mediaid', async (req: Request, res: Response) => {
	const { storyid, mediaid } = req.params;
	const response = await removeMediaFromStory(storyid, mediaid);
	res.status(200).json(response);
});

// app.post('/api/generatemedias/games/:storyname', async (req: Request, res: Response) => {
//   const storyName = req.params.storyname;
//   const response = await generateGameMedias(storyName);
//   res
//     .status(200)
//     .json(response);
// });

// app.post('/api/generatemedias/movies/:storyname', async (req: Request, res: Response) => {
//   const storyName = req.params.storyname;
//   const response = await generateMovieMedias(storyName);
//   res
//     .status(200)
//     .json(response);
// });

// app.post('/api/generatemedias/books/:storyname', async (req: Request, res: Response) => {
//   const storyName = req.params.storyname;
//   const response = await generateBooksMedias(storyName);
//   res
//     .status(200)
//     .json(response);
// });

// Get all labels
app.get('/api/labels', async (req: Request, res: Response) => {
  const labels = await getAllLabels();
  res.status(200).json(labels);
});

// Add a new label
app.post('/api/labels/:labelName', async (req: Request, res: Response) => {
  const { labelName } = req.params;
  const response = await addAlabelInDB(labelName);
  res.status(201).json(response);
});

// delete a label from DB, UNUSED
app.delete('/api/labels/:labelName', async (req: Request, res: Response) => {
	const { labelName } = req.params;
	const response = await deleteAlabelInDB(labelName);
	res.status(200).json(response);
});

// Add a label to a story
app.post(
  '/api/labels/:labelName/:storyId',
  async (req: Request, res: Response) => {
    const { labelName, storyId } = req.params;
    const response = await setALabelToAStory(labelName, storyId);
    res.status(200).json(response);
  },
);

// Delete a label from a story
app.delete(
  '/api/labels/:labelName/:storyId',
  async (req: Request, res: Response) => {
    const { labelName, storyId } = req.params;
    const response = await deleteALabelFromAStory(labelName, storyId);
    res.status(200).json(response);
  },
);

// Vote a label to a story
app.post(
  '/api/labels/:labelName/:storyId/:userId',
  async (req: Request, res: Response) => {
    const { labelName, storyId, userId } = req.params;
    const response = await voteALabelToAStory(labelName, storyId, userId);
    res.status(200).json(response);
  },
);

// Fengs working area end

if (require.main === module) {
  app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`App listening on port ${port}`);
}

export = { app };
