-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 15, 2025 at 08:10 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `farm_inventory`
--

-- --------------------------------------------------------

--
-- Table structure for table `action_logs`
--

CREATE TABLE `action_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `action_type` enum('login','logout','add_item','update_item','delete_item','increase_stock','reduce_stock') NOT NULL,
  `description` text DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `action_logs`
--

INSERT INTO `action_logs` (`id`, `user_id`, `action_type`, `description`, `timestamp`) VALUES
(1, 2, 'login', 'User logged in', '2025-05-10 17:13:30'),
(2, 2, 'login', 'User logged in', '2025-05-10 17:13:41'),
(3, 2, 'login', 'User logged in', '2025-05-10 17:13:42'),
(4, 2, 'login', 'User logged in', '2025-05-10 17:13:42'),
(5, 2, 'login', 'User logged in', '2025-05-10 17:13:42'),
(6, 2, 'login', 'User logged in', '2025-05-10 17:13:42'),
(7, 2, 'login', 'User logged in', '2025-05-10 17:13:42'),
(8, 3, 'login', 'User logged in', '2025-05-10 17:15:05'),
(9, 2, 'login', 'User logged in', '2025-05-10 20:17:41'),
(10, 2, 'login', 'User logged in', '2025-05-10 20:17:41'),
(11, 2, 'login', 'User logged in', '2025-05-10 20:17:41'),
(12, 2, 'login', 'User logged in', '2025-05-10 20:17:41'),
(13, 2, 'login', 'User logged in', '2025-05-10 20:17:41'),
(14, 3, 'login', 'User logged in', '2025-05-10 22:24:54'),
(15, 2, 'login', 'User logged in', '2025-05-10 22:25:21'),
(16, 1, 'login', 'User logged in', '2025-05-10 22:25:41'),
(17, 1, 'login', 'User logged in', '2025-05-10 22:25:42'),
(18, 2, 'login', 'User logged in', '2025-05-11 00:40:48'),
(19, 2, 'login', 'User logged in', '2025-05-11 02:27:48'),
(20, 3, 'login', 'User logged in', '2025-05-11 02:43:01'),
(21, 3, 'login', 'User logged in', '2025-05-11 02:43:03'),
(22, 1, 'login', 'User logged in', '2025-05-11 02:44:05'),
(23, 2, 'login', 'User logged in', '2025-05-11 02:46:06'),
(24, 2, 'login', 'User logged in', '2025-05-12 00:28:29'),
(25, 2, 'login', 'User logged in', '2025-05-12 00:29:59'),
(26, 1, 'login', 'User logged in', '2025-05-12 00:31:42'),
(27, 2, 'login', 'User logged in', '2025-05-12 00:32:23'),
(28, 2, 'login', 'User logged in', '2025-05-12 00:35:36'),
(29, 2, 'login', 'User logged in', '2025-05-12 01:12:09'),
(30, 2, 'login', 'User logged in', '2025-05-12 01:24:20'),
(31, 2, 'login', 'User logged in', '2025-05-12 01:29:48'),
(32, 2, 'login', 'User logged in', '2025-05-12 02:36:21'),
(33, 1, 'login', 'User logged in', '2025-05-12 03:03:43'),
(34, 2, 'login', 'User logged in', '2025-05-12 03:19:41'),
(35, 2, 'login', 'User logged in', '2025-05-12 03:48:01'),
(36, 3, 'login', 'User logged in', '2025-05-12 04:59:07'),
(37, 1, 'login', 'User logged in', '2025-05-12 04:59:19'),
(38, 2, 'login', 'User logged in', '2025-05-12 04:59:38'),
(39, 3, 'login', 'User logged in', '2025-05-12 06:39:48'),
(40, 2, 'login', 'User logged in', '2025-05-12 06:41:19'),
(41, 1, 'login', 'User logged in', '2025-05-12 06:44:28'),
(42, 3, 'login', 'User logged in', '2025-05-12 06:45:11'),
(43, 2, 'login', 'User logged in', '2025-05-12 06:47:27'),
(44, 1, 'login', 'User logged in', '2025-05-12 08:29:52'),
(45, 3, 'login', 'User logged in', '2025-05-12 08:31:36'),
(46, 2, 'login', 'User logged in', '2025-05-12 08:38:38'),
(47, 2, 'login', 'User logged in', '2025-05-12 10:20:43'),
(48, 3, 'login', 'User logged in', '2025-05-12 16:48:53'),
(49, 1, 'login', 'User logged in', '2025-05-12 16:51:23'),
(50, 2, 'login', 'User logged in', '2025-05-12 16:56:12'),
(51, 2, 'login', 'User logged in', '2025-05-13 03:05:56'),
(52, 2, 'login', 'User logged in', '2025-05-13 04:32:58'),
(53, 2, 'login', 'User logged in', '2025-05-13 13:24:40'),
(54, 1, 'login', 'User logged in', '2025-05-13 13:25:02'),
(55, 3, 'login', 'User logged in', '2025-05-13 13:25:23'),
(56, 2, 'login', 'User logged in', '2025-05-13 13:25:44'),
(57, 2, 'login', 'User logged in', '2025-05-13 23:11:36'),
(58, 2, 'login', 'User logged in', '2025-05-13 23:11:55'),
(59, 2, 'login', 'User logged in', '2025-05-13 23:28:25'),
(60, 1, 'login', 'User logged in', '2025-05-14 01:00:39'),
(61, 3, 'login', 'User logged in', '2025-05-14 01:01:14'),
(62, 2, 'login', 'User logged in', '2025-05-14 01:01:30'),
(63, 2, 'login', 'User logged in', '2025-05-14 05:35:42'),
(64, 2, 'login', 'User logged in', '2025-05-14 06:37:36'),
(65, 2, 'reduce_stock', 'Reduced stock for item ID: 1 by -1 units.', '2025-05-14 07:04:35'),
(66, 2, 'reduce_stock', 'Reduced stock for item ID: 12 by -1 units.', '2025-05-14 07:07:22'),
(67, 1, 'login', 'User logged in', '2025-05-14 07:08:42'),
(68, 2, 'login', 'User logged in', '2025-05-14 07:09:15'),
(69, 2, 'increase_stock', 'Increased stock for item ID: 13 by 10 units.', '2025-05-14 07:14:34'),
(70, 2, 'increase_stock', 'Increased stock for item ID: 13 by 1 units.', '2025-05-14 07:15:16'),
(71, 2, 'increase_stock', 'Increased stock for item ID: 12 by 1 units.', '2025-05-14 07:15:22'),
(72, 2, 'increase_stock', 'Increased stock for item ID: 13 by 1 units.', '2025-05-14 07:25:25'),
(73, 2, 'reduce_stock', 'Reduced stock for item ID: 13 by -1 units.', '2025-05-14 07:46:02'),
(74, 2, 'login', 'User logged in', '2025-05-14 07:49:23'),
(75, 2, 'login', 'User logged in', '2025-05-14 07:49:43'),
(76, 2, 'login', 'User logged in', '2025-05-14 08:22:17'),
(77, 1, 'login', 'User logged in', '2025-05-14 08:25:23'),
(78, 3, 'login', 'User logged in', '2025-05-14 08:25:50'),
(79, 2, 'login', 'User logged in', '2025-05-14 08:26:04'),
(80, 2, 'increase_stock', 'Increased stock for item ID: 14 by 2 units.', '2025-05-14 08:26:40'),
(81, 2, 'increase_stock', 'Increased stock for item ID: 15 by 1 units.', '2025-05-14 09:42:19'),
(82, 2, 'increase_stock', 'Increased stock for item ID: 17 by 1 units.', '2025-05-14 09:44:33'),
(83, 2, 'increase_stock', 'Increased stock for item ID: 16 by 1 units.', '2025-05-14 09:44:39'),
(84, 2, 'increase_stock', 'Increased stock for item ID: 18 by 1 units.', '2025-05-14 09:44:41'),
(85, 2, 'increase_stock', 'Increased stock for item ID: 19 by 1 units.', '2025-05-14 09:55:31'),
(86, 2, 'increase_stock', 'Increased stock for item ID: 24 by 1 units.', '2025-05-14 13:14:30'),
(87, 2, 'reduce_stock', 'Reduced stock for item ID: 24 by -1 units.', '2025-05-14 13:14:45'),
(88, 1, 'login', 'User logged in', '2025-05-14 13:15:27'),
(89, 2, 'login', 'User logged in', '2025-05-14 13:16:18'),
(90, 2, 'increase_stock', 'Increased stock for item ID: 25 by 10 units.', '2025-05-14 13:17:24'),
(91, 2, 'increase_stock', 'Increased stock for item ID: 25 by 1 units.', '2025-05-14 13:39:22'),
(92, 2, 'increase_stock', 'Increased stock for item ID: 25 by 1 units.', '2025-05-14 13:39:24'),
(93, 2, 'reduce_stock', 'Reduced stock for item ID: 25 by -1 units.', '2025-05-14 13:39:26'),
(94, 2, 'increase_stock', 'Increased stock for item ID: 25 by 1 units.', '2025-05-14 16:45:20'),
(95, 2, 'increase_stock', 'Increased stock for item ID: 25 by 1 units.', '2025-05-14 16:45:25'),
(96, 2, 'increase_stock', 'Increased stock for item ID: 27 by 1 units.', '2025-05-14 20:21:57'),
(97, 2, 'reduce_stock', 'Reduced stock for item ID: 27 by -1 units.', '2025-05-14 20:26:08'),
(98, 2, 'increase_stock', 'Increased stock for item ID: 28 by 10 units.', '2025-05-14 20:27:06'),
(99, 2, 'reduce_stock', 'Reduced stock for item ID: 28 by -1 units.', '2025-05-14 20:27:09'),
(100, 2, 'reduce_stock', 'Reduced stock for item ID: 28 by -1 units.', '2025-05-14 20:44:02'),
(101, 2, 'reduce_stock', 'Reduced stock for item ID: 28 by -1 units.', '2025-05-14 20:56:51'),
(102, 2, 'increase_stock', 'Increased stock for item ID: 28 by 1 units.', '2025-05-14 21:02:44'),
(103, 2, 'increase_stock', 'Increased stock for item ID: 27 by 10 units.', '2025-05-14 21:03:03'),
(104, 2, 'reduce_stock', 'Reduced stock for item ID: 28 by -1 units.', '2025-05-14 21:16:15'),
(105, 2, 'reduce_stock', 'Reduced stock for item ID: 27 by -1 units.', '2025-05-14 21:16:20'),
(106, 2, 'increase_stock', 'Increased stock for item ID: 28 by 1 units.', '2025-05-14 21:16:48'),
(107, 2, 'reduce_stock', 'Reduced stock for item ID: 28 by -1 units.', '2025-05-14 21:16:55'),
(108, 2, 'increase_stock', 'Increased stock for item ID: 28 by 1 units.', '2025-05-14 21:17:40'),
(109, 2, 'increase_stock', 'Increased stock for item ID: 28 by 1 units.', '2025-05-14 21:23:16'),
(110, 2, 'reduce_stock', 'Reduced stock for item ID: 28 by -1 units.', '2025-05-14 21:26:17'),
(111, 2, 'increase_stock', 'Increased stock for item ID: 28 by 1 units.', '2025-05-14 21:35:46'),
(112, 2, 'reduce_stock', 'Reduced stock for item ID: 28 by -1 units.', '2025-05-14 21:43:42'),
(113, 2, 'increase_stock', 'Increased stock for item ID: 28 by 1 units.', '2025-05-14 21:50:02'),
(114, 2, 'reduce_stock', 'Reduced stock for item ID: 19 by -3 units.', '2025-05-14 21:50:23'),
(115, 2, 'reduce_stock', 'Reduced stock for item ID: 18 by -2 units.', '2025-05-14 21:50:42'),
(116, 2, 'reduce_stock', 'Reduced stock for item ID: 17 by -3 units.', '2025-05-14 21:50:49'),
(117, 2, 'reduce_stock', 'Reduced stock for item ID: 16 by -2 units.', '2025-05-14 21:50:52'),
(118, 2, 'reduce_stock', 'Reduced stock for item ID: 15 by -2 units.', '2025-05-14 21:50:54'),
(119, 2, 'reduce_stock', 'Reduced stock for item ID: 14 by -3 units.', '2025-05-14 21:50:57'),
(120, 2, 'reduce_stock', 'Reduced stock for item ID: 13 by -14 units.', '2025-05-14 21:51:03'),
(121, 2, 'reduce_stock', 'Reduced stock for item ID: 12 by -2 units.', '2025-05-14 21:51:05'),
(122, 2, 'reduce_stock', 'Reduced stock for item ID: 1 by -1 units.', '2025-05-14 21:51:10'),
(123, 1, 'login', 'User logged in', '2025-05-14 21:51:39'),
(124, 2, 'login', 'User logged in', '2025-05-14 21:52:25'),
(125, 2, 'increase_stock', 'Increased stock for item ID: 28 by 1 units.', '2025-05-14 22:14:38'),
(126, 2, 'increase_stock', 'Increased stock for item ID: 28 by 1 units.', '2025-05-14 22:14:46'),
(127, 2, 'increase_stock', 'Increased stock for item ID: 41 by 1 units.', '2025-05-14 12:10:33'),
(128, 2, 'increase_stock', 'Increased stock for item ID: 41 by 1 units.', '2025-05-14 12:36:53'),
(129, 2, 'reduce_stock', 'Reduced stock for item ID: 41 by -1 units.', '2025-05-14 12:37:03'),
(130, 2, 'reduce_stock', 'Reduced stock for item ID: 42 by -5 units.', '2025-05-14 12:51:52'),
(131, 2, 'reduce_stock', 'Reduced stock for item ID: 42 by -1 units.', '2025-05-14 13:29:14'),
(132, 2, 'reduce_stock', 'Reduced stock for item ID: 42 by -1 units.', '2025-05-14 13:29:24'),
(133, 2, 'increase_stock', 'Increased stock for item ID: 43 by 10 units.', '2025-05-14 13:30:01'),
(134, 2, 'reduce_stock', 'Reduced stock for item ID: 43 by -1 units.', '2025-05-14 13:30:06'),
(135, 2, 'increase_stock', 'Increased stock for item ID: 44 by 1 units.', '2025-05-14 13:54:26'),
(136, 2, 'reduce_stock', 'Reduced stock for item ID: 45 by -1 units.', '2025-05-14 13:54:47'),
(137, 2, 'reduce_stock', 'Reduced stock for item ID: 46 by -1 units.', '2025-05-14 14:06:45'),
(138, 2, 'reduce_stock', 'Reduced stock for item ID: 46 by -1 units.', '2025-05-14 14:06:49'),
(139, 2, 'increase_stock', 'Increased stock for item ID: 46 by 1 units.', '2025-05-14 14:06:55'),
(140, 2, 'increase_stock', 'Increased stock for item ID: 46 by 1 units.', '2025-05-14 14:07:00'),
(141, 2, 'increase_stock', 'Increased stock for item ID: 46 by 1 units.', '2025-05-14 14:32:52'),
(142, 2, 'reduce_stock', 'Reduced stock for item ID: 46 by -1 units.', '2025-05-14 14:32:54'),
(143, 2, 'reduce_stock', 'Reduced stock for item ID: 46 by -1 units.', '2025-05-14 14:33:03'),
(144, 2, 'reduce_stock', 'Reduced stock for item ID: 46 by -1 units.', '2025-05-14 14:34:03'),
(145, 2, 'increase_stock', 'Increased stock for item ID: 46 by 1 units.', '2025-05-14 14:34:09'),
(146, 2, 'reduce_stock', 'Reduced stock for item ID: 46 by -1 units.', '2025-05-14 14:35:11'),
(147, 2, 'increase_stock', 'Increased stock for item ID: 46 by 1 units.', '2025-05-14 14:35:15'),
(148, 2, 'reduce_stock', 'Reduced stock for item ID: 46 by -1 units.', '2025-05-14 14:35:45'),
(149, 2, 'increase_stock', 'Increased stock for item ID: 46 by 1 units.', '2025-05-14 14:35:51'),
(150, 2, 'reduce_stock', 'Reduced stock for item ID: 46 by -1 units.', '2025-05-14 14:36:18'),
(151, 2, 'reduce_stock', 'Reduced stock for item ID: 46 by -1 units.', '2025-05-14 14:39:23'),
(152, 2, 'reduce_stock', 'Reduced stock for item ID: 46 by -1 units.', '2025-05-14 14:42:45'),
(153, 2, 'reduce_stock', 'Reduced stock for item ID: 46 by -3 units.', '2025-05-14 14:44:10'),
(154, 2, 'increase_stock', 'Increased stock for item ID: 46 by 3 units.', '2025-05-14 14:44:22'),
(155, 2, 'reduce_stock', 'Reduced stock for item ID: 46 by -1 units.', '2025-05-14 15:04:23'),
(156, 2, 'reduce_stock', 'Reduced stock for item ID: 46 by -4 units.', '2025-05-14 15:04:49');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `label` varchar(100) NOT NULL,
  `is_system` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `label`, `is_system`, `created_at`) VALUES
(1, 'agricultural', 'Agricultural', 1, '2025-05-12 01:47:06'),
(2, 'non-agricultural', 'Non-Agricultural', 1, '2025-05-12 01:47:06');

-- --------------------------------------------------------

--
-- Table structure for table `items`
--

CREATE TABLE `items` (
  `id` int(11) NOT NULL,
  `predefined_item_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `harvest_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `items`
--

INSERT INTO `items` (`id`, `predefined_item_id`, `quantity`, `harvest_date`, `created_at`, `updated_at`) VALUES
(42, 1, 4, '2025-05-14', '2025-05-14 12:50:47', '2025-05-14 13:29:24'),
(43, 2, 10, '2025-05-02', '2025-05-14 13:29:46', '2025-05-14 13:30:06'),
(44, 3, 11, '2025-05-12', '2025-05-14 13:54:17', '2025-05-14 13:54:26'),
(45, 4, 9, '2025-05-01', '2025-05-14 13:54:40', '2025-05-14 13:54:46'),
(46, 6, 1, '2025-05-03', '2025-05-14 14:00:36', '2025-05-14 15:04:49'),
(47, 26, 1, '2025-05-14', '2025-05-14 17:42:25', '2025-05-14 17:42:25');

-- --------------------------------------------------------

--
-- Table structure for table `item_history`
--

CREATE TABLE `item_history` (
  `id` int(11) NOT NULL,
  `predefined_item_id` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `change_type` enum('add','reduce','increase') DEFAULT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp(),
  `harvest_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `item_history`
