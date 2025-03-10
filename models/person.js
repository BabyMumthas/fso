import mongoose from 'mongoose';

// Custom validator function for phone numbers
const phoneNumberValidator = (number) => {
  // Regex to validate phone number format (e.g., 09-1234556 or 040-22334455)
  const phoneRegex = /^\d{2,3}-\d+$/;
  return phoneRegex.test(number) && number.length >= 8;
};

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    minlength: [3, 'Name must be at least 3 characters long'],
  },
  number: {
    type: String,
    required: [true, 'Phone number is required'],
    validate: {
      validator: phoneNumberValidator,
      message: (props) => `${props.value} is not a valid phone number! Must be in the format XX-XXXXXXX or XXX-XXXXXXXX.`,
    },
  },
});

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

export default mongoose.model('Person', personSchema);
