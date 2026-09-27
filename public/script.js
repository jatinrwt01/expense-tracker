
let transactions = [];
let expenseChart = null;
let editingTransactionId = null;
let currentFilterType = '';

const getTodayDateStr = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getCurrentMonthStr = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

let activeMonthStr = getCurrentMonthStr();

const formatCurrency = (num) => {
  const val = Number(num) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(val);
};

const form = document.getElementById('expense-form');
const formHeading = document.getElementById('form-heading');
const titleInput = document.getElementById('expense-title');
const amountInput = document.getElementById('amount');
const categorySelect = document.getElementById('category');
const dateInput = document.getElementById('date');
const notesInput = document.getElementById('notes');
const submitBtn = document.getElementById('submit-form');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

const titleError = document.getElementById('title-error');
const amountError = document.getElementById('amount-error');
const dateError = document.getElementById('date-error');

const transactionListEl = document.querySelector('.transaction-list');
const txCountLabel = document.getElementById('tx-count-label');
const txFilterType = document.getElementById('tx-filter-type');

const totalBalanceEl = document.getElementById('total-balance');
const totalIncomeEl = document.getElementById('total-income');
const totalExpenseEl = document.getElementById('total-expense');
const cardMonthlyBudgetEl = document.getElementById('card-monthly-budget');
const cardBudgetRemainingText = document.getElementById('card-budget-remaining-text');
const budgetStatusBadge = document.getElementById('budget-status-badge');

const budgetProgressBar = document.getElementById('budget-progress-bar');
const budgetSpentVal = document.getElementById('budget-spent-val');
const budgetRemainingVal = document.getElementById('budget-remaining-val');
const budgetPctVal = document.getElementById('budget-pct-val');
const budgetMonthLabel = document.getElementById('budget-month-label');

const insightTopCat = document.getElementById('insight-top-cat');
const insightDailyAvg = document.getElementById('insight-daily-avg');
const insightLargestExp = document.getElementById('insight-largest-exp');
const insightMessagesEl = document.getElementById('insight-messages');

const budgetModal = document.getElementById('budget-modal');
const quickBudgetBtn = document.getElementById('quick-budget-btn');
const editBudgetBtn = document.getElementById('edit-budget-btn');
const closeBudgetModalBtn = document.getElementById('close-budget-modal');
const cancelBudgetBtn = document.getElementById('cancel-budget-btn');
const budgetForm = document.getElementById('budget-form');
const budgetMonthInput = document.getElementById('budget-month-input');
const budgetAmountInput = document.getElementById('budget-amount-input');
const budgetModalError = document.getElementById('budget-modal-error');

const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

const typeExpenseLabel = document.getElementById('type-expense-label');
const typeIncomeLabel = document.getElementById('type-income-label');


document.addEventListener('DOMContentLoaded', async () => {
  initializeTheme();
  setDefaultFormValues();
  setupEventListeners();
  await syncAppData();
});

function setDefaultFormValues() {
  if (dateInput) dateInput.value = getTodayDateStr();
  if (budgetMonthInput) budgetMonthInput.value = activeMonthStr;
}

