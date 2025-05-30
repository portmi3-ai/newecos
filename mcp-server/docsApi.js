const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());

const API_KEY = process.env.DOCS_API_KEY || 'changeme';
let docs = {};
let docId = 1;

// List all docs
app.get('/api/docs', (req, res) => {
  res.json(Object.values(docs));
});

// Get doc by id
app.get('/api/docs/:id', (req, res) => {
  const doc = docs[req.params.id];
  if (!doc) return res.status(404).json({ error: 'Not found' });
  res.json(doc);
});

// Upload or update doc
app.post('/api/docs/upload', (req, res) => {
  const key = req.headers['x-api-key'] || req.query.api_key;
  if (key !== API_KEY) return res.status(401).json({ error: 'Invalid API key' });
  const { filename, path, content } = req.body;
  if (!filename || !content) return res.status(400).json({ error: 'Missing fields' });
  const id = docId++;
  docs[id] = { id, filename, path, content };
  res.json({ success: true, id });
});

app.listen(PORT, () => {
  console.log(`Docs API running on port ${PORT}`);
}); 