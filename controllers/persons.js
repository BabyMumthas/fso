const express = require('express');
const Person = require('../models/person');
const router = express.Router();

// Create a new person
router.post('/api/persons', async (req, res, next) => {
  const { name, number } = req.body;

  const person = new Person({ name, number });

  try {
    const savedPerson = await person.save();
    res.json(savedPerson);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