function setupEventListeners() {
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }

  document.querySelectorAll('input[name="transaction-type"]').forEach((radio) => {
    radio.addEventListener('change', (e) => {
      const isExpense = e.target.value === 'expense';
      typeExpenseLabel.classList.toggle('active', isExpense);
      typeIncomeLabel.classList.toggle('active', !isExpense);

      if (!isExpense && categorySelect.value === 'Food') {
        categorySelect.value = 'Salary';
      } else if (isExpense && categorySelect.value === 'Salary') {
        categorySelect.value = 'Food';
      }
    });
  });

  if (txFilterType) {
    txFilterType.addEventListener('change', async (e) => {
      currentFilterType = e.target.value;
      await loadTransactions();
    });
  }

  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }

  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', cancelEditing);
  }

  if (quickBudgetBtn) quickBudgetBtn.addEventListener('click', openBudgetModal);
  if (editBudgetBtn) editBudgetBtn.addEventListener('click', openBudgetModal);
  if (closeBudgetModalBtn) closeBudgetModalBtn.addEventListener('click', closeBudgetModal);
  if (cancelBudgetBtn) cancelBudgetBtn.addEventListener('click', closeBudgetModal);

  if (budgetForm) {
    budgetForm.addEventListener('submit', handleBudgetSubmit);
  }

  const navTransactions = document.getElementById('nav-transactions');
  if (navTransactions) {
    navTransactions.addEventListener('click', () => {
      document.querySelector('.transactions').scrollIntoView({ behavior: 'smooth' });
    });
  }
  const navAnalytics = document.getElementById('nav-analytics');
  if (navAnalytics) {
    navAnalytics.addEventListener('click', () => {
      document.querySelector('.analytics').scrollIntoView({ behavior: 'smooth' });
    });
  }
  const navBudget = document.getElementById('nav-budget');
  if (navBudget) {
    navBudget.addEventListener('click', () => {
      document.querySelector('.budget-insights-section').scrollIntoView({ behavior: 'smooth' });
    });
  }
}

async function syncAppData() {
  try {
    await Promise.all([
      loadTransactions(),
      loadSummary(),
      loadBudgetAndInsights()
    ]);
  } catch (err) {
    console.error('Error syncing app data:', err);
    showToast('Could not sync data with server', 'error');
  } finally {
    if (window.lucide) lucide.createIcons();
  }
}

async function loadTransactions() {
  try {
    const params = {};
    if (currentFilterType) params.type = currentFilterType;

    const res = await API.getTransactions(params);
    transactions = res.data || [];
    renderTransactions();
  } catch (err) {
    console.error('Error loading transactions:', err);
  }
}

async function loadSummary() {
  try {
    const res = await API.getTransactionSummary();
    const data = res.data || { totalBalance: 0, totalIncome: 0, totalExpense: 0, categoryExpenses: {} };
    renderSummaryCards(data);
    renderChart(data.categoryExpenses);
  } catch (err) {
    console.error('Error loading summary:', err);
  }
}

async function loadBudgetAndInsights() {
  try {
    const res = await API.getBudgetInsights(activeMonthStr);
    const data = res.data;
    renderBudgetProgress(data.budget, data.month);
    renderInsights(data.insights);
  } catch (err) {
    console.error('Error loading budget insights:', err);
  }
}


function renderTransactions() {
  transactionListEl.innerHTML = '';
  txCountLabel.textContent = `${transactions.length} record${transactions.length === 1 ? '' : 's'}`;

  if (transactions.length === 0) {
    transactionListEl.innerHTML = `
      <div class="empty-state">
        <i data-lucide="receipt" style="width: 36px; height: 36px; stroke-width: 1.5;"></i>
        <h3>No transactions found</h3>
        <p>Use the form to log your first income or expense.</p>
      </div>
    `;
    return;
  }

  transactions.forEach((tx) => {
    const item = document.createElement('li');
    item.className = 'transaction-item';

    const isExpense = tx.type === 'expense';
    const amountPrefix = isExpense ? '- ' : '+ ';
    const formattedAmount = `${amountPrefix}${formatCurrency(tx.amount)}`;

    let dateStr = tx.date;
    try {
      const d = new Date(tx.date);
      dateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      dateStr = tx.date;
    }

    item.innerHTML = `
      <div class="transaction-info">
        <h4>${escapeHTML(tx.title)}</h4>
        <p>
          <span class="category-tag">${escapeHTML(tx.category)}</span>
          <span>•</span>
          <span>${dateStr}</span>
          ${tx.notes ? `<span>• <small>${escapeHTML(tx.notes)}</small></span>` : ''}
        </p>
      </div>
      <div class="transaction-actions">
        <span class="tx-amount ${isExpense ? 'expense' : 'income'}">${formattedAmount}</span>
        <button class="btn-icon edit-btn" title="Edit Transaction" data-id="${tx._id}">
          <i data-lucide="edit-2"></i>
        </button>
        <button class="btn-icon delete delete-btn" title="Delete Transaction" data-id="${tx._id}">
          <i data-lucide="trash-2"></i>
        </button>
      </div>
    `;
    item.querySelector('.edit-btn').addEventListener('click', () => startEditing(tx));
    item.querySelector('.delete-btn').addEventListener('click', () => confirmDelete(tx._id));

    transactionListEl.appendChild(item);
  });
}

