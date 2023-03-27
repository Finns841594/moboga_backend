/* eslint-disable max-len */
import express, { Request, Response, Application } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import {
  allStories,
  getOneStoryById,
  getStoriesByLabel,
  fetchMediasByOid,
  createUser,
  getExistingUser,
  createReview,
  generateStory,
  generateGameMedias, generateMovieMedias, generateBooksMedias,
} from './stories';

const bcrypt = require('bcryptjs');

const app: Application = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.get('/api/stories', async (req: Request, res: Response) => {
  const stories = await allStories();
  res.status(200).json(stories);
});

app.get('/api/stories/:id', async (req: Request, res: Response) => {
  const storyId = Number(req.params.id);
  const story = await getOneStoryById(storyId);
  res.status(200).json(story);
});

app.get('/api/stories/labels/:label', async (req: Request, res: Response) => {
  const storyLabel = req.params.label;
  const stories = await getStoriesByLabel(storyLabel);
  res.status(200).json(stories);
});

app.get('/api/medias/:id', async (req: Request, res: Response) => {
  const mediaOid = req.params.id;
  const media = await fetchMediasByOid(mediaOid);
  res.status(200).json(media);
});

app.get('/api/users', async (req: Request, res: Response) => {
  const token = req.headers.authorization.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Authorization token missing' });
  }
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
    });
  } catch (error) {
    console.error(error);
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
  res.status(200).json(token);
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
      expiresIn: '48h',
    });
    res.status(200).json(token);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// app.get('/api/reviews', async (req: Request, res: Response) => {
// 	const {userId} = req.body;
// 	const reviews = await getAllUserReviews(userId);
// 	res.status(200).json(reviews);
// });

app.post('/api/reviews', async (req: Request, res: Response) => {
  const {
    content, rating, mediaId, name, userId,
  } = req.body;
  try {
    const review = await createReview(mediaId, content, rating, name, userId);
    res.status(200).json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Fengs working area
app.post('/api/stories/:storyname', async (req: Request, res: Response) => {
  const storyName = req.params.storyname;
  const response = await generateStory(storyName);
  res
    .status(200)
    .json(response);
});

app.post('/api/generatemedias/:storyname', async (req: Request, res: Response) => {
  const storyName = req.params.storyname;
  const responseGames = await generateGameMedias(storyName);
  const responseMovies = await generateMovieMedias(storyName);
  const responseBooks = await generateBooksMedias(storyName);
  res
    .status(200)
    .json({ responseGames, responseMovies, responseBooks });
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
// Fengs working area

if (require.main === module) {
  app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`App listening on port ${port}`);
}

export = { app };
