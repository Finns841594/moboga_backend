import express, { Request, Response, Application } from 'express';
import cors from 'cors';
import {
  allStories, getOneStoryById, getOneStoryByLabel,
} from './stories';

// import { getProductById } from './products';

const app: Application = express();
const port = 3000;

app.use(express.json());
app.use(cors());

// Don't change the code above this line!
// Write your enpoints here

app.get('/api/stories', async (req: Request, res: Response) => {
  const stories = await allStories();
  res
    .status(200)
    .json(stories);
});

app.get('/api/stories/:id', async (req: Request, res: Response) => {
  const storyId = req.params.id;
  const story = await getOneStoryById(storyId);
  res
    .status(200)
    .json(story);
});

app.get('/api/stories/:label', async (req: Request, res: Response) => {
  const storyLabel = req.params.label;
  const story = await getOneStoryByLabel(storyLabel);
  res
    .status(200)
    .json(story);
});

// Don't change the code below this line!
if (require.main === module) {
  app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`App listening on port ${port}`);
}

export = { app };
