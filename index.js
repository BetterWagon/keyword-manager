// Keyword feature
import fs from "fs";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

// Initialise localisation
const LOC_ADD_KEYWORD = process.env.ADD_KEYWORD;
const LOC_EDIT_KEYWORD = process.env.EDIT_KEYWORD;
const LOC_REMOVE_KEYWORD = process.env.REMOVE_KEYWORD;
const LOC_LIST_KEYWORDS = process.env.LIST_KEYWORDS;
const LOC_KEYWORD_EXIST = process.env.KEYWORD_EXIST;
const LOC_KEYWORD_NONEXISTANT = process.env.KEYWORD_NONEXISTANT;
const LOC_URL_FETCH_FAIL = process.env.URL_FETCH_FAIL;

// Initialise keywordDB if it ${LOC_KEYWORD_NONEXISTANT}
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
	} else {
		// Echo stored keywords' contents
		const keyword = msg.content;
		if (!keywordDB[msg.room]) {
			return;
		}
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
	const keyword = msg.content.split("::")[0].split(" ").slice(1).join(" ");
	let content = msg.content.split("::")[1];
	const category = msg.content.split("::")[2] || process.env.UNSORTED_CATEGORY;
	const categoryLowerCase = category.toLowerCase();
	if (content.startsWith("http")) {
		if (content.startsWith("https://ctxt.io")) {
			fetch(content)
				.then((response) => response.text())
				.then((html) => {
					const $ = cheerio.load(html);
					const htmlProcess1 = $("div").first().html();
					content = htmlProcess1
						.replace(/<p>/g, "")
						.replace(/<\/p>/g, "")
						.replace(/<div>/g, "")
						.replace(/<\/div>/g, "\n")
						.replace(/<br>/g, "")
						.replace(/<a[^>]*>([^<]+)<\/a>/g, "$1");
					console.log(content);
					if (!keywordDB[msg.room][keyword]) {
						keywordDB[msg.room][keyword] = { content, category: categoryLowerCase };
						fs.writeFileSync(
							"./plugins/keyword-manager/keywordDB.json",
							JSON.stringify(keywordDB, null, 2),
							"utf8"
						);
						msg.reply(`${keyword} ${LOC_ADD_KEYWORD} ${categoryLowerCase}`);
					} else {
						msg.reply(`${keyword} ${LOC_KEYWORD_EXIST}`);
						console.log(keyword);
					}
				})
				.catch((error) => {
					msg.reply(`${LOC_URL_FETCH_FAIL}`);
				});

			return;
		}
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
					msg.reply(`${keyword} ${LOC_ADD_KEYWORD} ${categoryLowerCase}`);
				} else {
					msg.reply(`${keyword} ${LOC_KEYWORD_EXIST}`);
				}
			})
			.catch((error) => {
				msg.reply(`${LOC_URL_FETCH_FAIL}`);
			});
	} else {
		if (!keywordDB[msg.room][keyword]) {
			keywordDB[msg.room][keyword] = { content, category: categoryLowerCase };
			fs.writeFileSync(
				"./plugins/keyword-manager/keywordDB.json",
				JSON.stringify(keywordDB, null, 2),
				"utf8"
			);
			msg.reply(`${keyword} ${LOC_ADD_KEYWORD} ${categoryLowerCase}`);
		} else {
			msg.reply(`${keyword} ${LOC_KEYWORD_EXIST}`);
		}
	}

	// Reload keywordDB from file
	keywordDB = JSON.parse(
		fs.readFileSync("./plugins/keyword-manager/keywordDB.json", "utf8")
	);
}

