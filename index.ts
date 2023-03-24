import express, { Request, Response, Application } from 'express';
import cors from 'cors';
import {
  allStories, getOneStoryById, getStoriesByLabel,
} from './stories';

const app: Application = express();
const port = 3000;

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

// Don't change the code below this line!
if (require.main === module) {
  app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`App listening on port ${port}`);
}

export = { app };
