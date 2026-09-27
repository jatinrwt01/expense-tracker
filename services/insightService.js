import { Transaction } from "../models/Transaction.js";
import { Budget } from "../models/Budget.js";


export const calculateBudgetInsights = async (targetMonth) => {
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthStr = targetMonth || currentMonthStr;

  const [yearStr, monthNumStr] = monthStr.split('-');
  const year = parseInt(yearStr, 10);
  const monthIndex = parseInt(monthNumStr, 10) - 1; 

  const startOfMonth = new Date(year, monthIndex, 1, 0, 0, 0, 0);
  const endOfMonth = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);


  const startOfPrevMonth = new Date(year, monthIndex - 1, 1, 0, 0, 0, 0);
  const endOfPrevMonth = new Date(year, monthIndex, 0, 23, 59, 59, 999);

  const currentMonthExpenses = await Transaction.find({
    type: 'expense',
    date: { $gte: startOfMonth, $lte: endOfMonth }
  }).sort({ amount: -1 });

  const prevMonthExpenses = await Transaction.find({
    type: 'expense',
    date: { $gte: startOfPrevMonth, $lte: endOfPrevMonth }
  });

  const budgetDoc = await Budget.findOne({ month: monthStr });
  const budgetAmount = budgetDoc ? budgetDoc.amount : null;


  const totalSpent = currentMonthExpenses.reduce((sum, t) => sum + t.amount, 0);
  const previousMonthTotal = prevMonthExpenses.reduce((sum, t) => sum + t.amount, 0);

  const remaining = budgetAmount !== null ? budgetAmount - totalSpent : null;
  const percentageUsed = budgetAmount ? Math.round((totalSpent / budgetAmount) * 100) : 0;

  let budgetStatus = 'Not Set';
  if (budgetAmount !== null) {
    if (percentageUsed < 75) {
      budgetStatus = 'Safe';
    } else if (percentageUsed <= 100) {
      budgetStatus = 'Warning';
    } else {
      budgetStatus = 'Exceeded';
    }
  }

  const categoryTotals = {};
  currentMonthExpenses.forEach((t) => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  let highestCategory = null;
  let maxCatAmount = 0;
  for (const [cat, amt] of Object.entries(categoryTotals)) {
    if (amt > maxCatAmount) {
      maxCatAmount = amt;
      highestCategory = {
        name: cat,
        amount: amt,
        percentage: totalSpent > 0 ? Math.round((amt / totalSpent) * 100) : 0
      };
    }
  }

  const largestExpense = currentMonthExpenses.length > 0
    ? {
        title: currentMonthExpenses[0].title,
        amount: currentMonthExpenses[0].amount,
        category: currentMonthExpenses[0].category,
        date: currentMonthExpenses[0].date
      }
    : null;

  const isCurrentCalendarMonth =
    now.getFullYear() === year && now.getMonth() === monthIndex;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const daysElapsed = isCurrentCalendarMonth
    ? Math.max(1, now.getDate())
    : daysInMonth;

  const averageDailySpend = Math.round(totalSpent / daysElapsed);

  let monthOverMonthChange = null;
  if (previousMonthTotal > 0) {
    monthOverMonthChange = Number(
      (((totalSpent - previousMonthTotal) / previousMonthTotal) * 100).toFixed(1)
    );
  }

  const messages = [];

  if (budgetAmount !== null) {
    if (budgetStatus === 'Safe') {
      messages.push(
        `You have used ${percentageUsed}% of your monthly budget (₹${totalSpent.toLocaleString('en-IN')} of ₹${budgetAmount.toLocaleString('en-IN')}) — spending is comfortably on track.`
      );
    } else if (budgetStatus === 'Warning') {
      messages.push(
        `Warning: You have used ${percentageUsed}% of your monthly budget. Only ₹${Math.max(0, remaining).toLocaleString('en-IN')} remains.`
      );
    } else {
      messages.push(
        `Alert: You have exceeded your monthly budget by ₹${Math.abs(remaining).toLocaleString('en-IN')} (${percentageUsed}% used).`
      );
    }
  } else {
    messages.push(
      'No monthly budget set yet. Set a spending limit to track utilization and get pace alerts.'
    );
  }

  if (highestCategory) {
    messages.push(
      `${highestCategory.name} accounts for ${highestCategory.percentage}% of your spending this month (₹${highestCategory.amount.toLocaleString('en-IN')}).`
    );
  } else {
    messages.push('No expenses recorded for this month yet.');
  }

  if (monthOverMonthChange !== null) {
    if (monthOverMonthChange < 0) {
      messages.push(`Your spending is ${Math.abs(monthOverMonthChange)}% lower than last month.`);
    } else if (monthOverMonthChange > 0) {
      messages.push(`Your spending is ${monthOverMonthChange}% higher than last month.`);
    } else {
      messages.push('Your spending is identical to last month.');
    }
  } else if (largestExpense) {
    messages.push(
      `Your largest single expense this month was '${largestExpense.title}' at ₹${largestExpense.amount.toLocaleString('en-IN')}.`
    );
  }

  if (totalSpent > 0) {
    messages.push(
      `You are spending an average of ₹${averageDailySpend.toLocaleString('en-IN')}/day over ${daysElapsed} days.`
    );
  }

  return {
    month: monthStr,
    budget: {
      amount: budgetAmount,
      spent: totalSpent,
      remaining,
      percentageUsed,
      status: budgetStatus
    },
    insights: {
      highestCategory,
      largestExpense,
      averageDailySpend,
      daysElapsed,
      currentMonthTotal: totalSpent,
      previousMonthTotal,
      monthOverMonthChange,
      categoryTotals,
      messages
    }
  };
};

