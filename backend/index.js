import 'dotenv/config'; // Load environment variables from .env
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

const app = express();

// Middleware
app.use(express.json());
app.use(express.static('dist'))
app.use(cors());


// MongoDB Connection (Fixed)
const mongoUrl = process.env.MONGODB_URI || 'your-mongodb-connection-string';

if (!mongoUrl) {
    console.error("❌ MONGODB_URI is missing! Check your .env file.");
    process.exit(1);
}

mongoose.connect(mongoUrl, {
    useNewUrlParser: true,  // ✅ Fixes deprecated warning
    useUnifiedTopology: true,
    writeConcern: { w: "majority", wtimeout: 5000 } 
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// Define Schema & Model
const personSchema = new mongoose.Schema({
    name: { type: String, required: true },
    number: { type: String, required: true },
});

const Person = mongoose.model('Person', personSchema);

// Function to validate MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Async Error Handling Wrapper
const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// ✅ /info Route
app.get('/info', async (req, res) => {
    const count = await Person.countDocuments({});
    const date = new Date();
    res.send(`
        <p>Phonebook has info for ${count} people.</p>
        <p>${date}</p>
    `);
});


// ✅ Get all persons
app.get('/api/persons', asyncHandler(async (req, res) => {
    const persons = await Person.find({});
    res.json(persons);
}));

// ✅ Get a single person by ID with ID validation
app.get('/api/persons/:id', asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }

    const person = await Person.findById(id);
    if (person) {
        res.json(person);
    } else {
        res.status(404).json({ error: 'Person not found' });
    }
}));

// ✅ Add a new person
app.post('/api/persons', asyncHandler(async (req, res) => {
    const { name, number } = req.body;

    if (!name || !number) {
        return res.status(400).json({ error: 'Name or number missing' });
    }

    const existingPerson = await Person.findOne({ name });
    if (existingPerson) {
        return res.status(400).json({ error: 'Name must be unique' });
    }

    const person = new Person({ name, number });
    const savedPerson = await person.save();
    res.status(201).json(savedPerson);
}));

// ✅ Delete a person with ID validation
app.delete('/api/persons/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }

    const person = await Person.findByIdAndDelete(id);
    if (!person) {
        return res.status(404).json({ error: 'Person not found' });
    }
    res.status(204).end();
}));

// Global Error Handling Middleware
app.use((error, req, res, next) => {
    console.error("❌ Error:", error.message);
    if (error.name === 'CastError') {
        return res.status(400).json({ error: 'Malformatted ID' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
});

// Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
