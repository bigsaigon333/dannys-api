const express = require("express");
const Blog = require("../model/Blog.js");

const router = new express.Router();

router.post("/new.json", async (req, res) => {
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

router.put("/:id/edit.json", async (req, res) => {
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

router.delete("/:id/delete.json", async (req, res) => {
	const { id } = req.params;
	try {
		const Post = await Blog.findByIdAndRemove(id);
		res.json({ success: "Delete succeed!" });
	} catch (error) {
		res.status(400).json({ error: "Something goes wrong" + error });
	}
});

router.get("/blog_list.json", async (req, res) => {
	try {
		const Blogs = await Blog.find({}).sort({ createdAt: "desc" });
		res.json(Blogs);
	} catch (error) {
		res.status(400).json({ error: "Something goes wrong" + error });
	}
});

router.get("/blog_list.json/:id", async (req, res) => {
	const { id } = req.params;
	try {
		const Post = await Blog.findById(id);
		res.json(Post);
	} catch (error) {
		res.status(400).json({ error: "Something goes wrong" + error });
	}
});

module.exports = router;
