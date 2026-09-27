import { Budget } from '../models/Budget.js';
import { calculateBudgetInsights } from '../services/insightService.js';


export const getBudget = async (req, res, next) => {
  try {
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const month = req.query.month || currentMonthStr;

    const budget = await Budget.findOne({ month });

    res.status(200).json({
      success: true,
      data: budget || { month, amount: 0, isSet: false }
    });
  } catch (error) {
    next(error);
  }
};

export const setBudget = async (req, res, next) => {
  try {
    const { month, amount } = req.body;

    const budget = await Budget.findOneAndUpdate(
      { month },
      { amount },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: `Budget of ₹${amount.toLocaleString('en-IN')} set for ${month}`,
      data: budget
    });
  } catch (error) {
    next(error);
  }
};

export const getBudgetInsights = async (req, res, next) => {
  try {
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const month = req.query.month || currentMonthStr;

    const insightsData = await calculateBudgetInsights(month);

    res.status(200).json({
      success: true,
      data: insightsData
    });
  } catch (error) {
    next(error);
  }
};