--

INSERT INTO `item_history` (`id`, `predefined_item_id`, `quantity`, `notes`, `change_type`, `date`, `harvest_date`) VALUES
(95, 1, 1, 'good', 'add', '2025-05-14 06:50:47', '2025-05-01'),
(96, 1, 10, 'so good', 'add', '2025-05-14 06:51:17', '2025-05-02'),
(97, 1, -5, 'bad', 'reduce', '2025-05-14 12:51:52', '2025-05-14'),
(98, 1, -1, 'Stock reduced', 'reduce', '2025-05-14 13:29:14', '2025-05-14'),
(99, 1, -1, 'Stock reduced', 'reduce', '2025-05-14 13:29:24', '2025-05-14'),
(100, 2, 1, 'Item Added', 'add', '2025-05-14 07:29:46', '2025-05-01'),
(101, 2, 10, 'Stock increased', 'increase', '2025-05-14 13:30:01', '2025-05-02'),
(102, 2, -1, 'Stock reduced', 'reduce', '2025-05-14 13:30:06', '2025-05-14'),
(103, 3, 10, 'Item Added', 'add', '2025-05-14 07:54:17', '2025-05-14'),
(104, 3, 1, 'Stock increased', 'increase', '2025-05-14 13:54:26', '2025-05-12'),
(105, 4, 10, 'Item Added', 'add', '2025-05-14 07:54:40', '2025-05-01'),
(106, 4, -1, 'Stock reduced', 'reduce', '2025-05-14 13:54:47', '2025-05-14'),
(107, 6, 10, 'Item Added', 'add', '2025-05-14 08:00:36', '2025-05-01'),
(108, 6, -1, 'Stock reduced', 'reduce', '2025-05-14 08:06:45', NULL),
(109, 6, -1, 'Stock reduced', 'reduce', '2025-05-14 08:06:49', NULL),
(110, 6, 1, 'Stock increased', 'increase', '2025-05-14 14:06:55', '2025-05-01'),
(111, 6, 1, 'Stock increased', 'increase', '2025-05-14 14:06:59', '2025-05-02'),
(112, 6, 1, 'Stock increased', 'increase', '2025-05-14 14:32:52', '2025-05-02'),
(113, 6, -1, 'Stock reduced', 'reduce', '2025-05-14 08:32:54', NULL),
(114, 6, -1, 'Stock reduced', 'reduce', '2025-05-14 08:33:03', NULL),
(115, 6, -1, 'Stock reduced', 'reduce', '2025-05-14 08:34:03', NULL),
(116, 6, 1, 'Stock increased', 'increase', '2025-05-14 14:34:09', '2025-05-02'),
(117, 6, -1, 'Stock reduced', 'reduce', '2025-05-14 08:35:11', NULL),
(118, 6, 1, 'Stock increased', 'increase', '2025-05-14 14:35:15', '2025-05-02'),
(119, 6, -1, 'Stock reduced', 'reduce', '2025-05-14 08:35:45', NULL),
(120, 6, 1, 'Stock increased', 'increase', '2025-05-14 14:35:51', '2025-05-02'),
(121, 6, -1, 'Stock reduced', 'reduce', '2025-05-14 08:36:18', NULL),
(122, 6, -1, 'Stock reduced', 'reduce', '2025-05-14 08:39:23', NULL),
(123, 6, -1, 'Stock reduced', 'reduce', '2025-05-14 08:42:45', NULL),
(124, 6, -3, 'Stock reduced', 'reduce', '2025-05-14 08:44:10', NULL),
(125, 6, 3, 'Stock increased', 'increase', '2025-05-14 14:44:22', '2025-05-03'),
(126, 6, -1, 'Stock reduced', 'reduce', '2025-05-14 09:04:23', NULL),
(127, 6, -4, 'Stock reduced', 'reduce', '2025-05-14 09:04:49', NULL),
(128, 26, 1, 'Item Added', 'add', '2025-05-14 11:42:25', '2025-05-14');

