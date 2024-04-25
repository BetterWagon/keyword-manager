// Keyword feature
import fs from "fs";
import fetch from "node-fetch";

// Initialise keywordDB if it does not exist
if (!fs.existsSync("./plugins/keyword-manager/keywordDB.json")) {
	fs.writeFileSync("./plugins/keyword-manager/keywordDB.json", "{}", "utf8");
}

// Load keywordDB from file
let keywordDB = JSON.parse(
	fs.readFileSync("./plugins/keyword-manager/keywordDB.json", "utf8")
);

// Prevent spamming
let lastReplyTime = 0;

export function processKeyword(msg) {
	const currentTime = new Date().getTime();
	if (currentTime - lastReplyTime < 1000) {
		return;
	}
	checkRoomInDB(msg);
	if (msg.content.startsWith(process.env.KEYWORD_ADD)) {
		addKeyword(msg);
		lastReplyTime = currentTime;
	} else if (msg.content.startsWith(process.env.KEYWORD_EDIT)) {
		editKeyword(msg);
		lastReplyTime = currentTime;
	} else if (msg.content.startsWith(process.env.KEYWORD_REMOVE)) {
		removeKeyword(msg);
		lastReplyTime = currentTime;
	} else if (msg.content.startsWith(process.env.KEYWORD_LIST)) {
		listKeywords(msg);
		lastReplyTime = currentTime;
	} else if (msg.content.startsWith("crawl")) {
		fetch("https://raw.githubusercontent.com/KakaoSCV/KakaoSCV/master/LICENSE.md")
			.then((response) => response.text())
			.then((data) => {
				msg.reply(data);
			})
			.catch((error) => {
				console.error("Error fetching data:", error);
			});
	} else {
		// Echo stored keywords' contents
		const keyword = msg.content;
		if (keywordDB[msg.room][keyword]) {
			msg.reply(keywordDB[msg.room][keyword].content);
			lastReplyTime = currentTime;
		}
	}
}

function checkRoomInDB(msg) {
	if (keywordDB[msg.room]) {
		return;
	}

	keywordDB[msg.room] = {};
	fs.writeFileSync(
		"./plugins/keyword-manager/keywordDB.json",
		JSON.stringify(keywordDB, null, 2),
		"utf8"
	);

	// Reload keywordDB from file
	keywordDB = JSON.parse(
		fs.readFileSync("./plugins/keyword-manager/keywordDB.json", "utf8")
	);
}

function addKeyword(msg) {
	// msg.content = "/add newKeyword::New Content That Is Pretty Long::Category"
	const keyword = msg.content.split("::")[0].split(" ")[1];
	let content = msg.content.split("::")[1];
	const category = msg.content.split("::")[2] || "unsorted";
	const categoryLowerCase = category.toLowerCase();
	if (content.startsWith("http")) {
		fetch(content)
			.then((response) => response.text())
			.then((html) => {
				content = html
					.replace(/<[^>]*>/g, "")
					.replace(/<style[^>]*>.*<\/style>/gm, "")
					.replace(/<script[^>]*>.*<\/script>/gm, ""); // Strip HTML, CSS and JavaScript
				if (!keywordDB[msg.room][keyword]) {
					keywordDB[msg.room][keyword] = { content, category: categoryLowerCase };
					fs.writeFileSync(
						"./plugins/keyword-manager/keywordDB.json",
						JSON.stringify(keywordDB, null, 2),
						"utf8"
					);
					msg.reply(`${keyword} has been added with category ${categoryLowerCase}`);
				} else {
					msg.reply(`${keyword} already exists`);
				}
			})
			.catch((error) => {
				msg.reply(`Failed to fetch URL for ${keyword} keyword! Aborting action.`);
			});
	} else {
		if (!keywordDB[msg.room][keyword]) {
			keywordDB[msg.room][keyword] = { content, category: categoryLowerCase };
			fs.writeFileSync(
				"./plugins/keyword-manager/keywordDB.json",
				JSON.stringify(keywordDB, null, 2),
				"utf8"
			);
			msg.reply(`${keyword} has been added with category ${categoryLowerCase}`);
		} else {
			msg.reply(`${keyword} already exists`);
		}
	}

	// Reload keywordDB from file
	keywordDB = JSON.parse(
		fs.readFileSync("./plugins/keyword-manager/keywordDB.json", "utf8")
	);
}

function editKeyword(msg) {
	// msg.content = "/add newKeyword::New Content That Is Pretty Long::Category"
	const keyword = msg.content.split("::")[0].split(" ")[1];
	let content = msg.content.split("::")[1];
	const category = msg.content.split("::")[2] || "unsorted";
	const categoryLowerCase = category.toLowerCase();
	if (content.startsWith("http")) {
		fetch(content)
			.then((response) => response.text())
			.then((html) => {
				content = html.replace(/<[^>]*>/g, "");
				if (keywordDB[msg.room][keyword]) {
					keywordDB[msg.room][keyword] = { content, category: categoryLowerCase };
					fs.writeFileSync(
						"./plugins/keyword-manager/keywordDB.json",
						JSON.stringify(keywordDB, null, 2),
						"utf8"
					);
					msg.reply(
						`${keyword} has been updated with category ${categoryLowerCase}`
					);
				} else {
					msg.reply(`${keyword} does not exist`);
				}
			})
			.catch((error) => {
				msg.reply(`Failed to fetch URL for ${keyword} keyword! Aborting action.`);
			});
	} else {
		if (keywordDB[msg.room][keyword]) {
			keywordDB[msg.room][keyword] = { content, category: categoryLowerCase };
			fs.writeFileSync(
				"./plugins/keyword-manager/keywordDB.json",
				JSON.stringify(keywordDB, null, 2),
				"utf8"
			);
			msg.reply(`${keyword} has been updated with category ${categoryLowerCase}`);
		} else {
			msg.reply(`${keyword} does not exist`);
		}
	}

	// Reload keywordDB from file
	keywordDB = JSON.parse(
		fs.readFileSync("./plugins/keyword-manager/keywordDB.json", "utf8")
	);
}

function removeKeyword(msg) {
	// msg.content = "/remove keyword"
	const keyword = msg.content.split(" ")[1];
	if (keywordDB[msg.room][keyword]) {
		delete keywordDB[msg.room][keyword];
		fs.writeFileSync(
			"./plugins/keyword-manager/keywordDB.json",
			JSON.stringify(keywordDB, null, 2),
			"utf8"
		);
		msg.reply(`${keyword} has been removed`);
	} else {
		msg.reply(`${keyword} does not exist`);
	}

	// Reload keywordDB from file
	keywordDB = JSON.parse(
		fs.readFileSync("./plugins/keyword-manager/keywordDB.json", "utf8")
	);
}

function listKeywords(msg) {
	// Sample JSON : { "keyword": { "content": "content", "category": "category" }
	const keywordDB = JSON.parse(
		fs.readFileSync("./plugins/keyword-manager/keywordDB.json", "utf8")
	);
	const categories = {};

	Object.keys(keywordDB[msg.room]).forEach((keyword) => {
		const { category } = keywordDB[msg.room][keyword];
		if (!categories[category]) {
			categories[category] = [];
		}
		categories[category].push(keyword);
	});

	const sortedCategories = Object.keys(categories).sort(); // Sort categories alphabetically

	let replyMessage = "Keyword List\n\n" + "\u200b".repeat(500);
	sortedCategories.forEach((category) => {
		replyMessage += `# ${
			category.charAt(0).toUpperCase() + category.slice(1)
		} : \n${categories[category].join("\n")}\n\n`;
	});

	msg.reply(replyMessage);
}
