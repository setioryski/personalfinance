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
    var todayStr = ('0' + today.getDate()).slice(-2) + '-' + ('0' + (today.getMonth() + 1)).slice(-2) + '-' + today.getFullYear();
    $('#date').datepicker('update', todayStr);

    // Calculate the first day of the current month
    var firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    var firstDayStr = ('0' + firstDay.getDate()).slice(-2) + '-' + ('0' + (firstDay.getMonth() + 1)).slice(-2) + '-' + firstDay.getFullYear();

    // Calculate the last day of the current month
    var lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    var lastDayStr = ('0' + lastDay.getDate()).slice(-2) + '-' + ('0' + (lastDay.getMonth() + 1)).slice(-2) + '-' + lastDay.getFullYear();

    // Set the default dates in the datepickers
    $('#start_date').datepicker('update', firstDayStr);
    $('#end_date').datepicker('update', lastDayStr);

    // Store default dates in localStorage
    localStorage.setItem('summaryStartDate', firstDayStr);
    localStorage.setItem('summaryEndDate', lastDayStr);

    // Load stored summary result if Summary tab is active
    if (lastActiveTab === '#summary') {
        var storedSummaryResult = localStorage.getItem('summaryResult');
        if (storedSummaryResult) {
            $('#summaryResult').html(storedSummaryResult);
            // Attach event listener to editable descriptions in the summary
            attachDescriptionEditListeners();
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

    // Function to display alerts that auto-dismiss after 2 seconds
    function showAlert(containerSelector, type, message) {
        // Create the alert div with Bootstrap classes
        var alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
        </div>
    `;
        
        // Insert the alert into the specified container
        $(containerSelector).html(alertHtml);
        
        // Automatically fade out and remove the alert after 2 seconds
        setTimeout(function() {
            $(containerSelector).find('.alert').fadeOut('slow', function() {
                $(this).remove();
            });
        }, 1000); // 2000 milliseconds = 2 seconds
    }

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
                    showAlert('#formMessage', 'success', response.message);
                    $('#transactionForm')[0].reset();
                    // Reset the date to today after reset
                    $('#date').datepicker('update', todayStr);
                    // Reset Summary form dates to default
                    $('#start_date').datepicker('update', todayStr);
                    $('#end_date').datepicker('update', tomorrowStr);
                    // Refresh the transactions based on selected count
                    var selectedCount = $('#transactionCount').val() || 10;
                    loadTransactions(selectedCount);
                } else {
                    showAlert('#formMessage', 'danger', response.message);
                }
            },
            error: function() {
                showAlert('#formMessage', 'danger', 'An error occurred while processing your request.');
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
                                <tr data-transaction-id="${tx.id}">
                                    <td>${formatDateToDDMMYYYY(tx.transaction_date)}</td>
                                    <td>${tx.type}</td>
                                    <td class="amount-cell">${formatAmountWithSign(tx.amount, tx.type)}</td>
                                    <td class="editable-description" contenteditable="true">${tx.description}</td>
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

                    // Attach event listener to editable descriptions
                    attachDescriptionEditListeners();

                } else {
                    showAlert('#summaryResult', 'danger', response.message);
                }
            },
            error: function() {
                showAlert('#summaryResult', 'danger', 'An error occurred while fetching the summary.');
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
                    showAlert('#manageMessage', 'success', response.message);

                    // Refresh the transactions based on selected count
                    var selectedCount = $('#transactionCount').val() || 10;
                    loadTransactions(selectedCount);

                    // Clear the summary results and stored data
                    $('#summaryResult').html('');
                    localStorage.removeItem('summaryResult');

                } else {
                    // Show error message
                    showAlert('#manageMessage', 'danger', response.message);
                }
            },
            error: function() {
                showAlert('#manageMessage', 'danger', 'An error occurred while deleting transactions.');
            },
            complete: function() {
                // Re-enable the delete button and reset text
                $('#confirmDeleteBtn').prop('disabled', false).text('Yes');
            }
        });
    });

    // Function to load transactions based on the selected count
    function loadTransactions(count = 10) {
        $.ajax({
            url: 'get_transaction_history.php',
            type: 'GET',
            data: { count: count }, // Pass the count as a GET parameter
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
                            <h5>Last ${count} Transactions:</h5>
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
                                <tr data-transaction-id="${tx.id}">
                                    <td>${formatDateToDDMMYYYY(tx.transaction_date)}</td>
                                    <td>${tx.type}</td>
                                    <td class="amount-cell">${formatAmountWithSign(tx.amount, tx.type)}</td>
                                    <td class="editable-description" contenteditable="true">${tx.description}</td>
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

                    // Attach event listener to editable descriptions
                    attachDescriptionEditListeners();

                } else {
                    showAlert('#transactionHistory', 'danger', response.message);
                }
            },
            error: function() {
                showAlert('#transactionHistory', 'danger', 'An error occurred while fetching transaction history.');
            }
        });
    }

    // Function to attach event listeners to editable descriptions
    function attachDescriptionEditListeners() {
        $('.editable-description').off('blur').on('blur', function() {
            var newDescription = $(this).text().trim();
            var transactionId = $(this).closest('tr').data('transaction-id');
            var cell = $(this);

            // Send AJAX request to update description
            $.ajax({
                url: 'update_description.php',
                type: 'POST',
                data: {
                    id: transactionId,
                    description: newDescription
                },
                dataType: 'json',
                success: function(response) {
                    if(response.success) {
                        // Optionally show a success message or highlight the cell
                        cell.addClass('description-updated');
                        setTimeout(function() {
                            cell.removeClass('description-updated');
                        }, 2000);
                    } else {
                        alert('Failed to update description: ' + response.message);
                    }
                },
                error: function() {
                    alert('An error occurred while updating the description.');
                }
            });
        });
    }

    // Handle change event on the transaction count selector
    $('#transactionCount').change(function() {
        var selectedCount = $(this).val();
        loadTransactions(selectedCount);
    });

    // Load the selected number of transactions on page load
    var initialCount = $('#transactionCount').val() || 10;
    loadTransactions(initialCount);
});
