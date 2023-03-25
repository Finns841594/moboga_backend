/* eslint-disable max-len */
import express, { Request, Response, Application } from 'express';
import cors from 'cors';
import {
  allStories, getOneStoryById, getStoriesByLabel, fetchMediasByOid, generateStory,
  generateGameMedias, generateMovieMedias,
} from './stories';

const app: Application = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.get('/api/stories', async (req: Request, res: Response) => {
  const stories = await allStories();
  res
    .status(200)
    .json(stories);
});

app.get('/api/stories/:id', async (req: Request, res: Response) => {
  const storyId = Number(req.params.id);
  const story = await getOneStoryById(storyId);
  res
    .status(200)
    .json(story);
});

app.get('/api/stories/labels/:label', async (req: Request, res: Response) => {
  const storyLabel = req.params.label;
  const stories = await getStoriesByLabel(storyLabel);
  res
    .status(200)
    .json(stories);
});

app.get('/api/medias/:id', async (req: Request, res: Response) => {
  const mediaOid = req.params.id;
  const media = await fetchMediasByOid(mediaOid);
  res
    .status(200)
    .json(media);
});

// Fengs working area
app.post('/api/stories/:storyname', async (req: Request, res: Response) => {
  const storyName = req.params.storyname;
  const response = await generateStory(storyName);
  res
    .status(200)
    .json(response);
});

app.post('/api/generatemedias/games/:storyname', async (req: Request, res: Response) => {
  const storyName = req.params.storyname;
  const response = await generateGameMedias(storyName);
  res
    .status(200)
    .json(response);
});

app.post('/api/generatemedias/movies/:storyname', async (req: Request, res: Response) => {
  const storyName = req.params.storyname;
  const response = await generateMovieMedias(storyName);
  res
    .status(200)
    .json(response);
});
// Fengs working area

if (require.main === module) {
  app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`App listening on port ${port}`);
}

export = { app };
