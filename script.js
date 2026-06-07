let transactions = [];
let expenseChart;

const title = document.getElementById("expense-title");
const amount = document.getElementById("amount");
const category = document.getElementById("category");
const date = document.getElementById("date");
const transactionList = document.querySelector(".transaction-list");

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

  
  const transaction = {
    id: Date.now(),
    title: expenseTitle,
    amount: expenseAmount,
    category: expenseCategory,
    date: expenseDate,
  };

  transactions.push(transaction);
  saveTransactions();
  renderTransactions();
  updateSummaryCards();
  renderChart();
  form.reset();
});

function renderTransactions() {
  transactionList.innerHTML = "";
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
  const buttonElement = document.createElement("button");
  buttonElement.classList.add("btn");
  amountElement.textContent = `₹${transaction.amount}`;
  buttonElement.textContent = "Delete";

  buttonElement.addEventListener("click", (e) => {
    deleteTransaction(transaction.id);
  })
  rightEl.appendChild(amountElement);
  rightEl.appendChild(buttonElement);

  el.appendChild(leftEl);
  el.appendChild(rightEl);

  return el;
}


function deleteTransaction(id){
  transactions = transactions.filter(transaction => transaction.id !== id);
  renderTransactions();
  saveTransactions();
  updateSummaryCards();
  renderChart();
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





loadTransactions();