const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const path = require('path');
const { exec } = require('child_process');
app.use(express.static(path.join(__dirname, 'public')));
const uri = "mongodb+srv://vilasraodeshmukh790:7y2tfCvIBDuMYElv@cluster0.jeuiczz.mongodb.net/?retryWrites=true&w=majority";
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use((req, res, next) => {
  res.locals.showPopup = req.query.loginFailed === 'true';
  next();
});
app.get('/', (req, res) => {
  res.redirect('/login');
});
app.get('/signup', (req, res) => {
  res.render('signup');
});
app.get('/login', (req, res) => {
  res.render('login', { showPopup: res.locals.showPopup });
});
app.post('/signup', async (req, res) => {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();
    const collection = client.db("Cluster0").collection("users");
    const { username, password } = req.body;
    await collection.insertOne({ username, password });
    res.send('Account created successfully!');
  } catch (error) {
    console.error(error);
    res.send('An error occurred.');
  } finally {
    await client.close();
  }
});
app.post('/login', async (req, res) => {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();
    const collection = client.db("Cluster0").collection("users");
    const { username, password } = req.body;
    const user = await collection.findOne({ username, password });
    if (user) {
      res.redirect('/home');
    } else {
      res.redirect('/login?loginFailed=true');
    }
  } catch (error) {
    console.error(error);
    res.send('An error occurred.');
  } finally {
    await client.close();
  }
});
app.get('/get-stream-url', (req, res) => {
  const { songName } = req.query;
  exec(`python main.py "${songName}"`, { cwd: __dirname }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing Python script: ${error}`);
      res.status(500).send('Error executing Python script.');
    } else {
      const streamUrl = stdout.trim();
      if (streamUrl) {
        res.send(streamUrl);
      } else {
        res.status(500).send('Failed to fetch audio stream.');
      }
    }
  });
});
app.get('/home', (req, res) => {
  res.render('home');
});
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
