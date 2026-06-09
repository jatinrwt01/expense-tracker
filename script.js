let transactions = [];
let expenseChart;
let editingTransactionId = null;

const title = document.getElementById("expense-title");
const amount = document.getElementById("amount");
const category = document.getElementById("category");
const date = document.getElementById("date");
const transactionList = document.querySelector(".transaction-list");
const formSubmitBtn = document.getElementById('submit-form');

const form = document.querySelector(".expense-form");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const expenseTitle = title.value;
  const expenseAmount = Number(amount.value);
  const expenseCategory = category.value;
  const expenseDate = date.value;


   if(!validateForm()){
    return;
  }

  if(editingTransactionId === null){
     const transaction = {
    id: Date.now(),
    title: expenseTitle,
    amount: expenseAmount,
    category: expenseCategory,
    date: expenseDate,
  };

  transactions.push(transaction);
  syncUI();
  form.reset();
  } else{
    const transactionToEdit = transactions.find(
      transaction => transaction.id === editingTransactionId
    );
    transactionToEdit.title = title.value;
    transactionToEdit.amount = Number(amount.value);
    transactionToEdit.category = category.value;
    transactionToEdit.date = date.value;
    syncUI();
    form.reset();
    editingTransactionId = null;
    formSubmitBtn.textContent = "Add Transaction";
  }
});

function renderTransactions() {
  transactionList.innerHTML = "";
  if(transactions.length === 0){
    const emptyStateElement = document.createElement('div');
    const headingElement = document.createElement('h3');
    const subHeadElement = document.createElement('p');
    emptyStateElement.classList.add('empty-state');
    headingElement.textContent = `No transactions yet`;
    subHeadElement.textContent = `Add your first expense to get started`;
    emptyStateElement.appendChild(headingElement);
    emptyStateElement.appendChild(subHeadElement);

    transactionList.appendChild(emptyStateElement);
    return;
  } 
  transactions.forEach((transaction) => {
    const transactionItem = transactionElement(transaction);
    transactionList.append(transactionItem);
  });
}


function transactionElement(transaction) {
  const el = document.createElement("li");
  el.classList.add("transaction-item");

  const leftEl = document.createElement("div");
  leftEl.classList.add("transaction-info");
  const titleElement = document.createElement("h4");
  const categoryDateElement = document.createElement("p");
  titleElement.textContent = transaction.title;
  categoryDateElement.textContent = `${transaction.category} • ${transaction.date}`;
  leftEl.appendChild(titleElement);
  leftEl.appendChild(categoryDateElement);

  const rightEl = document.createElement("div");
  rightEl.classList.add("transaction-actions");
  const amountElement = document.createElement("span");
   const editButtonElement = document.createElement("button");
  const deleteButtonElement = document.createElement("button");
 
  amountElement.textContent = `₹${transaction.amount}`;
  editButtonElement.classList.add('btn');
  editButtonElement.textContent = 'Edit';
  deleteButtonElement.classList.add("btn");
  deleteButtonElement.textContent = "Delete";


  editButtonElement.addEventListener('click', ()=>{
    editingTransactionId = transaction.id;
    title.value = transaction.title;
    amount.value = transaction.amount;
    category.value = transaction.category;
    date.value = transaction.date;
    formSubmitBtn.textContent = "Edit transaction";
  });


  deleteButtonElement.addEventListener("click", () => {
    deleteTransaction(transaction.id);
  });

  
  rightEl.appendChild(amountElement);
  rightEl.appendChild(deleteButtonElement);
  rightEl.appendChild(editButtonElement);

  el.appendChild(leftEl);
  el.appendChild(rightEl);

  return el;
}


function deleteTransaction(id){
  transactions = transactions.filter(transaction => transaction.id !== id);
  syncUI();
}


/* ====Summary cards logic===*/
const income = 40000;