-- --------------------------------------------------------

--
-- Table structure for table `legacy_categories`
--

CREATE TABLE `legacy_categories` (
  `id` int(11) NOT NULL,
  `main_category` varchar(50) NOT NULL,
  `main_category_label` varchar(100) NOT NULL,
  `subcategory` varchar(50) NOT NULL,
  `subcategory_label` varchar(100) NOT NULL,
  `is_system` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `legacy_categories`
--

INSERT INTO `legacy_categories` (`id`, `main_category`, `main_category_label`, `subcategory`, `subcategory_label`, `is_system`, `created_at`) VALUES
(1, 'agricultural', 'Agricultural', 'vegetables', 'Vegetables', 1, '2025-05-12 01:43:03'),
(2, 'agricultural', 'Agricultural', 'soil', 'Soil', 1, '2025-05-12 01:43:03'),
(3, 'agricultural', 'Agricultural', 'fertilizer', 'Fertilizer', 1, '2025-05-12 01:43:03'),
(4, 'agricultural', 'Agricultural', 'cocopots', 'Cocopots', 1, '2025-05-12 01:43:03'),
(5, 'agricultural', 'Agricultural', 'seedlings', 'Seedlings', 1, '2025-05-12 01:43:03'),
(6, 'non-agricultural', 'Non-Agricultural', 'repurposed_items', 'Repurposed Items', 1, '2025-05-12 01:43:03');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_requests`
--

CREATE TABLE `password_reset_requests` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `requested_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `predefined_items`
--

CREATE TABLE `predefined_items` (
  `id` int(11) NOT NULL,
  `subcat_id` int(11) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `unit` enum('Kgs','Pcs') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `main_category_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `predefined_items`
--

INSERT INTO `predefined_items` (`id`, `subcat_id`, `name`, `unit`, `created_at`, `main_category_id`) VALUES
(1, 1, 'Ampalaya', 'Kgs', '2025-05-11 21:19:09', 1),
(2, 1, 'Gabi', 'Kgs', '2025-05-11 21:19:09', 1),
(3, 1, 'Kalabasa', 'Kgs', '2025-05-11 21:19:09', 1),
(4, 1, 'Kamatis', 'Kgs', '2025-05-11 21:19:09', 1),
(5, 1, 'Kamias', 'Kgs', '2025-05-11 21:19:09', 1),
(6, 1, 'Kamote', 'Kgs', '2025-05-11 21:19:09', 1),
(7, 1, 'Kangkong', 'Kgs', '2025-05-11 21:19:09', 1),
(8, 1, 'Luya', 'Kgs', '2025-05-11 21:19:09', 1),
(9, 1, 'Malunggay', 'Kgs', '2025-05-11 21:19:09', 1),
(10, 1, 'Mustasa', 'Kgs', '2025-05-11 21:19:09', 1),
(11, 1, 'Okra', 'Kgs', '2025-05-11 21:19:09', 1),
(12, 1, 'Oregano', 'Kgs', '2025-05-11 21:19:09', 1),
(13, 1, 'Patola', 'Kgs', '2025-05-11 21:19:09', 1),
(14, 1, 'Pechay', 'Kgs', '2025-05-11 21:19:09', 1),
(15, 1, 'Papaya', 'Kgs', '2025-05-11 21:19:09', 1),
(16, 1, 'Siling Haba', 'Kgs', '2025-05-11 21:19:09', 1),
(17, 1, 'Sitaw', 'Kgs', '2025-05-11 21:19:09', 1),
(18, 1, 'Talbos ng Kamote', 'Kgs', '2025-05-11 21:19:09', 1),
(19, 1, 'Talong', 'Kgs', '2025-05-11 21:19:09', 1),
(20, 6, 'Clothes', 'Pcs', '2025-05-11 21:19:09', 2),
(21, 6, 'Rugs', 'Pcs', '2025-05-11 21:19:09', 2),
(22, 6, 'Bags', 'Pcs', '2025-05-11 21:19:09', 2),
(23, 6, 'Ecobricks', 'Pcs', '2025-05-11 21:19:09', 2),
(25, 7, 'Mahogany', 'Kgs', '2025-05-14 17:20:23', 1),
(26, 3, 'Liquid Fertilizer', 'Pcs', '2025-05-14 17:42:16', 1);

-- --------------------------------------------------------

--
-- Table structure for table `subcategories`
--

CREATE TABLE `subcategories` (
  `id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `label` varchar(100) NOT NULL,
  `unit` enum('kg','pcs') DEFAULT 'kg',
  `is_system` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subcategories`
--

INSERT INTO `subcategories` (`id`, `category_id`, `name`, `label`, `unit`, `is_system`, `created_at`) VALUES
(1, 1, 'vegetables', 'Vegetables', 'kg', 1, '2025-05-12 01:47:13'),
(2, 1, 'soil', 'Soil', 'kg', 1, '2025-05-12 01:47:13'),
(3, 1, 'fertilizer', 'Fertilizer', 'kg', 1, '2025-05-12 01:47:13'),
(4, 1, 'cocopots', 'Cocopots', 'pcs', 1, '2025-05-12 01:47:13'),
(5, 1, 'seedlings', 'Seedlings', 'pcs', 1, '2025-05-12 01:47:13'),
(6, 2, 'repurposed_items', 'Repurposed Items', 'pcs', 1, '2025-05-12 01:47:13'),
(7, 1, 'trees', 'Trees', '', 0, '2025-05-14 17:11:37');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','operator','supervisor') NOT NULL,
  `contact` varchar(100) DEFAULT NULL,
  `subdivision` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `role`, `contact`, `subdivision`, `created_at`, `updated_at`) VALUES
(1, 'supervisor1', 'sup@example.com', 'su123', 'supervisor', '09171234567', 'Phase 1', '2025-05-10 16:44:07', '2025-05-11 02:26:32'),
(2, 'operator1', 'op@example.com', 'op123', 'operator', '09179876543', 'Phase 2', '2025-05-10 16:44:07', '2025-05-11 02:24:45'),
(3, 'user1', 'user@example.com', 'us123', 'user', '09179998888', 'Block 3', '2025-05-10 16:44:07', '2025-05-11 02:25:51');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `action_logs`
--
ALTER TABLE `action_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `predefined_item_id` (`predefined_item_id`);

--
-- Indexes for table `item_history`
--
ALTER TABLE `item_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `predefined_item_id` (`predefined_item_id`);

--
-- Indexes for table `legacy_categories`
--
ALTER TABLE `legacy_categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_reset_requests`
--
ALTER TABLE `password_reset_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `approved_by` (`approved_by`);

--
-- Indexes for table `predefined_items`
--
ALTER TABLE `predefined_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`subcat_id`),
  ADD KEY `fk_main_category` (`main_category_id`);

--
-- Indexes for table `subcategories`
--
ALTER TABLE `subcategories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `action_logs`
--
ALTER TABLE `action_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=157;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `items`
--
ALTER TABLE `items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT for table `item_history`
--
ALTER TABLE `item_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=129;

--
-- AUTO_INCREMENT for table `legacy_categories`
--
ALTER TABLE `legacy_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `password_reset_requests`
--
ALTER TABLE `password_reset_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `predefined_items`
--
ALTER TABLE `predefined_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `subcategories`
--
ALTER TABLE `subcategories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `action_logs`
--
ALTER TABLE `action_logs`
  ADD CONSTRAINT `action_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `items`
--
ALTER TABLE `items`
  ADD CONSTRAINT `items_ibfk_1` FOREIGN KEY (`predefined_item_id`) REFERENCES `predefined_items` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `item_history`
--
ALTER TABLE `item_history`
  ADD CONSTRAINT `item_history_ibfk_1` FOREIGN KEY (`predefined_item_id`) REFERENCES `predefined_items` (`id`);

--
-- Constraints for table `password_reset_requests`
--
ALTER TABLE `password_reset_requests`
  ADD CONSTRAINT `password_reset_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `password_reset_requests_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `predefined_items`
--
ALTER TABLE `predefined_items`
  ADD CONSTRAINT `fk_main_category` FOREIGN KEY (`main_category_id`) REFERENCES `categories` (`id`),
  ADD CONSTRAINT `fk_predefined_items_subcat` FOREIGN KEY (`subcat_id`) REFERENCES `subcategories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `subcategories`
--
ALTER TABLE `subcategories`
  ADD CONSTRAINT `subcategories_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
