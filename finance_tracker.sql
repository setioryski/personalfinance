-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 22, 2024 at 11:44 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `finance_tracker`
--

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` int(11) NOT NULL,
  `transaction_date` date NOT NULL,
  `type` enum('income','expense') NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `description` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `transaction_date`, `type`, `amount`, `description`, `created_at`, `updated_at`) VALUES
(1, '2024-10-21', 'income', 5000000.00, '', '2024-10-21 08:26:41', '2024-10-21 08:39:36'),
(2, '2024-10-21', 'expense', 1500000.00, '', '2024-10-21 08:36:17', '2024-10-21 08:36:17'),
(3, '2024-10-21', 'income', 3250000.00, '', '2024-10-21 08:36:23', '2024-10-21 08:36:23'),
(5, '2024-10-21', 'expense', 1500000.00, '', '2024-10-21 08:36:34', '2024-10-21 08:36:34'),
(6, '2024-10-15', 'expense', 6000000.00, '', '2024-10-21 08:36:47', '2024-10-21 08:36:47'),
(7, '2024-10-21', 'income', 5000000.00, '', '2024-10-21 08:37:14', '2024-10-21 08:37:14'),
(9, '2024-10-21', 'income', 1200000.00, '', '2024-10-21 08:38:22', '2024-10-21 08:38:22'),
(10, '2024-10-21', 'expense', 1600000.00, '', '2024-10-21 08:38:26', '2024-10-21 08:38:26'),
(11, '2024-10-21', 'income', 400000.00, '', '2024-10-21 08:38:33', '2024-10-21 08:38:33'),
(12, '2024-10-21', 'income', 5000000.00, '', '2024-10-21 08:53:43', '2024-10-21 08:53:43'),
(14, '2024-10-21', 'income', 1600000.00, '', '2024-10-21 11:17:52', '2024-10-22 04:38:01'),
(15, '2024-10-21', 'expense', 2500000.00, '', '2024-10-21 11:18:22', '2024-10-22 04:37:52'),
(16, '2024-10-22', 'income', 35000.00, '', '2024-10-22 03:42:48', '2024-10-22 04:37:47'),
(17, '2024-10-22', 'expense', 70000.00, '', '2024-10-22 05:13:07', '2024-10-22 05:13:07'),
(20, '2024-10-22', 'expense', 1500000.00, '', '2024-10-22 08:38:18', '2024-10-22 08:38:18');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_transaction_date` (`transaction_date`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
