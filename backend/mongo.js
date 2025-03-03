import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const args = process.argv;
if (args.length < 3) {
  console.log('Usage: node mongo.js <password> [name] [phone]');
  process.exit(1);
}

const password = args[2];
const name = args[3];
const phone = args[4];

const url = process.env.MONGODB_URI;

mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model('Person', personSchema);

if (name && phone) {
  const person = new Person({ name, number: phone });

  person.save().then(() => {
    console.log(`Added ${name} number ${phone} to phonebook`);
    mongoose.connection.close();
  });
} else {
  Person.find({}).then((result) => {
    console.log('Phonebook:');
    result.forEach((person) => {
      console.log(`${person.name} ${person.number}`);
    });
    mongoose.connection.close();
  });
}
