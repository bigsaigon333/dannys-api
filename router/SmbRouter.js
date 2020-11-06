const express = require("express");
const Blog = require("../model/Blog.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const router = new express.Router();
let refreshTokens = [];

router.get("/", async (req, res) => {
	try {
		const Blogs = await Blog.find({}).sort({ createdAt: "desc" });
		res.json(Blogs);
	} catch (error) {
		res.status(400).json({ error: "Something goes wrong" + error });
	}
});

router.post("/", authenticateToken, authorize, async (req, res) => {
	if (req.body === {}) {
		res.status(400).json({ error: "There is no content in request body" });
		return;
	}

	try {
		const { title, description } = req.body;
		const newBlog = new Blog({ title, description });
		await newBlog.save();
		res.json({ success: "success!!" });
	} catch (error) {
		res.status(400).json(error);
	}
});

router.delete("/logout", (req, res) => {
	const refreshToken = req.body.token;
	if (refreshToken == null) return res.sendStatus(401);

	refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

	res.status(200).json({ success: "Logout Success" });
});

router.post("/silent_refresh", (req, res) => {
	const refreshToken = req.body.token;
	if (refreshToken == null) return res.sendStatus(401);

	if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);

	jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
		if (err) return res.sendStatus(403);
		const accessToken = generateAccessToken({ name: user.name });
		res.json({ accessToken });
	});
});

router.post("/login", (req, res) => {
	// Authenticate User

	const username = req.body.username;
	const password = req.body.password;

	if (
		username !== process.env.ADMIN_USERNAME ||
		password !== process.env.ADMIN_PASSWORD
	) {
		return res.sendStatus(401);
	}

	const user = { name: username };
	const accessToken = generateAccessToken(user);
	const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
	refreshTokens.push(refreshToken);

	res.json({ accessToken, refreshToken });
});

function generateAccessToken(user) {
	return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
}

function authenticateToken(req, res, next) {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];

	if (token == null) return res.sendStatus(401);

	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
		if (err) return res.sendStatus(403);

		req.user = user;
		console.log(user);
		next();
	});
}

function authorize(req, res, next) {
	if (req.user.name !== process.env.ADMIN_USERNAME) return res.sendStatus(403);

	console.log(req.user, process.env.ADMIN_USERNAME);
	next();
}

router.get("/:id", async (req, res) => {
	const { id } = req.params;
	try {
		const Post = await Blog.findById(id);
		res.json(Post);
	} catch (error) {
		res.status(400).json({ error: "Something goes wrong" + error });
	}
});

router.put("/:id", authenticateToken, authorize, async (req, res) => {
	const { id } = req.params;
	const { title, description } = req.body;
	try {
		const Post = await Blog.findByIdAndUpdate(id, {
			title,
			description,
			lastEditedAt: Date.now(),
		});
		res.json({ success: "Update succeed!" });
	} catch (error) {
		res.status(400).json({ error: "Something goes wrong" + error });
	}
});

router.delete("/:id", authenticateToken, authorize, async (req, res) => {
	const { id } = req.params;
	try {
		const Post = await Blog.findByIdAndRemove(id);
		res.json({ success: "Delete succeed!" });
	} catch (error) {
		res.status(400).json({ error: "Something goes wrong" + error });
	}
});

module.exports = router;