const totalExpense = document.getElementById('total-expense');
const totalBalance = document.getElementById('total-balance');
function updateSummaryCards(){
  const expense = transactions.reduce((accumulator, transaction)=>{
    return accumulator + transaction.amount;
  }, 0)
 
  const balance = income - expense;

  //Render total expense
  totalExpense.textContent = `₹${expense}`;

  //Render total balance
  totalBalance.textContent = `₹${balance}`;
}


/*====Save to localStorage===*/
function saveTransactions(){
  const transactionString = JSON.stringify(transactions);
  localStorage.setItem("transactions", transactionString);
}

function saveTheme(){
  if(document.body.classList.contains('dark-mode')){
      localStorage.setItem("theme", 'dark');
      localStorage.setItem("icon", 'sun');
  } else{
    localStorage.setItem("theme", 'light');
    localStorage.setItem("icon", 'moon');
  }
}



/*===Load from localStorage===*/
function loadTransactions(){
  const transactionString = localStorage.getItem("transactions");
  const storedTransactions = JSON.parse(transactionString);
  if(storedTransactions === null){
    transactions = [];
  } else{
    transactions = storedTransactions;
  }
  renderTransactions();
  updateSummaryCards();
  renderChart();
}

function loadTheme(){
  const theme = localStorage.getItem("theme");
  if(theme === 'dark'){
    document.body.classList.add('dark-mode');
    document.getElementById('theme-icon').setAttribute('data-lucide', 'sun');
  } else{
    document.getElementById('theme-icon').setAttribute('data-lucide', 'moon');
  }
}


/*===Chart Analytics logic ===*/

function categoryExpenses(){
  //transactions --> object (key:value) = (category:totalexpense)
  const categoryWiseExpenses = {};
  transactions.forEach((transaction)=>{
    if(!(transaction.category in categoryWiseExpenses)){
      categoryWiseExpenses[transaction.category] = transaction.amount;
    } else{
      categoryWiseExpenses[transaction.category] += transaction.amount;
    }
  });

  return categoryWiseExpenses;
}

function renderChart(){
  const categoryExpensesObj = categoryExpenses();
  const labels = Object.keys(categoryExpensesObj);
  const values = Object.values(categoryExpensesObj);
  const ctx = document.getElementById('expense-chart');

  if(expenseChart){
   expenseChart.destroy();
  }
  expenseChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels : labels,
      datasets: [{
        label : 'Expenses',
        data: values,
        borderWidth: 1
      }]
    }
  });
}


//Form validation
const titleError = document.getElementById('title-error');
const amountError = document.getElementById('amount-error');
const dateError = document.getElementById('date-error');
function validateForm(){
  let isValid = true;

  clearErrors();

  if(title.value.trim().length == 0){
    titleError.textContent = "Title is required";
    isValid = false;
  }

  if(amount.value == ''){
    amountError.textContent = "Amount is required";
    isValid = false;
  } else if(Number(amount.value) <= 0){
    amountError.textContent = "Amount must be greater than zero";
    isValid = false;
  }

  if(date.value == ''){
    dateError.textContent = "Date is required"
    isValid = false;
  }

  return isValid;
}

function clearErrors(){
  titleError.textContent = '';
  amountError.textContent = '';
  dateError.textContent = '';
}


/**Sync UI */
function syncUI() {
  saveTransactions();
  renderTransactions();
  updateSummaryCards();
  renderChart();
}


/*Dark mode logic*/
const themeToggleBtn = document.getElementById('theme-toggle');
function toggleTheme(){
  themeToggleBtn.addEventListener('click', ()=>{
    document.body.classList.toggle('dark-mode');
    if(document.body.classList.contains('dark-mode')){
      document.getElementById('theme-icon').setAttribute('data-lucide', 'sun');
      lucide.createIcons();
    } else{
      document.getElementById('theme-icon').setAttribute('data-lucide', 'moon');
      lucide.createIcons();
    }

    saveTheme();
  });
}
toggleTheme();


loadTheme();
loadTransactions();

lucide.createIcons();