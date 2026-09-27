import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema(
  {
    month: {
      type: String,
      required: [true, 'Month identifier is required in YYYY-MM format'],
      unique: true,
      trim: true,
      match: [/^\d{4}-(0[1-9]|1[0-2])$/, 'Please provide a valid month format (YYYY-MM)']
    },
    amount: {
      type: Number,
      required: [true, 'Budget amount is required'],
      min: [1, 'Budget must be at least 1']
    }
  },
  {
    timestamps: true
  }
);
export const Budget = mongoose.model('Budget', budgetSchema);