// Test script to verify sermon parsing
import fs from "fs";

// Copy the parseSermonFile function here for testing
function parseSermonFile(content, id) {
  const lines = content.split("\n");
  const sermon = {
    id,
    type: "sermon",
    scriptures: [],
    mainMessagePoints: [], // Initialize message points array
  };

  let section = "";
  for (const line of lines) {
    console.log(`Processing line: "${line}"`);

    if (line.startsWith("#")) {
      section = line.slice(1).trim(); // Add trim() here
      console.log(`  New section: "${section}"`);
      continue;
    }

    if (!line.includes(":")) {
      console.log(`  Skipping line without colon: "${line}"`);
      continue;
    }

    const [key, ...valueParts] = line.split(":");
    const value = valueParts.join(":").trim(); // Rejoin with : to preserve any : in the value
    console.log(
      `  Key: "${key.trim()}", Value: "${value}", Section: "${section}"`
    );

    switch (section) {
      case "METADATA":
        switch (key.trim()) {
          case "TITLE":
            sermon.title = value;
            break;
          case "PREACHER":
            sermon.preacher = value;
            break;
          case "DATE":
            sermon.date = value;
            break;
          case "CREATED_AT":
            sermon.createdAt = value;
            break;
          case "UPDATED_AT":
            sermon.updatedAt = value;
            break;
          case "BACKGROUND_IMAGE":
            sermon.backgroundImage = value || undefined;
            break;
        }
        break;
      case "SCRIPTURES":
        if (key.trim().startsWith("SCRIPTURE_")) {
          sermon.scriptures?.push({ text: value });
        }
        break;
      case "CONTENT":
        switch (key.trim()) {
          case "MAIN_MESSAGE":
            console.log(`    Setting mainMessage: ${value}`);
            sermon.mainMessage = value;
            break;
          case "QUOTE":
            console.log(`    Setting quote: ${value}`);
            sermon.quote = value;
            break;
        }
        // Handle message points
        console.log(
          `    Checking if "${key.trim()}" starts with "MESSAGE_POINT_": ${key
            .trim()
            .startsWith("MESSAGE_POINT_")}`
        );
        if (key.trim().startsWith("MESSAGE_POINT_")) {
          console.log(`    Adding message point: ${value}`);
          sermon.mainMessagePoints?.push({ text: value });
        }
        break;
    }
  }

  return sermon;
}

// Test the parsing
const content = fs.readFileSync("./test_sermon.txt", "utf8");
console.log("File content:");
console.log(content);
console.log("\n--- Parsing ---\n");

const parsed = parseSermonFile(content, "test123");

console.log("Parsed sermon:");
console.log(JSON.stringify(parsed, null, 2));
console.log("\nMessage points:");
console.log(parsed.mainMessagePoints);