function renderSummaryCards(summary) {
  totalBalanceEl.textContent = formatCurrency(summary.totalBalance);
  totalIncomeEl.textContent = formatCurrency(summary.totalIncome);
  totalExpenseEl.textContent = formatCurrency(summary.totalExpense);

  if (summary.totalBalance < 0) {
    totalBalanceEl.classList.add('text-danger');
    totalBalanceEl.classList.remove('text-success');
  } else {
    totalBalanceEl.classList.add('text-success');
    totalBalanceEl.classList.remove('text-danger');
  }
}

function renderBudgetProgress(budget, monthStr) {
  if (!budget) return;

  const monthObj = new Date(`${monthStr}-01`);
  const monthName = isNaN(monthObj.getTime())
    ? monthStr
    : monthObj.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  budgetMonthLabel.textContent = monthName;

  if (budget.amount && budget.amount > 0) {
    cardMonthlyBudgetEl.textContent = formatCurrency(budget.amount);
    budgetSpentVal.textContent = formatCurrency(budget.spent);
    budgetRemainingVal.textContent = formatCurrency(budget.remaining);
    budgetPctVal.textContent = `${budget.percentageUsed}%`;

    budgetStatusBadge.textContent = budget.status;
    budgetStatusBadge.className = 'badge';

    budgetProgressBar.className = 'budget-progress-fill';
    budgetProgressBar.style.width = `${Math.min(100, Math.max(0, budget.percentageUsed))}%`;

    if (budget.status === 'Safe') {
      budgetStatusBadge.classList.add('badge-safe');
      budgetProgressBar.classList.add('safe');
      cardBudgetRemainingText.textContent = `${formatCurrency(budget.remaining)} left to spend`;
      budgetRemainingVal.className = 'stat-value text-success';
    } else if (budget.status === 'Warning') {
      budgetStatusBadge.classList.add('badge-warning');
      budgetProgressBar.classList.add('warning');
      cardBudgetRemainingText.textContent = `Pacing alert: ${formatCurrency(budget.remaining)} left`;
      budgetRemainingVal.className = 'stat-value text-danger';
    } else {
      budgetStatusBadge.classList.add('badge-exceeded');
      budgetProgressBar.classList.add('exceeded');
      cardBudgetRemainingText.textContent = `Exceeded by ${formatCurrency(Math.abs(budget.remaining))}`;
      budgetRemainingVal.className = 'stat-value text-danger';
    }
  } else {
    cardMonthlyBudgetEl.textContent = '₹0.00';
    budgetSpentVal.textContent = formatCurrency(budget.spent);
    budgetRemainingVal.textContent = '₹0.00';
    budgetPctVal.textContent = '0%';
    budgetProgressBar.style.width = '0%';

    budgetStatusBadge.textContent = 'Not Set';
    budgetStatusBadge.className = 'badge badge-notset';
    cardBudgetRemainingText.textContent = 'Click "Set Budget" to configure';
  }
}

