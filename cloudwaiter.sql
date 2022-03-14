-- phpMyAdmin SQL Dump
-- version 4.8.0.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 31, 2008 at 05:01 PM
-- Server version: 10.1.32-MariaDB
-- PHP Version: 7.2.5

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cloudwaiter`
--

-- --------------------------------------------------------

--
-- Table structure for table `crew`
--

CREATE TABLE `crew` (
  `crew_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `account_type` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `crew`
--

INSERT INTO `crew` (`crew_id`, `name`, `username`, `password`, `account_type`, `status`) VALUES
(1, 'Tony Stark', 'tony_stark', 'ironman08', 'admin', 'Active'),
(2, 'Pepper Potts', 'pepper_potts', 'vovo_mo', 'cashier', 'Active'),
(3, 'Ban', 'ban_undead', 'fox_greed', 'kitchen', 'Active');

-- --------------------------------------------------------

--
-- Table structure for table `customer`
--

CREATE TABLE `customer` (
  `customer_id` int(11) NOT NULL,
  `table_no` int(11) NOT NULL,
  `log_in` date NOT NULL,
  `log_out` date DEFAULT NULL,
  `order_id` varchar(767) DEFAULT NULL,
  `payment_id` varchar(767) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `item`
--

CREATE TABLE `item` (
  `item_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `price` double NOT NULL,
  `class` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `item`
--

INSERT INTO `item` (`item_id`, `name`, `price`, `class`) VALUES
(1, 'Bacon mushroom and melted cheese', 120, 'Burgers'),
(2, 'Barbeque sauce and onions', 100, 'Burgers'),
(3, 'Chili con carne', 130, 'Burgers'),
(4, 'Ham egg ketchup and mayonnaise', 130, 'Burgers'),
(5, 'Ketchup mustard and mayonnaise', 90, 'Burgers'),
(6, 'Sriracha-Honey', 60, 'Chicken Wings'),
(7, 'Honey Mustard', 60, 'Chicken Wings'),
(8, 'Honey Barbeque', 60, 'Chicken Wings'),
(9, 'Jumbo Strips', 60, 'Chicken Wings'),
(10, 'Soy Honey', 60, 'Chicken Wings'),
(11, 'Burger Steak', 120, 'Rice Meals'),
(12, 'Chicken Wings with Rice', 140, 'Rice Meals'),
(13, 'French Fries', 40, 'Sides'),
(14, 'Tuna Lumpia', 40, 'Sides'),
(15, 'Patty', 60, 'Extras'),
(16, 'Ham', 30, 'Extras'),
(17, 'Bacon', 20, 'Extras'),
(18, 'Rice', 20, 'Extras'),
(19, 'Egg', 15, 'Extras'),
(20, 'Barbeque', 15, 'Extras'),
(21, 'Lettuce', 10, 'Extras'),
(22, 'Bottled Water', 20, 'Drinks'),
(23, 'Milkshake', 100, 'Drinks'),
(24, 'Coca-Cola', 30, 'Drinks'),
(25, 'Coke Float', 50, 'Drinks'),
(26, 'Lemonade', 30, 'Drinks'),
(27, 'Red Iced Tea', 35, 'Drinks'),
(28, 'Sprite', 30, 'Drinks');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `order_id` int(11) NOT NULL,
  `date_time` datetime NOT NULL,
  `status` varchar(255) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `table_no` int(11) NOT NULL,
  `payment_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `payment`
--

CREATE TABLE `payment` (
  `payment_id` int(11) NOT NULL,
  `cost` double NOT NULL,
  `cash` double DEFAULT NULL,
  `change_` double DEFAULT NULL,
  `order_id` int(11) DEFAULT NULL,
  `item_name` text NOT NULL,
  `item_qty` text NOT NULL,
  `cost_item` text NOT NULL,
  `status` varchar(255) NOT NULL,
  `date_time` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `restaurant`
--

CREATE TABLE `restaurant` (
  `restaurant` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `branches` text NOT NULL,
  `official_site` varchar(255) NOT NULL,
  `facebook_page` varchar(255) NOT NULL,
  `twitter_page` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `restaurant`
--

INSERT INTO `restaurant` (`restaurant`, `description`, `branches`, `official_site`, `facebook_page`, `twitter_page`) VALUES
('SideWalk Café', 'A SideWalk Cafe is an outdoor part of a coffeehouse or cafe. It is a must-go place where customers go to relax,dine and socialize. Other activities in the SideWalk Cafe includes studying, reading, and playing board games.', 'SM City Cebu, SM City Dasmariñas, SM City Lucena, SM City Naga, SM Mall of Asia', 'https://www.sidewalkcafe.com', 'https://www.facebook.com/SideWalkCafeBos', 'https://www.twitter.com/SideWalkCafeBos');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) UNSIGNED NOT NULL,
  `data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`session_id`, `expires`, `data`) VALUES
('bRDvWn2Q5kxi10bH29djNbTL9-xuskME', 1230849990, '{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"admin\":\"pepper_potts\",\"type\":\"cashier\"}');

-- --------------------------------------------------------

--
-- Table structure for table `slider`
--

CREATE TABLE `slider` (
  `slider_id` int(11) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `caption` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `slider`
--

INSERT INTO `slider` (`slider_id`, `filename`, `caption`) VALUES
(1, '1.jpg', NULL),
(2, '2.jpg', NULL),
(3, '3.jpg', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `tables`
--

CREATE TABLE `tables` (
  `table_id` int(11) NOT NULL,
  `table_no` int(11) NOT NULL,
  `status` varchar(255) NOT NULL,
  `customer_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `tables`
--

INSERT INTO `tables` (`table_id`, `table_no`, `status`, `customer_id`) VALUES
(1, 1, 'vacant', NULL),
(2, 2, 'vacant', NULL),
(3, 3, 'vacant', NULL),
(4, 4, 'vacant', NULL),
(5, 5, 'vacant', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `crew`
--
ALTER TABLE `crew`
  ADD PRIMARY KEY (`crew_id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `customer`
--
ALTER TABLE `customer`
  ADD PRIMARY KEY (`customer_id`),
  ADD UNIQUE KEY `payment_id` (`payment_id`),
  ADD UNIQUE KEY `order_id` (`order_id`);

--
-- Indexes for table `item`
--
ALTER TABLE `item`
  ADD PRIMARY KEY (`item_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`order_id`),
  ADD UNIQUE KEY `payment_id` (`payment_id`);

--
-- Indexes for table `payment`
--
ALTER TABLE `payment`
  ADD PRIMARY KEY (`payment_id`),
  ADD UNIQUE KEY `order_id` (`order_id`);

--
-- Indexes for table `restaurant`
--
ALTER TABLE `restaurant`
  ADD PRIMARY KEY (`restaurant`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`);

--
-- Indexes for table `slider`
--
ALTER TABLE `slider`
  ADD PRIMARY KEY (`slider_id`);

--
-- Indexes for table `tables`
--
ALTER TABLE `tables`
  ADD PRIMARY KEY (`table_id`),
  ADD UNIQUE KEY `customer_id` (`customer_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `crew`
--
ALTER TABLE `crew`
  MODIFY `crew_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `customer`
--
ALTER TABLE `customer`
  MODIFY `customer_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `item`
--
ALTER TABLE `item`
  MODIFY `item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payment`
--
ALTER TABLE `payment`
  MODIFY `payment_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `slider`
--
ALTER TABLE `slider`
  MODIFY `slider_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `tables`
--
ALTER TABLE `tables`
  MODIFY `table_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