function editKeyword(msg) {
	// msg.content = "/add newKeyword::New Content That Is Pretty Long::Category"
	const keyword = msg.content.split("::")[0].split(" ").slice(1).join(" ");
	let content = msg.content.split("::")[1];
	const category = msg.content.split("::")[2] || "unsorted";
	const categoryLowerCase = category.toLowerCase();
	if (content.startsWith("http")) {
		if (content.startsWith("https://ctxt.io")) {
			fetch(content)
				.then((response) => response.text())
				.then((html) => {
					const $ = cheerio.load(html);
					const htmlProcess1 = $("div").first().html();
					content = htmlProcess1
						.replace(/<p>/g, "")
						.replace(/<\/p>/g, "")
						.replace(/<div>/g, "")
						.replace(/<\/div>/g, "\n")
						.replace(/<br>/g, "")
						.replace(/<a[^>]*>([^<]+)<\/a>/g, "$1");
					console.log(content);
					if (keywordDB[msg.room][keyword]) {
						keywordDB[msg.room][keyword] = { content, category: categoryLowerCase };
						fs.writeFileSync(
							"./plugins/keyword-manager/keywordDB.json",
							JSON.stringify(keywordDB, null, 2),
							"utf8"
						);
						msg.reply(`${keyword} ${LOC_EDIT_KEYWORD} ${categoryLowerCase}`);
					} else {
						msg.reply(`${keyword} ${LOC_KEYWORD_NONEXISTANT}`);
					}
				})
				.catch((error) => {
					msg.reply(`${LOC_URL_FETCH_FAIL}`);
				});

			return;
		}
		fetch(content)
			.then((response) => response.text())
			.then((html) => {
				content = html
					.replace(/<[^>]*>/g, "")
					.replace(/<style[^>]*>.*<\/style>/gm, "")
					.replace(/<script[^>]*>.*<\/script>/gm, ""); // Get only body of HTML
				if (keywordDB[msg.room][keyword]) {
					keywordDB[msg.room][keyword] = { content, category: categoryLowerCase };
					fs.writeFileSync(
						"./plugins/keyword-manager/keywordDB.json",
						JSON.stringify(keywordDB, null, 2),
						"utf8"
					);
					msg.reply(`${keyword} ${LOC_EDIT_KEYWORD} ${categoryLowerCase}`);
				} else {
					msg.reply(`${keyword} ${LOC_KEYWORD_NONEXISTANT}`);
				}
			})
			.catch((error) => {
				msg.reply(`${LOC_URL_FETCH_FAIL}`);
			});
	} else {
		if (keywordDB[msg.room][keyword]) {
			keywordDB[msg.room][keyword] = { content, category: categoryLowerCase };
			fs.writeFileSync(
				"./plugins/keyword-manager/keywordDB.json",
				JSON.stringify(keywordDB, null, 2),
				"utf8"
			);
			msg.reply(`${keyword} ${LOC_EDIT_KEYWORD} ${categoryLowerCase}`);
		} else {
			msg.reply(`${keyword} ${LOC_KEYWORD_NONEXISTANT}`);
		}
	}

	// Reload keywordDB from file
	keywordDB = JSON.parse(
		fs.readFileSync("./plugins/keyword-manager/keywordDB.json", "utf8")
	);
}

function removeKeyword(msg) {
	// msg.content = "/remove keyword"
	const keyword = msg.content.split("::")[0].split(" ").slice(1).join(" ");
	if (keywordDB[msg.room][keyword]) {
		delete keywordDB[msg.room][keyword];
		fs.writeFileSync(
			"./plugins/keyword-manager/keywordDB.json",
			JSON.stringify(keywordDB, null, 2),
			"utf8"
		);
		msg.reply(`${keyword} ${LOC_REMOVE_KEYWORD}`);
	} else {
		msg.reply(`${keyword} ${LOC_KEYWORD_NONEXISTANT}`);
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

	let replyMessage = LOC_LIST_KEYWORDS + "\n\n" + "\u200b".repeat(500);
	sortedCategories.forEach((category) => {
		replyMessage += `# ${
			category.charAt(0).toUpperCase() + category.slice(1)
		} : \n${categories[category].join("\n")}\n\n`;
	});

	msg.reply(replyMessage);
}