function renderInsights(insights) {
  if (!insights) return;

  if (insights.highestCategory) {
    insightTopCat.textContent = `${insights.highestCategory.name} (${insights.highestCategory.percentage}%)`;
  } else {
    insightTopCat.textContent = 'None';
  }

  insightDailyAvg.textContent = `${formatCurrency(insights.averageDailySpend)}/day`;

  if (insights.largestExpense) {
    insightLargestExp.textContent = formatCurrency(insights.largestExpense.amount);
    insightLargestExp.title = `${insights.largestExpense.title} (${insights.largestExpense.category})`;
  } else {
    insightLargestExp.textContent = '₹0';
  }
  insightMessagesEl.innerHTML = '';
  if (insights.messages && insights.messages.length > 0) {
    insights.messages.forEach((msg) => {
      const li = document.createElement('li');
      li.innerHTML = `<i data-lucide="check-circle-2"></i> <span>${escapeHTML(msg)}</span>`;
      insightMessagesEl.appendChild(li);
    });
  } else {
    insightMessagesEl.innerHTML = '<li><i data-lucide="info"></i> Add expenses to generate spending trends.</li>';
  }
}

function renderChart(categoryExpenses = {}) {
  const ctx = document.getElementById('expense-chart');
  const emptyState = document.getElementById('chart-empty-state');
  const legendSummary = document.getElementById('chart-legend-summary');

  const categories = Object.keys(categoryExpenses).filter((c) => categoryExpenses[c] > 0);
  const values = categories.map((c) => categoryExpenses[c]);

  if (categories.length === 0) {
    if (expenseChart) expenseChart.destroy();
    ctx.style.display = 'none';
    if (emptyState) emptyState.style.display = 'flex';
    if (legendSummary) legendSummary.innerHTML = '';
    return;
  }

  ctx.style.display = 'block';
  if (emptyState) emptyState.style.display = 'none';

  const chartColors = [
    '#10B981', '#3B82F6', '#F59E0B', '#EF4444',
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#64748B'
  ];

  if (expenseChart) {
    expenseChart.destroy();
  }

  const isDarkMode = document.body.classList.contains('dark-mode');
  const textColor = isDarkMode ? '#F8FAFC' : '#0F172A';

  expenseChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: categories,
      datasets: [
        {
          data: values,
          backgroundColor: chartColors.slice(0, categories.length),
          borderWidth: 2,
          borderColor: isDarkMode ? '#1E293B' : '#FFFFFF'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: textColor,
            font: { family: "'Plus Jakarta Sans', sans-serif", size: 12, weight: '500' },
            padding: 12
          }
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || '';
              const value = context.parsed || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
              return ` ${label}: ${formatCurrency(value)} (${percentage}%)`;
            }
          }
        }
      },
      cutout: '70%'
    }
  });
}

async function handleFormSubmit(e) {
  e.preventDefault();

  if (!validateTransactionForm()) return;

  const selectedType = document.querySelector('input[name="transaction-type"]:checked').value;
  const payload = {
    title: titleInput.value.trim(),
    amount: parseFloat(amountInput.value),
    type: selectedType,
    category: categorySelect.value,
    date: dateInput.value || getTodayDateStr(),
    notes: notesInput ? notesInput.value.trim() : ''
  };

  submitBtn.disabled = true;

  try {
    if (editingTransactionId === null) {
      await API.createTransaction(payload);
      showToast('Transaction added successfully!', 'success');
    } else {
      await API.updateTransaction(editingTransactionId, payload);
      showToast('Transaction updated successfully!', 'success');
      cancelEditing();
    }

    form.reset();
    setDefaultFormValues();
    document.querySelector('input[name="transaction-type"][value="expense"]').checked = true;
    typeExpenseLabel.classList.add('active');
    typeIncomeLabel.classList.remove('active');

    await syncAppData();
  } catch (err) {
    showToast(err.message || 'Error saving transaction', 'error');
  } finally {
    submitBtn.disabled = false;
  }
}

