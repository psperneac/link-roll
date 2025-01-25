// MongoDB Playground
// https://www.mongodb.com/docs/mongodb-vscode/playgrounds/
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
use("linkroll");

const items = db.getCollection("items").find({});
console.log('%O', items);