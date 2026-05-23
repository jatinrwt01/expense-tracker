const transactions = [];

const title = document.getElementById('expense-title');
const amount = document.getElementById('amount');
const category = document.getElementById('category');
const date = document.getElementById('date');
const transactionList = document.querySelector('.transaction-list');

const form = document.querySelector('.expense-form');
form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const expenseTitle = title.value;
    const expenseAmount = Number(amount.value);
    const expenseCategory = category.value;
    const expenseDate = date.value;
   
   
    const transaction = 
    {
    id : Date.now(),
    title : expenseTitle,
    amount: expenseAmount,
    category: expenseCategory,
    date:expenseDate
    };

    transactions.push(transaction);
    renderTransactions();
    form.reset();
});