function startEditing(tx) {
  editingTransactionId = tx._id;
  titleInput.value = tx.title;
  amountInput.value = tx.amount;
  categorySelect.value = tx.category;

  if (tx.date) {
    const d = new Date(tx.date);
    dateInput.value = d.toISOString().split('T')[0];
  }

  if (notesInput) notesInput.value = tx.notes || '';

  const isExpense = tx.type === 'expense';
  document.querySelector(`input[name="transaction-type"][value="${tx.type}"]`).checked = true;
  typeExpenseLabel.classList.toggle('active', isExpense);
  typeIncomeLabel.classList.toggle('active', !isExpense);

  formHeading.textContent = 'Edit Transaction';
  submitBtn.querySelector('span').textContent = 'Update Transaction';
  cancelEditBtn.style.display = 'flex';

  form.scrollIntoView({ behavior: 'smooth' });
}

function cancelEditing() {
  editingTransactionId = null;
  formHeading.textContent = 'Add Transaction';
  submitBtn.querySelector('span').textContent = 'Add Transaction';
  cancelEditBtn.style.display = 'none';
  clearErrors();
  form.reset();
  setDefaultFormValues();
}

async function confirmDelete(id) {
  if (confirm('Are you sure you want to delete this transaction?')) {
    try {
      await API.deleteTransaction(id);
      showToast('Transaction deleted', 'success');
      if (editingTransactionId === id) cancelEditing();
      await syncAppData();
    } catch (err) {
      showToast(err.message || 'Error deleting transaction', 'error');
    }
  }
}

function validateTransactionForm() {
  clearErrors();
  let isValid = true;

  if (!titleInput.value.trim()) {
    titleError.textContent = 'Title is required';
    isValid = false;
  }

  const amt = parseFloat(amountInput.value);
  if (isNaN(amt) || amt <= 0) {
    amountError.textContent = 'Amount must be greater than zero';
    isValid = false;
  }

  if (!dateInput.value) {
    dateError.textContent = 'Date is required';
    isValid = false;
  }

  return isValid;
}

function clearErrors() {
  if (titleError) titleError.textContent = '';
  if (amountError) amountError.textContent = '';
  if (dateError) dateError.textContent = '';
}

function openBudgetModal() {
  budgetMonthInput.value = activeMonthStr;
  budgetModalError.textContent = '';

  const existingBudget = parseFloat(cardMonthlyBudgetEl.textContent.replace(/[^\d.]/g, ''));
  if (existingBudget > 0) {
    budgetAmountInput.value = existingBudget;
  } else {
    budgetAmountInput.value = '';
  }

  budgetModal.style.display = 'flex';
}

function closeBudgetModal() {
  budgetModal.style.display = 'none';
  budgetModalError.textContent = '';
}

async function handleBudgetSubmit(e) {
  e.preventDefault();

  const month = budgetMonthInput.value;
  const amount = parseFloat(budgetAmountInput.value);

  if (!month || isNaN(amount) || amount <= 0) {
    budgetModalError.textContent = 'Please enter a valid month and amount greater than 0';
    return;
  }

  try {
    const res = await API.setBudget(month, amount);
    showToast(res.message || 'Monthly budget updated', 'success');
    closeBudgetModal();
    activeMonthStr = month;
    await syncAppData();
  } catch (err) {
    budgetModalError.textContent = err.message || 'Error saving budget';
  }
}

function initializeTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    if (themeIcon) themeIcon.setAttribute('data-lucide', 'sun');
  } else {
    document.body.classList.remove('dark-mode');
    if (themeIcon) themeIcon.setAttribute('data-lucide', 'moon');
  }
}

function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');

  if (themeIcon) {
    themeIcon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
  }

  if (window.lucide) lucide.createIcons();
  if (expenseChart) renderChart(transactions.reduce((acc, t) => {
    if (t.type === 'expense') acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {}));
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i data-lucide="${type === 'success' ? 'check-circle' : 'alert-circle'}"></i>
    <span>${escapeHTML(message)}</span>
  `;

  container.appendChild(toast);
  if (window.lucide) lucide.createIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
