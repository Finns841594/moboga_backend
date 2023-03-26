import express, { Request, Response, Application } from 'express';
import cors from 'cors';
import {
	allStories,
	getOneStoryById,
	getStoriesByLabel,
	fetchMediasByOid,
	createUser,
	getExistingUser,
} from './stories';
import jwt from 'jsonwebtoken';
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

app.post('/api/register', async (req: Request, res: Response) => {
	const { firstName, lastName, email, password } = req.body;
	const existingUser = await getExistingUser(email);
	if (existingUser) {
		return res.status(400).json({ message: 'User already exists' });
	} else {
		await createUser(firstName, lastName, email, password);
		const token = jwt.sign({ email }, process.env.JWT_SECRET as string, {
			expiresIn: '1h',
		});
		res.status(200).json(token);
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
			existingUser.hashedPassword
		);
		if (!isPasswordCorrect) {
			return res.status(401).json({ message: 'Password incorrect' });
		}
		const token = jwt.sign({ email }, process.env.JWT_SECRET as string, {
			expiresIn: '1h',
		});

		res.status(200).json(token);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server error' });
	}
});

// Fengs working area

// Fengs working area

if (require.main === module) {
	app.listen(port);
	// eslint-disable-next-line no-console
	console.log(`App listening on port ${port}`);
}

export = { app };
