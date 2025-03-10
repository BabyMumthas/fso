import 'dotenv/config'; // Load environment variables
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import Person from './models/person.js'; // Import Mongoose model

const app = express();

// ✅ Middleware
app.use(cors()); // Moved before routes
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Handles form data

// ✅ Async error handling wrapper
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// ✅ Connect to MongoDB before starting server
const connectDB = async () => {
    try {console.log("MongoDB URI:", process.env.MONGODB_URI);

        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    }
};

// ✅ Fetch all persons
app.get('/api/persons', asyncHandler(async (req, res) => {
    const persons = await Person.find({});
    res.json(persons);
}));

// ✅ Fetch a person by ID
app.get('/api/persons/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Malformatted ID' });
    }

    const person = await Person.findById(id);
    if (!person) {
        return res.status(404).json({ error: 'Person not found' });
    }

    res.json(person);
}));

// ✅ Add a new person
app.post('/api/persons', asyncHandler(async (req, res) => {
    const { name, number } = req.body;

    if (!name || !number) {
        return res.status(400).json({ error: 'Name and number are required' });
    }

    const existingPerson = await Person.findOne({ name });
    if (existingPerson) {
        return res.status(400).json({ error: 'Name must be unique' });
    }

    const person = new Person({ name, number });
    const savedPerson = await person.save();
    res.status(201).json(savedPerson);
}));

// ✅ Update person's details
app.put('/api/persons/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { number } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Malformatted ID' });
    }

    const updatedPerson = await Person.findByIdAndUpdate(
        id,
        { number },
        { new: true, runValidators: true, context: 'query' } // ✅ Enable validation
    );

    if (!updatedPerson) {
        return res.status(404).json({ error: 'Person not found' });
    }

    res.json(updatedPerson);
}));

// ✅ Delete a person
app.delete('/api/persons/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Malformatted ID' });
    }

    const person = await Person.findByIdAndDelete(id);
    if (!person) {
        return res.status(404).json({ error: 'Person not found' });
    }

    res.status(204).end();
}));

// ✅ Global Error Handler Middleware
app.use((error, req, res, next) => {
    console.error('❌ Error:', error.message);

    if (error.name === 'CastError') {
        return res.status(400).json({ error: 'Malformatted ID' });
    }

    if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: 'Internal Server Error' });
});

// ✅ Start Server After Connecting to MongoDB
const PORT = process.env.PORT || 3001;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
});
