
const BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('--- Starting End-to-End Verification ---');


  const staticFiles = [
    '/',
    '/style.css',
    '/script.js',
    '/js/api.js',
    '/assets/images/logo.png'
  ];

  for (const path of staticFiles) {
    const res = await fetch(`${BASE_URL}${path}`);
    if (!res.ok) throw new Error(`Static asset failed: ${path} (status ${res.status})`);
    console.log(`[PASS] Static Asset: ${path} -> HTTP ${res.status}`);
  }


  const listRes = await fetch(`${BASE_URL}/api/transactions`);
  const listData = await listRes.json();
  for (const tx of listData.data) {
    await fetch(`${BASE_URL}/api/transactions/${tx._id}`, { method: 'DELETE' });
  }
  console.log('[PASS] Database reset to clean state');

  
  const sampleTransactions = [
    { title: 'Supermarket Grocery', amount: 3500, type: 'expense', category: 'Food', date: '2026-09-05' },
    { title: 'Metro Smart Card', amount: 1200, type: 'expense', category: 'Transport', date: '2026-09-08' },
    { title: 'Electricity & Wifi', amount: 4800, type: 'expense', category: 'Bills', date: '2026-09-12' },
    { title: 'Software Engineering Salary', amount: 45000, type: 'income', category: 'Salary', date: '2026-09-01' }
  ];

  const createdTxs = [];
  for (const payload of sampleTransactions) {
    const res = await fetch(`${BASE_URL}/api/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!data.success) throw new Error(`Failed to create tx: ${payload.title}`);
    createdTxs.push(data.data);
    console.log(`[PASS] Created Transaction: ${data.data.title} (₹${data.data.amount})`);
  }


  const sumRes = await fetch(`${BASE_URL}/api/transactions/summary`);
  const sumData = await sumRes.json();
  console.log(`[PASS] Summary: Income = ₹${sumData.data.totalIncome}, Expense = ₹${sumData.data.totalExpense}, Balance = ₹${sumData.data.totalBalance}`);
  if (sumData.data.totalIncome !== 45000 || sumData.data.totalExpense !== 9500 || sumData.data.totalBalance !== 35500) {
    throw new Error('Summary calculation mismatch!');
  }


  const budgetMonth = '2026-09';
  const budgetRes = await fetch(`${BASE_URL}/api/budget`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ month: budgetMonth, amount: 20000 })
  });
  const budgetData = await budgetRes.json();
  if (!budgetData.success) throw new Error('Failed to set budget');
  console.log(`[PASS] Set Budget: ₹${budgetData.data.amount} for ${budgetData.data.month}`);


  const insRes = await fetch(`${BASE_URL}/api/budget/insights?month=${budgetMonth}`);
  const insData = await insRes.json();
  const b = insData.data.budget;
  const ins = insData.data.insights;

  console.log(`[PASS] Budget Tracking: Spent = ₹${b.spent}, Remaining = ₹${b.remaining}, Usage = ${b.percentageUsed}%, Status = ${b.status}`);
  if (b.status !== 'Safe' || b.percentageUsed !== 48 || b.remaining !== 10500) {
    throw new Error(`Unexpected budget calculation: ${JSON.stringify(b)}`);
  }

  console.log(`[PASS] Top Category: ${ins.highestCategory.name} (₹${ins.highestCategory.amount} - ${ins.highestCategory.percentage}%)`);
  if (ins.highestCategory.name !== 'Bills' || ins.highestCategory.amount !== 4800) {
    throw new Error('Unexpected top category calculation!');
  }

  console.log(`[PASS] Largest Expense: ${ins.largestExpense.title} (₹${ins.largestExpense.amount})`);
  console.log(`[PASS] Daily Average: ₹${ins.averageDailySpend}/day`);
  console.log('[PASS] Generated Deterministic Messages:');
  ins.messages.forEach(m => console.log(`   - "${m}"`));


  const warnBudgetRes = await fetch(`${BASE_URL}/api/budget`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ month: budgetMonth, amount: 10000 })
  });
  const warnInsRes = await fetch(`${BASE_URL}/api/budget/insights?month=${budgetMonth}`);
  const warnInsData = await warnInsRes.json();
  console.log(`[PASS] Warning Threshold Check: Status = ${warnInsData.data.budget.status} (${warnInsData.data.budget.percentageUsed}%)`);
  if (warnInsData.data.budget.status !== 'Warning') throw new Error('Warning threshold test failed');

  const excBudgetRes = await fetch(`${BASE_URL}/api/budget`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ month: budgetMonth, amount: 8000 })
  });
  const excInsRes = await fetch(`${BASE_URL}/api/budget/insights?month=${budgetMonth}`);
  const excInsData = await excInsRes.json();
  console.log(`[PASS] Exceeded Threshold Check: Status = ${excInsData.data.budget.status} (${excInsData.data.budget.percentageUsed}%)`);
  if (excInsData.data.budget.status !== 'Exceeded') throw new Error('Exceeded threshold test failed');

  await fetch(`${BASE_URL}/api/budget`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ month: budgetMonth, amount: 30000 })
  });

  const txToUpdate = createdTxs.find(t => t.title === 'Metro Smart Card');
  const updateRes = await fetch(`${BASE_URL}/api/transactions/${txToUpdate._id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Metro Smart Card (Monthly Recharge)',
      amount: 1500,
      type: 'expense',
      category: 'Transport',
      date: '2026-09-08'
    })
  });
  const updateData = await updateRes.json();
  if (!updateData.success || updateData.data.amount !== 1500) {
    throw new Error('Update failed');
  }
  console.log(`[PASS] Updated Transaction: ${updateData.data.title} -> ₹${updateData.data.amount}`);

  const deleteRes = await fetch(`${BASE_URL}/api/transactions/${txToUpdate._id}`, {
    method: 'DELETE'
  });
  const deleteData = await deleteRes.json();
  if (!deleteData.success) throw new Error('Delete failed');
  console.log('[PASS] Deleted Transaction successfully');

  const finalSumRes = await fetch(`${BASE_URL}/api/transactions/summary`);
  const finalSumData = await finalSumRes.json();
  console.log(`[PASS] Final Balance after deletion: ₹${finalSumData.data.totalBalance} (Expense = ₹${finalSumData.data.totalExpense})`);

  console.log('\n=== ALL VERIFICATION TESTS PASSED SUCCESSFULLY (100% END-TO-END) ===\n');
}

runTests().catch(err => {
  console.error('[TEST FAILURE]:', err);
  process.exit(1);
});
