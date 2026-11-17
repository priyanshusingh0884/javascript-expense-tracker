const form = document.getElementById("transaction-form")
const transactionHistory = document.getElementById("transaction-history")
const transactionList = document.getElementById("transaction-list");
const total_Income = document.getElementById("income-value")
const total_Balance = document.getElementById("balance-value")
const total_Expense = document.getElementById("expense-value")
const transactionBtn = document.getElementById("transaction-btn")
const cancelBtn = document.getElementById("cancel")
const allBtn = document.getElementById("all-filter")
const incomeBtn = document.getElementById("income-filter")
const expenseBtn = document.getElementById("expense-filter")
const monthly_Income = document.getElementById("monthlyIncome")
const monthly_Expenses = document.getElementById("monthlyExpenses")
const monthly_Savings = document.getElementById("monthlySavings")
const monthSelect = document.getElementById("month-select")
const yearSelect = document.getElementById("year-select")
const searchInput = document.getElementById("search-input")
const sortTransaction = document.getElementById("sort-transaction")
let title = document.getElementById("title")
let amount = document.getElementById("amount")
let transactionType = document.getElementById("type")
let category = document.getElementById("category")
let date = document.getElementById("date")
let editingTransactionId = null;
let transactions = [];
const today = new Date();
monthSelect.value = today.getMonth() + 1;
yearSelect.value = today.getFullYear();
let selectedMonth = Number(monthSelect.value);
let selectedYear = Number(yearSelect.value);
let selectedType = "all";

function renderTransactions(list = transactions) {
    transactionList.innerHTML = ""
    if (list.length != 0) {
        list.forEach((e) => {
            let div = document.createElement("div");
            div.classList.add("transaction-card")
            if (e.type === "income") {
                div.classList.add("income-card")
            } else {
                div.classList.add("expense-card")
            }
            let p1 = document.createElement("p");
            p1.textContent = `Title: ${e.title}`;

            let p2 = document.createElement("p");
            p2.textContent = `Amount: ₹${e.amount}`;

            let p3 = document.createElement("p");
            p3.textContent = `Date: ${e.date}`;

            let p4 = document.createElement("p");
            p4.textContent = `Type: ${e.type}`;

            let p5 = document.createElement("p");
            p5.textContent = `Category: ${e.category}`;

            div.append(p1, p2, p3, p4, p5);
            let button = document.createElement("button")
            button.classList.add("delete-btn")
            button.textContent = "Delete"

            let editButton = document.createElement("button");
            editButton.classList.add("edit-btn");
            editButton.textContent = "Edit";
            div.appendChild(editButton)
            div.appendChild(button)
            transactionList.append(div)
            button.dataset.id = e.id;
            button.addEventListener("click", () => {
                let id = Number(button.dataset.id);
                transactions = transactions.filter((e) => e.id !== id);
                localStorage.setItem("transaction", JSON.stringify(transactions))
                updateTransactionView()
                updateSummary()
                getMonthlySummary(selectedYear, selectedMonth)
            })

            editButton.dataset.id = e.id
            editButton.addEventListener("click", () => {
                transactionBtn.textContent = "Update Transaction"
                let id = Number(editButton.dataset.id);
                editingTransactionId = id
                const transaction = transactions.find((e) => e.id === id);

                if (transaction) {
                    title.value = transaction.title
                    amount.value = transaction.amount
                    transactionType.value = transaction.type
                    category.value = transaction.category
                    date.value = transaction.date
                }
            })
        })
    }

    else {
        let searchText = searchInput.value.trim()
        if (searchText !== "") {
            transactionList.textContent = "No results matching your search"
            return
        }

        if (searchText === "" && selectedType === "income") {
            transactionList.textContent = "No income transaction found"
            return
        }

        if (searchText === "" && selectedType === "expense") {
            transactionList.textContent = "No expense transaction found"
            return
        }

        if (searchText === "" && selectedType === "all") {
            transactionList.textContent = "No transaction for this month"
        }

    }

}

cancelBtn.addEventListener("click", () => {
    form.reset()
    editingTransactionId = null
    transactionBtn.textContent = "Add Transaction"
})


function filterTransactions(type) {
    selectedType = type;
    updateTransactionView()
}

