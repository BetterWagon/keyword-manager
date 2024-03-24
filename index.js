// Keyword feature
const fs = require('fs');

function addKeyword(input) {
    const [keyword, content] = input.split('::');
    const newData = {
        keyword: keyword.trim(),
        content: content.trim()
    };

    fs.readFile('keywordDB.json', 'utf8', (err, jsonString) => {
        if (err) {
            console.log("Error reading file from disk:", err);
            return;
        }
        try {
            const keywordDB = JSON.parse(jsonString);
            keywordDB.push(newData);
            fs.writeFile('keywordDB.json', JSON.stringify(keywordDB, null, 2), 'utf8', (err) => {
                if (err) {
                    console.log("Error writing file:", err);
                    return;
                }
				msg.replyText(newData.keyword + " has been added!");
                console.log("Keyword content added successfully!");
            });
        } catch (err) {
            console.log('Error parsing JSON string:', err);
        }
    });
}

function editKeyword(input) {
    const [keyword, content] = input.split('::');
    const updatedData = {
        keyword: keyword.trim(),
        content: content.trim()
    };

    fs.readFile('keywordDB.json', 'utf8', (err, jsonString) => {
        if (err) {
            console.log("Error reading file from disk:", err);
            return;
        }
        try {
            let keywordDB = JSON.parse(jsonString);
            const index = keywordDB.findIndex(item => item.keyword === keyword.trim());
            if (index !== -1) {
                keywordDB[index] = updatedData;
                fs.writeFile('keywordDB.json', JSON.stringify(keywordDB, null, 2), 'utf8', (err) => {
                    if (err) {
                        console.log("Error writing file:", err);
                        return;
                    }
				msg.replyText(updatedData.keyword + " has been updated!");
                    console.log("Keyword content updated successfully!");
                });
            } else {
                console.log("Keyword not found for editing.");
            }
        } catch (err) {
            console.log('Error parsing JSON string:', err);
        }
    });
}

function removeKeyword(keyword) {
    fs.readFile('keywordDB.json', 'utf8', (err, jsonString) => {
        if (err) {
            console.log("Error reading file from disk:", err);
            return;
        }
        try {
            let keywordDB = JSON.parse(jsonString);
            const index = keywordDB.findIndex(item => item.keyword === keyword);
            if (index !== -1) {
                keywordDB.splice(index, 1);
                fs.writeFile('keywordDB.json', JSON.stringify(keywordDB, null, 2), 'utf8', (err) => {
                    if (err) {
                        console.log("Error writing file:", err);
                        return;
                    }
					msg.replyText(keyword + " has been removed!");
                    console.log("Keyword removed successfully!");
                });
            } else {
                console.log("Keyword not found for removal.");
            }
        } catch (err) {
            console.log('Error parsing JSON string:', err);
        }
    });
}

function listKeywords(msg) {
    if (msg.content === "/keywords") {
        fs.readFile('keywordDB.json', 'utf8', (err, jsonString) => {
            if (err) {
                console.log("Error reading file from disk:", err);
                return;
            }
            try {
                let keywordDB = JSON.parse(jsonString);
                const keywordsList = keywordDB.map(item => item.keyword);
                const replyMsg = "Keywords: " + keywordsList.join(", ");
                msg.replyText(replyMsg);
            } catch (err) {
                console.log('Error parsing JSON string:', err);
            }
        });
    }
}
