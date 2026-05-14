const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const db = new Database(path.join(__dirname, 'votes.db'));

app.use(express.json());
app.use(express.static(__dirname));

const createTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    option TEXT NOT NULL
  )
`);
createTable.run();

const insertVote = db.prepare('INSERT INTO votes (option) VALUES (?)');
const getVoteCounts = db.prepare('SELECT option, COUNT(*) AS count FROM votes GROUP BY option');
const deleteAllVotes = db.prepare('DELETE FROM votes');

app.post('/vote', (req, res) => {
  const { option } = req.body;

  if (!option || typeof option !== 'string') {
    return res.status(400).json({ error: 'option is required' });
  }

  insertVote.run(option);
  res.status(201).json({ success: true });
});

app.get('/votes', (req, res) => {
  const votes = getVoteCounts.all();
  res.json(votes);
});

app.delete('/votes', (req, res) => {
  deleteAllVotes.run();
  res.json({ success: true, message: 'All votes have been deleted' });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
