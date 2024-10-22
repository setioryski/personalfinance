$(document).ready(function() {
    // Enable Bootstrap tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    })

    // Function to format amount in IDR with sign and insert zero-width spaces
    function formatAmount(amount) {
        // Ensure the amount is a number
        amount = parseFloat(amount);
        if (isNaN(amount)) amount = 0;
        // Round to the nearest integer
        amount = Math.round(amount);
    
        // Format with commas as thousands separators
        const formattedNumber = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        // Add '.00' decimal part
        const formattedWithDecimals = formattedNumber + '.00';
        // Insert zero-width space after each comma
        const formattedWithSpaces = formattedWithDecimals.replace(/,/g, ',\u200B');
        return `Rp${formattedWithSpaces}`;
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

    // **Function to Get URL Parameters (Optional)**
    function getUrlParams() {
        var params = {};
        var queryString = window.location.search.substring(1);
        var regex = /([^&=]+)=([^&]*)/g;
        var m;
        while (m = regex.exec(queryString)) {
            params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
        }
        return params;
    }

    // **Set the 'Add Transaction' Tab as the Initial Active Tab**
    var tabTrigger = new bootstrap.Tab(document.querySelector('button[data-bs-target="#add"]'));
    tabTrigger.show();

    // **Remove the 'invisible' class after activating the correct tab**
    $('#tabContentWrapper').removeClass('invisible');

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

    // **Optionally Handle URL Parameters Without Changing Tabs**
    var urlParams = getUrlParams();
    if (urlParams.start_date && urlParams.end_date) {
        $('#start_date').datepicker('update', urlParams.start_date);
        $('#end_date').datepicker('update', urlParams.end_date);
        // Optionally submit the Summary form automatically
        // $('#summaryForm').submit();
    } else {
        // If you have stored summary dates, you can restore them
        var storedStartDate = localStorage.getItem('summaryStartDate');
        var storedEndDate = localStorage.getItem('summaryEndDate');
        if (storedStartDate) {
            $('#start_date').datepicker('update', storedStartDate);
        }
        if (storedEndDate) {
            $('#end_date').datepicker('update', storedEndDate);
        }
    }

    // **Load stored summary result if Summary tab is active**
    $('button[data-bs-toggle="tab"]').on('shown.bs.tab', function (e) {
        var activeTab = $(e.target).attr('data-bs-target');
        if (activeTab === '#summary') {
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
    });

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
        }, 2000); // 2000 milliseconds = 2 seconds
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
                    $('#start_date').datepicker('update', firstDayStr);
                    $('#end_date').datepicker('update', lastDayStr);
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
                                            <th>No.</th>
                                            <th>Date</th>
                                            <th>Type</th>
                                            <th>Amount (IDR)</th>
                                            <th>Description</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                        `;
                    
                        data.transactions.forEach(function(tx, index) {
                            transactionsHtml += `
                                <tr data-transaction-id="${tx.id}">
                                    <td>${index + 1}</td>
                                    <td>${formatDateToDDMMYYYY(tx.transaction_date)}</td>
                                    <td>${tx.type}</td>
                                    <td class="amount-cell editable-amount" contenteditable="true">${formatAmountWithSign(tx.amount, tx.type)}</td>
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
                    }
                     else {
                        summaryHtml += '<div class="alert alert-info">No transactions found in this date range.</div>';
                    }
            
                    // Existing code after generating the summary
$('#summaryResult').html(summaryHtml);

// Store the summary result in localStorage
localStorage.setItem('summaryResult', summaryHtml);

// Attach event listeners to editable fields in the summary
attachDescriptionEditListeners();
attachAmountEditListeners(); // Add this line

            
                } else {
                    showAlert('#summaryResult', 'danger', response.message);
                }
            }});
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

    function formatAmountWithSign(amount, type) {
        // Ensure the amount is a number
        amount = parseFloat(amount);
        if (isNaN(amount)) amount = 0;
        // Round to the nearest integer
        amount = Math.round(amount);
        // Determine the sign based on transaction type
        var sign = '';
        if (type.toLowerCase() === 'income') {
            sign = '+';
        } else if (type.toLowerCase() === 'expense') {
            sign = '-';
        }
        // Format with commas as thousands separators
        const formattedNumber = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        // Add '.00' decimal part
        const formattedWithDecimals = formattedNumber + '.00';
        // Insert zero-width space after each comma
        const formattedWithSpaces = formattedWithDecimals.replace(/,/g, ',\u200B');
        return `${sign} Rp${formattedWithSpaces}`;
    }
    

    // Function to load transactions based on the selected count
    function loadTransactions(count = 10) {
        $.ajax({
            url: 'get_transaction_history.php',
            type: 'GET',
            data: { count: count }, // Pass the count as a GET parameter
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    var transactions = response.data;
                    var currentBalance = response.current_balance;

                    var historyHtml = '';

                    // Display the current balance at the top
                    historyHtml += `
                        <div class="card mb-4">
                            <div class="card-body">
                                <h5 class="card-title">Current Balance: ${formatAmount(currentBalance)}</h5>
                            </div>
                        </div>
                    `;

                    if (transactions && transactions.length > 0) {
                        historyHtml += `
                            <div class="table-responsive">
                                <table class="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>No.</th>
                                            <th>Date</th>
                                            <th>Type</th>
                                            <th>Amount (IDR)</th>
                                            <th>Description</th>
                                            <th>Balance (IDR)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                        `;

                        transactions.forEach(function(tx, index) {
                            historyHtml += `
                                <tr data-transaction-id="${tx.id}">
                                    <td>${index + 1}</td>
                                    <td>${formatDateToDDMMYYYY(tx.transaction_date)}</td>
                                    <td>${tx.type}</td>
                                    <td class="amount-cell editable-amount" contenteditable="true">${formatAmountWithSign(tx.amount, tx.type)}</td>
                                    <td class="editable-description" contenteditable="true">${tx.description}</td>
                                    <td class="amount-cell">${formatAmount(tx.balance)}</td>
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

// Attach event listeners to editable fields
attachDescriptionEditListeners();
attachAmountEditListeners(); // Add this line


                } else {
                    $('#transactionHistory').html('<div class="alert alert-danger">' + response.message + '</div>');
                }
            },
            error: function() {
                $('#transactionHistory').html('<div class="alert alert-danger">An error occurred while fetching transaction history.</div>');
            }
        });
    }

    // Function to attach event listeners to editable descriptions
    function attachDescriptionEditListeners() {
        $('.editable-description').off('blur').on('blur', function() {
            var newDescription = $(this).text().trim();
            var transactionId = $(this).closest('tr').data('transaction-id');
            var cell = $(this);

            // Send AJAX request to update_description.php
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

    // Function to attach event listeners to editable amounts
    function attachAmountEditListeners() {
        $('.editable-amount').off('focus').on('focus', function() {
            var cell = $(this);
            var amountText = cell.text().trim();
    
            // Remove currency symbols and negative sign
            var plainAmount = amountText.replace(/[^0-9.,]/g, '');
    
            // Remove decimal point and everything after it
            if (plainAmount.includes('.')) {
                plainAmount = plainAmount.substring(0, plainAmount.indexOf('.'));
            } else if (plainAmount.includes(',')) {
                // Check if comma is used as decimal separator
                var lastCommaIndex = plainAmount.lastIndexOf(',');
                if (plainAmount.length - lastCommaIndex - 1 <= 2) {
                    // Likely decimal portion, remove it
                    plainAmount = plainAmount.substring(0, lastCommaIndex);
                }
            }
    
            cell.text(plainAmount);
        });
    
        // Input event to format amount as user types
        $('.editable-amount').off('input').on('input', function() {
            var cell = $(this);
            var inputVal = cell.text();
    
            // Remove any character that's not a digit
            var numericVal = inputVal.replace(/[^\d]/g, '');
    
            // Add commas every three digits
            var formattedVal = numericVal.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
            // Update the cell text
            cell.text(formattedVal);
    
            // Move cursor to the end
            setEndOfContenteditable(cell[0]);
        });
    
        $('.editable-amount').off('blur').on('blur', function() {
            var cell = $(this);
            var newAmountText = cell.text().trim();
        
            // Remove commas
            var newAmountClean = newAmountText.replace(/,/g, '');
        
            // Parse as integer
            var newAmount = parseInt(newAmountClean, 10);
        
            if (isNaN(newAmount) || newAmount <= 0) {
                alert('Please enter a valid positive number for the amount.');
                // Revert to previous amount
                // Reload the appropriate tab
                if ($('#transactionHistory').is(':visible')) {
                    loadTransactions($('#transactionCount').val() || 10);
                } else if ($('#summaryResult').is(':visible')) {
                    $('#summaryForm').submit();
                }
                return;
            }
        
            var transactionId = cell.closest('tr').data('transaction-id');
            var transactionType = cell.closest('tr').find('td:nth-child(3)').text().trim();
        
            // Send AJAX request to update_amount.php
            $.ajax({
                url: 'update_amount.php',
                type: 'POST',
                data: {
                    id: transactionId,
                    amount: newAmount,
                    type: transactionType
                },
                dataType: 'json',
                success: function(response) {
                    if(response.success) {
                        // Optionally show a success message or highlight the cell
                        cell.addClass('amount-updated');
                        setTimeout(function() {
                            cell.removeClass('amount-updated');
                        }, 2000);
        
                        // Reload the appropriate tab to update balances
                        if ($('#transactionHistory').is(':visible')) {
                            loadTransactions($('#transactionCount').val() || 10);
                        } else if ($('#summaryResult').is(':visible')) {
                            $('#summaryForm').submit();
                        }
                    } else {
                        alert('Failed to update amount: ' + response.message);
                        // Revert to previous amount
                        if ($('#transactionHistory').is(':visible')) {
                            loadTransactions($('#transactionCount').val() || 10);
                        } else if ($('#summaryResult').is(':visible')) {
                            $('#summaryForm').submit();
                        }
                    }
                },
                error: function() {
                    alert('An error occurred while updating the amount.');
                    // Revert to previous amount
                    if ($('#transactionHistory').is(':visible')) {
                        loadTransactions($('#transactionCount').val() || 10);
                    } else if ($('#summaryResult').is(':visible')) {
                        $('#summaryForm').submit();
                    }
                }
            });
        });
        
    
        // Prevent newlines and handle Enter key
        $('.editable-amount').off('keydown').on('keydown', function(e) {
            if (e.keyCode === 13) { // Enter key
                e.preventDefault();
                $(this).blur();
            }
        });
    }
    
    // Helper function to move cursor to the end of contenteditable element
    function setEndOfContenteditable(contentEditableElement) {
        var range, selection;
        if(document.createRange) {
            range = document.createRange();
            range.selectNodeContents(contentEditableElement);
            range.collapse(false);
            selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
    
    
    // Helper function to move cursor to the end of contenteditable element
    function setEndOfContenteditable(contentEditableElement) {
        var range, selection;
        if(document.createRange) {
            range = document.createRange();
            range.selectNodeContents(contentEditableElement);
            range.collapse(false);
            selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
    
    
    // Helper function to move cursor to the end of contenteditable element
    function setEndOfContenteditable(contentEditableElement) {
        var range, selection;
        if(document.createRange) {
            range = document.createRange();
            range.selectNodeContents(contentEditableElement);
            range.collapse(false);
            selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
    

// Helper function to move cursor to the end of contenteditable element
function setEndOfContenteditable(contentEditableElement) {
    var range, selection;
    if(document.createRange) { // Firefox, Chrome, Opera, Safari, IE 9+
        range = document.createRange(); // Create a range (a range is a like the selection but invisible)
        range.selectNodeContents(contentEditableElement); // Select the entire contents of the element with the range
        range.collapse(false); // Collapse the range to the end point. false means collapse to end rather than the start
        selection = window.getSelection(); // Get the selection object (allows you to change selection)
        selection.removeAllRanges(); // Remove any selections already made
        selection.addRange(range); // Make the range you have just created the visible selection
    }
}


function setEndOfContenteditable(contentEditableElement) {
    var range, selection;
    if(document.createRange) { // Firefox, Chrome, Opera, Safari, IE 9+
        range = document.createRange(); // Create a range (a range is a like the selection but invisible)
        range.selectNodeContents(contentEditableElement); // Select the entire contents of the element with the range
        range.collapse(false); // Collapse the range to the end point. false means collapse to end rather than the start
        selection = window.getSelection(); // Get the selection object (allows you to change selection)
        selection.removeAllRanges(); // Remove any selections already made
        selection.addRange(range); // Make the range you have just created the visible selection
    }
}


// Function to set caret position in contenteditable element
function setCaretPosition(el, offset) {
    var range = document.createRange();
    var sel = window.getSelection();
    range.setStart(el.childNodes[0], Math.min(offset, el.childNodes[0].length));
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
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
