<!DOCTYPE html>
<html lang="en">
<head>
    <!-- Meta Tags and Title -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Finance Tracker</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Datepicker CSS -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-datepicker@1.9.0/dist/css/bootstrap-datepicker.min.css">
    <!-- Font Awesome for icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="styles.css">
    <!-- Inline CSS to control visibility -->
    <style>
        .invisible {
            visibility: hidden;
        }
    </style>
</head>
<body>
    <div class="container my-5">
        <h1 class="text-center mb-4 display-4 finance-tracker-title">
            <i class="fas fa-wallet me-2"></i>Finance Tracker
        </h1>
        
        <!-- Navigation Tabs -->
        <!-- Wrap the nav tabs in a div with overflow-x: auto -->
        <div class="nav-tabs-wrapper">
            <ul class="nav nav-tabs mb-4 flex-nowrap" id="financeTabs" role="tablist">
                <!-- Changed Order: Add Transaction remains first -->
                <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="add-tab" data-bs-toggle="tab" data-bs-target="#add" type="button" role="tab" aria-controls="add" aria-selected="true">
    <i class="fas fa-plus-circle me-1"></i> Add Transaction</button>
                </li>
                <!-- Changed Order: Transaction History moved to second -->
                <li class="nav-item" role="presentation">
                <button class="nav-link" id="history-tab" data-bs-toggle="tab" data-bs-target="#history" type="button" role="tab" aria-controls="history" aria-selected="false">
    <i class="fas fa-history me-1"></i> Transaction History
</button>
                </li>
                <!-- Changed Order: Summary moved to third -->
                <li class="nav-item" role="presentation">
                <button class="nav-link" id="summary-tab" data-bs-toggle="tab" data-bs-target="#summary" type="button" role="tab" aria-controls="summary" aria-selected="false">
    <i class="fas fa-chart-line me-1"></i> Summary
</button>
                </li>
                <!-- Manage remains last -->
                <li class="nav-item" role="presentation">
                <button class="nav-link" id="manage-tab" data-bs-toggle="tab" data-bs-target="#manage" type="button" role="tab" aria-controls="manage" aria-selected="false">
    <i class="fas fa-cog me-1"></i> Manage
</button>
                </li>
                <!-- Add more tabs here if needed -->
            </ul>
        </div>

        <!-- Tab Content Wrapper with 'invisible' class -->
        <div id="tabContentWrapper">
            <!-- Tab Content -->
            <div class="tab-content" id="financeTabsContent">
                <!-- Add Transaction Tab -->
                <div class="tab-pane fade show active" id="add" role="tabpanel" aria-labelledby="add-tab">
                    <form id="transactionForm">
                        <div class="mt-3">
                            <label for="date" class="form-label">Date<span class="text-danger">*</span>:</label>
                            <!-- Changed input type to 'text' for datepicker -->
                            <input type="text" class="form-control datepicker" id="date" name="date" required placeholder="dd-mm-yyyy">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Type<span class="text-danger">*</span>:</label><br>
                            <div class="form-check form-check-inline">
                                <input class="form-check-input" type="radio" name="type" id="income" value="income" required>
                                <label class="form-check-label" for="income">Income</label>
                            </div>
                            <div class="form-check form-check-inline">
                                <input class="form-check-input" type="radio" name="type" id="expense" value="expense" required>
                                <label class="form-check-label" for="expense">Expense</label>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="amount" class="form-label">Amount (IDR)<span class="text-danger">*</span>:</label>
                            <input type="text" class="form-control" id="amount" name="amount" required placeholder="e.g., 1,500,000">
                        </div>
                        <div class="mb-3">
                            <label for="description" class="form-label">Description:</label>
                            <input type="text" class="form-control" id="description" name="description" placeholder="Optional">
                        </div>
                        <button type="submit" class="btn btn-primary">Add Transaction</button>
                    </form>
                    <div id="formMessage" class="mt-3"></div>
                </div>

                <!-- Transaction History Tab -->
                <div class="tab-pane fade" id="history" role="tabpanel" aria-labelledby="history-tab">
                    <h3>Transaction History</h3>
                    <!-- Dropdown Selector for Number of Transactions -->
                    <div class="d-flex justify-content-end mb-3">
                        <label for="transactionCount" class="form-label me-2">Show:</label>
                        <select id="transactionCount" class="form-select transaction-count-select">
                            <option value="10" selected>Last 10 Transactions</option>
                            <option value="50">Last 50 Transactions</option>
                        </select>
                    </div>
                    <div id="transactionHistory" class="mt-3">
                        <!-- Transactions will be loaded here via AJAX -->
                    </div>
                </div>

                <!-- Summary Tab -->
                <div class="tab-pane fade" id="summary" role="tabpanel" aria-labelledby="summary-tab">
                    <div class="mb-4">
                        <h3>Custom Financial Summary</h3>
                        <form id="summaryForm" class="row g-3">
                            <div class="col-md-5">
                                <label for="start_date" class="form-label">Start Date<span class="text-danger">*</span>:</label>
                                <!-- Changed input type to 'text' for datepicker -->
                                <input type="text" class="form-control datepicker" id="start_date" name="start_date" required placeholder="dd-mm-yyyy">
                            </div>
                            <div class="col-md-5">
                                <label for="end_date" class="form-label">End Date:</label>
                                <!-- Changed input type to 'text' for datepicker -->
                                <input type="text" class="form-control datepicker" id="end_date" name="end_date" placeholder="dd-mm-yyyy">
                                <small class="form-text text-muted">Leave blank to include all transactions from the start date onward.</small>
                            </div>
                            <div class="col-md-2 d-flex align-items-end">
                                <button type="submit" class="btn btn-success w-100">Generate</button>
                            </div>
                        </form>
                    </div>
                    <div id="summaryResult"></div>
                </div>

                <!-- Manage Tab -->
                <div class="tab-pane fade" id="manage" role="tabpanel" aria-labelledby="manage-tab">
                    <h3>Manage Transactions</h3>
                    <!-- Delete All Transactions Button -->
                    <button id="deleteAllBtn" class="btn btn-danger mt-3" data-bs-toggle="tooltip" data-bs-placement="right" title="Delete all transactions permanently">
                        <i class="fas fa-trash-alt"></i> Delete All Transactions
                    </button>
                    <div id="manageMessage" class="mt-3"></div>
                </div>
            </div>
        </div>
    </div>

    <!-- Confirmation Modal -->
    <div class="modal fade" id="confirmDeleteModal" tabindex="-1" aria-labelledby="confirmDeleteModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="confirmDeleteModalLabel">Confirm Deletion</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            Are you sure you want to delete all transactions? This action cannot be undone.
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">No</button>
            <button type="button" class="btn btn-danger" id="confirmDeleteBtn">Yes</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bootstrap JS and dependencies (Popper.js) -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <!-- jQuery (for simplicity in AJAX and Datepicker) -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <!-- Bootstrap Datepicker JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap-datepicker@1.9.0/dist/js/bootstrap-datepicker.min.js"></script>
    <!-- Localization for Datepicker -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap-datepicker@1.9.0/dist/locales/bootstrap-datepicker.id.min.js"></script>
    <!-- Custom JS -->
    <script src="script.js"></script>
</body>
</html>