allBtn.addEventListener("click", () => {
    filterTransactions("all");
});

incomeBtn.addEventListener("click", () => {
    filterTransactions("income")
})

expenseBtn.addEventListener("click", () => {
    filterTransactions("expense")
})

function yearmonthSelect() {
    selectedMonth = Number(monthSelect.value)
    selectedYear = Number(yearSelect.value)
    getMonthlySummary(selectedYear, selectedMonth)
    updateTransactionView();
}

yearSelect.addEventListener("change", () => {
    yearmonthSelect()
});

monthSelect.addEventListener("change", () => {
    yearmonthSelect()
});

searchInput.addEventListener("input", updateTransactionView)

sortTransaction.addEventListener("change", updateTransactionView)

function updateTransactionView() {
    let result = getMonthlyTransactions(selectedYear, selectedMonth)

    if (selectedType === "income" || selectedType === "expense") {
        result = result.filter((e) => {
            return e.type === selectedType;
        });
    }

    let searchText = searchInput.value.trim().toLowerCase()
    if (searchText !== "") {
        result = result.filter((e) => (e.title.toLowerCase()).includes(searchText))
    }

    let sortOption = sortTransaction.value;
    if (sortOption === "low-high") {
        result = [...result].sort((a, b) => {
            return a.amount - b.amount
        })
    } else if (sortOption === "high-low") {
        result = [...result].sort((a, b) => {
            return b.amount - a.amount
        })
    }

    renderTransactions(result)

}


function getMonthlyTransactions(year, month) {
    let filteredTransactions = transactions.filter((e) => { return (Number(e.date.split("-")[0]) === year && Number(e.date.split("-")[1]) === month) })
    return filteredTransactions
}


function getMonthlySummary(year, month) {
    let result = getMonthlyTransactions(year, month)
    let totalIncome = 0;
    let totalExpense = 0;
    let savings = 0;

    result.forEach((e) => {
        if (e.type === "income") {
            totalIncome += e.amount
        } else {
            totalExpense += e.amount
        }
    })

    savings = totalIncome - totalExpense
    monthly_Income.textContent = totalIncome
    monthly_Expenses.textContent = totalExpense
    monthly_Savings.textContent = savings
}



function updateSummary() {
    let totalIncome = 0;
    let totalExpense = 0;
    let totalBalance = 0;
    transactions.forEach((e) => {
        if (e.type === "income") {
            totalIncome += e.amount
        } else {
            totalExpense += e.amount
        }
    })
    totalBalance = totalIncome - totalExpense

    total_Income.textContent = totalIncome
    total_Balance.textContent = totalBalance
    total_Expense.textContent = totalExpense
}

form.addEventListener("submit", (event) => {
    event.preventDefault()
    if (editingTransactionId === null) {
        let transaction = {
            id: Date.now(),
            title: title.value.trim(),
            amount: Number(amount.value),
            date: date.value,
            type: transactionType.value,
            category: category.value
        }
        transactions.push(transaction)
        localStorage.setItem("transaction", JSON.stringify(transactions))
        updateTransactionView();
        updateSummary()
        getMonthlySummary(selectedYear, selectedMonth)
        form.reset()
    }
    else {
        const update = transactions.find((e) => e.id === editingTransactionId);
        if (!update) {
            return;
        }

        update.title = title.value.trim()
        update.amount = Number(amount.value)
        update.type = transactionType.value
        update.category = category.value
        update.date = date.value

        localStorage.setItem("transaction", JSON.stringify(transactions))
        updateTransactionView();
        updateSummary()
        getMonthlySummary(selectedYear, selectedMonth)
        editingTransactionId = null;
        form.reset()
        transactionBtn.textContent = "Add Transaction"
    }

})


let savedTransaction = localStorage.getItem("transaction")
try {
    if (savedTransaction !== null) {
        let result = JSON.parse(savedTransaction)
        if (Array.isArray(result)){
            transactions = result
        }
        else{
            transactions = []
        }  
    }
} catch (err) {
    transactions = []
}

transactions = transactions.filter(e => !Array.isArray(e));
localStorage.setItem("transaction", JSON.stringify(transactions));
updateTransactionView()
getMonthlySummary(selectedYear, selectedMonth)
updateSummary()

