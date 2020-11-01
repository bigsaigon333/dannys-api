const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();

app.use(
	cors({ origin: JSON.parse(process.env.ORIGIN), optionsSuccessStatus: 200 })
);

const SmbRouter = require("./router/SmbRouter.js");

(async function () {
	try {
		await mongoose.connect(process.env.MONGODB_URL, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useFindAndModify: false,
		});
		console.log("mongoose connection in try");

		const db = mongoose.connection;
		db.on("error", (error) => console.error(error));
		db.once("open", () => console.log("mongoose connection is established"));
		console.log("after dbInit");

		app.use(express.json());
		app.use(express.urlencoded({ extended: false }));
		app.use(morgan("dev"));
		app.use(helmet());

		app.use("/smb", SmbRouter);
		app.use((req, res) => {
			// res.status(404).sendFile(path.resolve(__dirname, "src", "404.html"));
			res.status(404).send("Error");
		});
		app.listen(process.env.PORT || 5500, () =>
			console.log("Server is listening")
		);
	} catch (error) {
		console.error(error);
	}
})();
