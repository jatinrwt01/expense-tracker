const VALID_CATEGORIES = [
  'Food',
  'Transport',
  'Bills',
  'Shopping',
  'Entertainment',
  'Education',
  'Salary',
  'Investment',
  'Other'
];

export const validateTransaction = (req, res, next) => {
  const { title, amount, type, category, date } = req.body;
  const errors = [];

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.push('Title is required and must not be empty');
  } else if (title.trim().length > 100) {
    errors.push('Title cannot exceed 100 characters');
  }

  const parsedAmount = Number(amount);
  if (amount === undefined || amount === null || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    errors.push('Amount must be a positive number greater than 0');
  }

  if (type && !['expense', 'income'].includes(type.toLowerCase())) {
    errors.push("Type must be either 'expense' or 'income'");
  }

  if (category && !VALID_CATEGORIES.includes(category)) {
    errors.push(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }

  if (date) {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      errors.push('Invalid date format provided');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors
    });
  }

  req.body.title = title.trim();
  req.body.amount = parsedAmount;
  req.body.type = (type || 'expense').toLowerCase();
  req.body.category = category || 'Other';
  req.body.notes = req.body.notes ? req.body.notes.trim() : '';

  next();
};

export const validateBudget = (req, res, next) => {
  const { month, amount } = req.body;
  const errors = [];

if (!month || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    errors.push('Month is required in valid YYYY-MM format (e.g. 2026-09)');
}

  const parsedAmount = Number(amount);
  if (amount === undefined || amount === null || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    errors.push('Budget amount must be a positive number greater than 0');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors
    });
  }

  req.body.amount = parsedAmount;
  next();
};