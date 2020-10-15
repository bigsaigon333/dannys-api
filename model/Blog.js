const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	createdAt: {
		type: Date,
		required: true,
		default: Date.now,
	},
	lastEditedAt: {
		type: Date,
		default: Date.now,
	},
	description: {
		type: String,
		required: true,
	},
});

module.exports = mongoose.model("blog", blogSchema);
