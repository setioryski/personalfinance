// script.js

$(document).ready(function() {
    // Enable Bootstrap tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    })

    // Function to format amount in IDR with sign and insert zero-width spaces
    function formatAmountWithSign(amount, type) {
        // Ensure the amount is a number
        amount = parseFloat(amount);
        if (isNaN(amount)) amount = 0;
        // Determine the sign based on transaction type
        var sign = '';
        if (type.toLowerCase() === 'income') {
            sign = '+';
        } else if (type.toLowerCase() === 'expense') {
            sign = '-';
        }
        // Format to two decimal places with commas
        const formattedNumber = amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        // Insert zero-width space after each comma and before decimal point
        const formattedWithSpaces = formattedNumber.replace(/,/g, ',\u200B').replace('.', '\u200B.');
        return `${sign} Rp${formattedWithSpaces}`;
    }

    // Function to format amount in IDR and insert zero-width spaces
    function formatAmount(amount) {
        // Ensure the amount is a number
        amount = parseFloat(amount);
        if (isNaN(amount)) amount = 0;
        // Format to two decimal places with commas
        const formattedNumber = amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        // Insert zero-width space after each comma and before decimal point
        const formattedWithSpaces = formattedNumber.replace(/,/g, ',\u200B').replace('.', '\u200B.');
        return `Rp${formattedWithSpaces}`;
    }

    // Function to format dates to dd-mm-yyyy
    function formatDateToDDMMYYYY(dateStr) {
        var parts = dateStr.split('-');
        if (parts.length !== 3) return dateStr;
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    // Function to convert date from dd-mm-yyyy to yyyy-mm-dd
    function formatDateToYYYYMMDD(dateStr) {
        var parts = dateStr.split('-');
        if (parts.length !== 3) return dateStr;
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    // Initialize datepickers
    $('.datepicker').datepicker({
        format: 'dd-mm-yyyy',
        autoclose: true,
        todayHighlight: true
        //language: 'id' // Uncomment if you want to set the datepicker language to Indonesian
    });

    // **Restore Last Active Tab on Page Load**
    // Get the last active tab from localStorage
    var lastActiveTab = localStorage.getItem('activeTab');
    if (lastActiveTab) {
        var tabTrigger = new bootstrap.Tab(document.querySelector('button[data-bs-target="' + lastActiveTab + '"]'));
        tabTrigger.show();
    } else {
        // Default to Add Transaction tab
        var tabTrigger = new bootstrap.Tab(document.querySelector('button[data-bs-target="#add"]'));
        tabTrigger.show();
    }

    // **Remove the 'invisible' class after activating the correct tab**
    document.getElementById('tabContentWrapper').classList.remove('invisible');

    // **Save Active Tab on Tab Change**
    $('button[data-bs-toggle="tab"]').on('shown.bs.tab', function (e) {
        var activeTab = $(e.target).attr('data-bs-target');
        localStorage.setItem('activeTab', activeTab);
    });

    // Set the date input to today's date on page load
    var today = new Date();
    var todayStr = ('0' + today.getDate()).slice(-2) + '-' + ('0' + (today.getMonth()+1)).slice(-2) + '-' + today.getFullYear();
    $('#date').datepicker('update', todayStr);

    // Set the Summary form's start_date to today and end_date to tomorrow
    var tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    var tomorrowStr = ('0' + tomorrow.getDate()).slice(-2) + '-' + ('0' + (tomorrow.getMonth()+1)).slice(-2) + '-' + tomorrow.getFullYear();

    // Set the default dates in the datepickers
    $('#start_date').datepicker('update', todayStr);
    $('#end_date').datepicker('update', tomorrowStr);

    // Store default dates in localStorage
    localStorage.setItem('summaryStartDate', todayStr);
    localStorage.setItem('summaryEndDate', tomorrowStr);

    // Load stored summary result if Summary tab is active
    if (lastActiveTab === '#summary') {
        var storedSummaryResult = localStorage.getItem('summaryResult');
        if (storedSummaryResult) {
            $('#summaryResult').html(storedSummaryResult);
        } else {
            // Optionally generate summary automatically
            $('#summaryForm').submit();
        }
    }

    // Format amount input with commas as the user types
    $('#amount').on('input', function() {
        var value = $(this).val();
        // Remove any non-digit and non-decimal characters
        value = value.replace(/[^0-9.]/g, '');
        // Split on decimal point
        var parts = value.split('.');
        // Add commas to the integer part
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        // Join back with decimal part if exists
        var formatted = parts.join('.');
        $(this).val(formatted);
    });

    // Handle Add Transaction Form Submission
    $('#transactionForm').submit(function(event) {
        event.preventDefault(); // Prevent default form submission

        // Remove commas from amount before sending
        var amount = $('#amount').val().replace(/,/g, '');
        $('#amount').val(amount);

        // Convert date to yyyy-mm-dd format
        var date = formatDateToYYYYMMDD($('#date').val());
        $('#date').val(date);

        // Serialize form data
        var formData = $(this).serialize();

        // Send AJAX request to add_transaction.php
        $.ajax({
            url: 'add_transaction.php',
            type: 'POST',
            data: formData,
            dataType: 'json',
            success: function(response) {
                if(response.success) {
                    $('#formMessage').html('<div class="alert alert-success">' + response.message + '</div>');
                    $('#transactionForm')[0].reset();
                    // Reset the date to today after reset
                    $('#date').datepicker('update', todayStr);
                    // Reset Summary form dates to default
                    $('#start_date').datepicker('update', todayStr);
                    $('#end_date').datepicker('update', tomorrowStr);
                    // Refresh the last 10 transactions and balance
                    loadLastTenTransactions();
                } else {
                    $('#formMessage').html('<div class="alert alert-danger">' + response.message + '</div>');
                }
            },
            error: function() {
                $('#formMessage').html('<div class="alert alert-danger">An error occurred while processing your request.</div>');
            }
        });
    });

    // Handle Summary Form Submission
    $('#summaryForm').submit(function(event) {
        event.preventDefault(); // Prevent default form submission

        // Convert dates to yyyy-mm-dd format
        var startDate = formatDateToYYYYMMDD($('#start_date').val());
        var endDate = $('#end_date').val() ? formatDateToYYYYMMDD($('#end_date').val()) : '';

        // Store form data in localStorage
        localStorage.setItem('summaryStartDate', $('#start_date').val());
        localStorage.setItem('summaryEndDate', $('#end_date').val());

        var formDataObj = {
            start_date: startDate,
            end_date: endDate
        };

        // Send AJAX request to get_summary.php
        $.ajax({
            url: 'get_summary.php',
            type: 'POST',
            data: formDataObj,
            dataType: 'json',
            success: function(response) {
                if(response.success) {
                    var data = response.data;
                    var summaryHtml = `
                        <div class="card mb-4">
                            <div class="card-body">
                                <h5 class="card-title">Summary from ${formatDateToDDMMYYYY(data.start_date)} to ${formatDateToDDMMYYYY(data.end_date)}</h5>
                                <p class="card-text"><strong>Total Income:</strong> ${formatAmount(data.total_income)}</p>
                                <p class="card-text"><strong>Total Expenses:</strong> ${formatAmount(data.total_expense)}</p>
                                <p class="card-text"><strong>Net Balance:</strong> ${formatAmount(data.net_balance)}</p>
                            </div>
                        </div>
                    `;

                    if(data.transactions && data.transactions.length > 0) {
                        var transactionsHtml = `
                            <h5>Transactions:</h5>
                            <div class="table-responsive">
                                <table class="table table-bordered">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Type</th>
                                            <th>Amount (IDR)</th>
                                            <th>Description</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                        `;

                        data.transactions.forEach(function(tx) {
                            transactionsHtml += `
                                <tr>
                                    <td>${formatDateToDDMMYYYY(tx.transaction_date)}</td>
                                    <td>${tx.type}</td>
                                    <td class="amount-cell">${formatAmountWithSign(tx.amount, tx.type)}</td>
                                    <td>${tx.description}</td>
                                </tr>
                            `;
                        });

                        transactionsHtml += `
                                    </tbody>
                                </table>
                            </div>
                        `;
                        summaryHtml += transactionsHtml;
                    } else {
                        summaryHtml += '<div class="alert alert-info">No transactions found in this date range.</div>';
                    }

                    $('#summaryResult').html(summaryHtml);

                    // Store the summary result in localStorage
                    localStorage.setItem('summaryResult', summaryHtml);

                } else {
                    $('#summaryResult').html('<div class="alert alert-danger">' + response.message + '</div>');
                }
            },
            error: function() {
                $('#summaryResult').html('<div class="alert alert-danger">An error occurred while fetching the summary.</div>');
            }
        });
    });

    // Handle Delete All Transactions
    $('#deleteAllBtn').click(function() {
        var deleteModal = new bootstrap.Modal(document.getElementById('confirmDeleteModal'), {
            keyboard: false
        });
        deleteModal.show();
    });

    $('#confirmDeleteBtn').click(function() {
        // Disable the button to prevent multiple clicks
        $('#confirmDeleteBtn').prop('disabled', true).text('Deleting...');

        $.ajax({
            url: 'delete_all.php',
            type: 'POST',
            dataType: 'json',
            success: function(response) {
                if(response.success) {
                    // Hide the modal
                    var deleteModalEl = document.getElementById('confirmDeleteModal');
                    var deleteModal = bootstrap.Modal.getInstance(deleteModalEl);
                    deleteModal.hide();

                    // Show success message
                    $('#manageMessage').html('<div class="alert alert-success">' + response.message + '</div>');

                    // Refresh the Transaction History
                    loadLastTenTransactions();

                    // Clear the summary results and stored data
                    $('#summaryResult').html('');
                    localStorage.removeItem('summaryResult');

                } else {
                    // Show error message
                    $('#manageMessage').html('<div class="alert alert-danger">' + response.message + '</div>');
                }
            },
            error: function() {
                $('#manageMessage').html('<div class="alert alert-danger">An error occurred while deleting transactions.</div>');
            },
            complete: function() {
                // Re-enable the delete button and reset text
                $('#confirmDeleteBtn').prop('disabled', false).text('Yes');
            }
        });
    });

    // Function to load the last 10 transactions and current balance
    function loadLastTenTransactions() {
        $.ajax({
            url: 'get_transaction_history.php',
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                if(response.success) {
                    var transactions = response.data;
                    var balance = response.balance;

                    var historyHtml = `
                        <div class="card mb-4">
                            <div class="card-body">
                                <h5 class="card-title">Current Balance: ${formatAmount(balance)}</h5>
                            </div>
                        </div>
                    `;

                    if(transactions && transactions.length > 0) {
                        historyHtml += `
                            <h5>Last 10 Transactions:</h5>
                            <div class="table-responsive">
                                <table class="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Type</th>
                                            <th>Amount (IDR)</th>
                                            <th>Description</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                        `;
                        transactions.forEach(function(tx) {
                            historyHtml += `
                                <tr>
                                    <td>${formatDateToDDMMYYYY(tx.transaction_date)}</td>
                                    <td>${tx.type}</td>
                                    <td class="amount-cell">${formatAmountWithSign(tx.amount, tx.type)}</td>
                                    <td>${tx.description}</td>
                                </tr>
                            `;
                        });
                        historyHtml += `
                                    </tbody>
                                </table>
                            </div>
                        `;
                    } else {
                        historyHtml += '<div class="alert alert-info">No transactions found.</div>';
                    }

                    $('#transactionHistory').html(historyHtml);
                } else {
                    $('#transactionHistory').html('<div class="alert alert-danger">' + response.message + '</div>');
                }
            },
            error: function() {
                $('#transactionHistory').html('<div class="alert alert-danger">An error occurred while fetching transaction history.</div>');
            }
        });
    }

    // Load the last 10 transactions and balance on page load
    loadLastTenTransactions();
});
