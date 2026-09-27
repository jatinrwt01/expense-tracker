import mongoose from 'mongoose';
const transactionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a transaction title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    amount: {
      type: Number,
      required: [true, 'Please provide an amount'],
      min: [0.01, 'Amount must be greater than zero']
    },
    type: {
      type: String,
      required: true,
      enum: {
        values: ['expense', 'income'],
        message: '{VALUE} is not a valid transaction type'
      },
      default: 'expense'
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: {
        values: [
          'Food',
          'Transport',
          'Bills',
          'Shopping',
          'Entertainment',
          'Education',
          'Salary',
          'Investment',
          'Other'
        ],
        message: '{VALUE} is not a supported category'
      },
      default: 'Other'
    },
    date: {
      type: Date,
      required: [true, 'Please provide a transaction date'],
      default: Date.now
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [250, 'Notes cannot exceed 250 characters'],
      default: ''
    }
  },
  {
    timestamps: true
  }
);

transactionSchema.index({ date: -1 });
transactionSchema.index({ type: 1, date: -1 });
transactionSchema.index({ category: 1 });

export const Transaction = mongoose.model('Transaction', transactionSchema);