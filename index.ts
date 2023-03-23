import express, { Request, Response, Application } from 'express';
import {
  allStories,
} from './stories';
// import { getProductById } from './products';

const app: Application = express();
const port = 3000;
app.use(express.json());

// Don't change the code above this line!
// Write your enpoints here

app.get('/api/stories', async (req: Request, res: Response) => {
  const stories = await allStories();
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
