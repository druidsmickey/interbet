const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const Item = require('./model/data');
const Winners = require('./model/winners');

const router = express.Router();
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
//app.use(bodyParser.json());
app.use(cors());


// MongoDB connection
const mongoUri = process.env.MONGODB_URI;
mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/items', async (req, res) => {
  const items = await Item.find();
  res.json(items);
  console.log('Items fetched:', items); // Log the fetched items
});

app.get('/winners', async (req, res) => {
  const winners = await Winners.find();
  res.json(winners);
  console.log('Winners fetched:', winners); // Log the fetched winners
});

app.delete('/items', async (req, res) => {
  try {
    await Item.deleteMany({});
    res.status(200).json({ message: 'All data deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete all data.' });
  }
});

app.delete('/winners', async (req, res) => {
  try {
    await Winners.deleteMany({});
    // Insert default winners for raceNum 1 to 8
    const defaultWinners = [];
    for (let i = 1; i <= 8; i++) {
      defaultWinners.push({
        raceNum: i,
        // Add other default fields as needed, e.g.:
        specialNum: [],
        rule4Num: [],
        rule4Deduction: 0
      });
    }
    await Winners.insertMany(defaultWinners);
    res.status(200).json({ message: 'All data deleted and default winners inserted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete all data.' });
  }
});

app.post('/winners', async (req, res) => {
  try {
    console.log('POST /winners body:', req.body); // Log incoming body

    // Accept both camelCase and lowercase for rule4Deduction
    const {
      raceNum,
      winNum,
      specialNum,
      rule4Num,
      rule4Deduction
    } = req.body;

    // Validate required fields
    if (
      raceNum === undefined ||
      winNum === undefined ||
      specialNum === undefined ||
      rule4Num === undefined ||
      rule4Deduction === undefined
    ) {
      console.error('Missing required fields:', req.body);
      return res.status(400).send({ message: 'Missing required fields', body: req.body });
    }

    // Optional: Validate data types (assuming all should be numbers)
    if (
      typeof raceNum !== 'number' ||
      !Array.isArray(winNum) ||
      !Array.isArray(specialNum) ||
      !Array.isArray(rule4Num) ||
      typeof rule4Deduction !== 'number'
    ) {
      console.error('Invalid data types:', req.body);
      return res.status(400).send({ message: 'Invalid data types', body: req.body });
    }

    const existingWinner = await Winners.findOne({ raceNum });
    if (existingWinner) {
      // Update all relevant fields
      existingWinner.winNum = winNum;
      existingWinner.specialNum = specialNum;
      existingWinner.rule4Num = rule4Num;
      existingWinner.rule4Deduction = rule4Deduction;
      await existingWinner.save();
      res.status(200).send({ message: 'Winner updated successfully' });
    } else {
      // Save a new record
      const newWinner = new Winners({
        raceNum,
        winNum,
        specialNum,
        rule4Num,
        rule4Deduction
      });
      await newWinner.save();
      res.status(201).send({ message: 'Winner saved successfully' });
    }
  } catch (error) {
    console.error('Error saving/updating winner:', error);
    res.status(500).send({ message: 'Failed to save/update winner', error: error.message, stack: error.stack });
  }
});

app.post('/items', async (req, res) => {
  const newItem = new Item(req.body);
  const savedItem = await newItem.save();
  res.json(savedItem);
});

app.put('/items/special/:id', async (req, res) => {
  try {
    const { special } = req.body;
    if (typeof special !== 'number') {
      return res.status(400).json({ error: 'Invalid special value' });
    }

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      { special },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    console.log('Updated item special:', updatedItem);
    res.status(200).json(updatedItem);
  } catch (error) {
    console.error('Error updating item special:', error);
    res.status(500).json({ error: 'Failed to update item special' });
  }
});

app.put('/items/cancelspecial/:id', async (req, res) => {
  try {
    const { special } = req.body;
    if (typeof special !== 'number') {
      return res.status(400).json({ error: 'Invalid special value' });
    }

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      { special },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    console.log('Updated item special:', updatedItem);
    res.status(200).json(updatedItem);
  } catch (error) {
    console.error('Error updating item special:', error);
    res.status(500).json({ error: 'Failed to update item special' });
  }
});

app.put('/items/:id', async (req, res) => {
  try {
    const { cancel } = req.body; // Extract the cancel value from the request body
    if (typeof cancel !== 'number') {
      return res.status(400).json({ error: 'Invalid cancel value' });
    }

    // Update the item's cancel value in the database
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      { cancel },
      { new: true } // Return the updated document
    );

    if (!updatedItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    console.log('Updated item:', updatedItem); // Log the updated item
    res.status(200).json(updatedItem); // Send the updated item as the response
  } catch (error) {
    console.error('Error updating item:', error); // Log error details
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = router;
