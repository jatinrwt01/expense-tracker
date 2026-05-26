let transactions = [];

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

  const transaction = {
    id: Date.now(),
    title: expenseTitle,
    amount: expenseAmount,
    category: expenseCategory,
    date: expenseDate,
  };

  transactions.push(transaction);
  renderTransactions();
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
    console.log(`Delete button of ${transaction.title} clicked`);
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
}