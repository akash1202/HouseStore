-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 07, 2021 at 08:51 AM
-- Server version: 10.4.13-MariaDB
-- PHP Version: 7.4.8

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `house_store`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `addfirsttocart` (IN `itemid` INT, IN `customerid` INT)  BEGIN
DECLARE itemscount INT DEFAULT 0;
DECLARE cartids INT DEFAULT 0;
DECLARE cartid INT DEFAULT 0;
SELECT COUNT(DISTINCTROW `id`) INTO cartids FROM `cart` WHERE `cart`.`customer_id`=customerid AND `cart`.`payment_id` IS NULL;
IF cartids < 1 THEN
	INSERT INTO `cart`(`customer_id`,`payment_id`,`modified_at`) VALUES(customerid,NULL,CURRENT_TIMESTAMP());
END IF;
SELECT `cart`.id INTO cartid FROM `cart` WHERE `cart`.`customer_id`=customerid AND `cart`.`payment_id` IS NULL;
SELECT COUNT(*) INTO itemscount FROM `cart_items` JOIN `cart` WHERE `cart_items`.`product_id`=itemid AND `cart`.`customer_id`=customerid AND `cart`.`id` = `cart_items`.`cart_id` AND `cart`.`payment_id` IS NULL;
IF itemscount > 0 THEN
   CALL addmoretocart(itemid,customerid);
ELSE
   INSERT INTO `cart_items`(`product_id`,`cart_id`,`quantity`,`customer_id`,`created`,`modified`) VALUES (itemid,cartid,1,customerid,CURRENT_TIMESTAMP(),CURRENT_TIMESTAMP());
   UPDATE `product` SET `product`.`availablecount`=`product`.`availablecount`-1 WHERE `product`.`product_id`=itemid;
   SELECT DISTINCTROW (`product`.product_id),`product`.name,`product`.price,`product`.image,`cart_items`.`quantity`,`cart_items`.`cart_id`,`cart_items`.`customer_id` FROM `product` JOIN `cart_items` ON `product`.product_id=`cart_items`.product_id  JOIN `cart` ON `cart_items`.cart_id=`cart`.id WHERE `cart`.`payment_id` IS NULL AND `cart_items`.customer_id=customerid GROUP by `cart_items`.id;
END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `addmoretocart` (IN `itemid` INT, IN `customerid` INT)  BEGIN 
UPDATE `cart_items` SET `quantity`=`quantity`+1 WHERE `customer_id`= customerid AND `product_id`=itemid; 
UPDATE `product` SET `product`.`availablecount`=`product`.`availablecount`-1 WHERE `product`.`product_id`=itemid;
SELECT DISTINCTROW (`product`.product_id),`product`.name,`product`.price,`product`.image,`cart_items`.`quantity`,`cart_items`.`cart_id`,`cart_items`.`customer_id` FROM `product` JOIN `cart_items` ON `product`.product_id=`cart_items`.product_id  JOIN `cart` ON `cart_items`.cart_id=`cart`.id WHERE `cart`.`payment_id` IS NULL AND `cart_items`.customer_id=customerid GROUP by `cart_items`.id;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `allorders` ()  NO SQL
BEGIN
SELECT `product`.product_id,`product`.name,`product`.price,`product`.image,`cart_items`.`id`,`cart_items`.quantity,`cart_items`.modified,`customer`.name AS `buyer` FROM `cart` JOIN `cart_items` ON `cart`.id = `cart_items`.cart_id JOIN `customer` ON `cart_items`.customer_id=`customer`.customer_id JOIN `product` ON `cart_items`.product_id =`product`.product_id where `cart`.customer_id=`customer`.`customer_id` AND `cart`.payment_id IS NOT NULL ORDER BY cart_items.modified ASC;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `cart` (IN `customerid` INT)  NO SQL
SELECT * FROM `product` JOIN `cart_items` ON `cart_items`.product_id =`product`.product_id JOIN `cart` ON `cart`.id=`cart_items`.cart_id WHERE `cart_items`.customer_id=customerid AND `cart`.`payment_id` IS NULL$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `dropfromcart` (IN `itemid` INT, IN `customerid` INT)  BEGIN 
UPDATE `cart_items` SET `quantity`=`quantity`-1 WHERE `customer_id`= customerid AND `product_id`=itemid; 
UPDATE `product` SET `product`.`availablecount`=`product`.`availablecount`+1 WHERE `product`.`product_id`=itemid;
SELECT * FROM `cart_items` JOIN `product` ON `cart_items`.product_id =`product`.product_id WHERE `cart_items`.customer_id=customerid;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `orders` (IN `customerid` INT)  BEGIN
SELECT product.product_id,product.name,product.price,product.image,cart_items.quantity,cart_items.modified FROM `cart` JOIN `cart_items` ON `cart`.id = `cart_items`.cart_id JOIN `product` ON cart_items.product_id=product.product_id where `cart`.customer_id=customerid AND cart.payment_id IS NOT NULL ORDER BY cart_items.modified ASC;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `paid` (IN `cartid` INT(15), IN `customerid` INT(15), IN `cardnumber` VARCHAR(50), IN `cardname` VARCHAR(50), IN `cardexp` VARCHAR(50), IN `cardcvv` VARCHAR(50), IN `amount` INT, IN `address1` VARCHAR(100), IN `address2` VARCHAR(100), IN `city` VARCHAR(30), IN `state` VARCHAR(30), IN `pincode` VARCHAR(8), IN `phone` VARCHAR(15))  BEGIN
DECLARE pid INT DEFAULT 0;
INSERT INTO `payment`(`customer_id`, `fullname`, `cardno`, `exp`, `cvv`, `amount`) VALUES (customerid,cardname,cardnumber,cardexp,cardcvv,amount);
SELECT `payment`.`payment_id` INTO pid from `payment` WHERE `payment`.`customer_id`=customerid ORDER BY `payment`.`payment_id` DESC LIMIT 1;
UPDATE `cart` SET `cart`.payment_id=pid;
INSERT INTO `orders`(`customer_id`,`cart_id`,`payment_id`,`address1`,`address2`,`city`,`state`,`pincode`,`phone`) VALUES(customerid,cartid,pid,address1,address2,city,state,pincode,phone);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `updatecart` (IN `productid` INT, IN `cartid` INT, IN `customerid` INT, IN `quantity` INT)  NO SQL
BEGIN
INSERT INTO `cart_items` (`product_id`, `quantity`,`cart_id`,`customer_id`) VALUES(productid,quantity,cartid,customerid) ON DUPLICATE KEY UPDATE    
`prodcut_id`=productid, `cart_items`.quantity=quantity,`cart_items`.cart_id=cartid,
`cart_items`.customer_id=customerid,`cart_items`.modified=CURRENT_TIMESTAMP();

END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `updatecartitem` (IN `productid` INT, IN `quantity` INT, IN `cartid` INT)  BEGIN
update `cart_items` set `cart_items`.`quantity`=quantity where `cart_items`.`product_id`=productid and `cart_items`.`cart_id`=cartid;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `admin_id` int(15) NOT NULL,
  `name` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `password` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`admin_id`, `name`, `email`, `phone`, `password`) VALUES
(1, 'admin', 'admin@gmail.com', '5151515252', 'admin');

-- --------------------------------------------------------

--
-- Table structure for table `cart`
--

CREATE TABLE `cart` (
  `id` int(15) NOT NULL,
  `customer_id` int(15) DEFAULT NULL,
  `payment_id` int(15) DEFAULT 0,
  `modified_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `cart`
--

INSERT INTO `cart` (`id`, `customer_id`, `payment_id`, `modified_at`) VALUES
(1, 3, 8, '2021-05-28 00:02:05'),
(4, 1, 8, '2021-05-28 05:52:40'),
(5, 4, 8, '2021-05-28 05:53:03'),
(6, 2, 8, '2021-05-28 06:33:32'),
(7, 4, 8, '2021-05-28 07:21:21'),
(8, 3, 8, '2021-05-28 07:51:54'),
(9, 2, 8, '2021-05-29 05:22:17'),
(10, 1, 8, '2021-05-29 05:48:10'),
(11, 1, 8, '2021-05-29 12:10:18'),
(12, 3, 8, '2021-05-29 13:44:05'),
(13, 3, 8, '2021-05-31 17:29:15'),
(14, 3, 8, '2021-06-03 22:32:45'),
(15, 3, NULL, '2021-06-04 00:32:48');

-- --------------------------------------------------------

--
-- Table structure for table `cart_items`
--

CREATE TABLE `cart_items` (
  `id` int(15) NOT NULL,
  `product_id` int(15) NOT NULL,
  `quantity` int(20) NOT NULL,
  `cart_id` int(15) DEFAULT NULL,
  `customer_id` int(15) NOT NULL,
  `created` timestamp NULL DEFAULT current_timestamp(),
  `modified` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `cart_items`
--

INSERT INTO `cart_items` (`id`, `product_id`, `quantity`, `cart_id`, `customer_id`, `created`, `modified`) VALUES
(1, 3, 5, 1, 3, '2021-05-11 23:17:37', '2021-05-12 23:17:37'),
(2, 2, 50, 1, 3, '2021-05-14 23:17:37', '2021-05-16 23:17:37'),
(3, 5, 2, 8, 3, '2021-05-28 07:57:29', '2021-05-28 07:57:29'),
(4, 4, 2, 8, 3, '2021-05-28 08:06:34', '2021-05-28 08:06:34'),
(5, 3, 5, 8, 3, '2021-05-28 15:27:27', '2021-05-28 15:27:27'),
(6, 2, 19, 8, 3, '2021-05-28 15:38:31', '2021-05-28 15:38:31'),
(7, 7, 2, 8, 3, '2021-05-28 17:26:14', '2021-05-28 17:26:14'),
(8, 4, 1, 9, 2, '2021-05-29 05:22:17', '2021-05-29 05:22:17'),
(9, 2, 11, 10, 1, '2021-05-29 05:48:10', '2021-05-29 05:48:10'),
(10, 5, 10, 10, 1, '2021-05-29 05:48:17', '2021-05-29 05:48:17'),
(11, 2, 10, 11, 1, '2021-05-29 12:10:18', '2021-05-29 12:10:18'),
(18, 2, 4, 15, 3, '2021-06-04 00:32:48', '2021-06-04 00:32:48'),
(19, 5, 1, 15, 3, '2021-06-04 14:47:15', '2021-06-04 14:47:15');

-- --------------------------------------------------------

--
-- Table structure for table `contactus`
--

CREATE TABLE `contactus` (
  `id` int(10) NOT NULL,
  `name` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `subject` varchar(75) NOT NULL,
  `message` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `contactus`
--

INSERT INTO `contactus` (`id`, `name`, `email`, `subject`, `message`) VALUES
(1, 'abc', 'abc@gmail.com', 'abc', 'aaa message'),
(2, 'abc', 'abc@gmail.com', 'abc', 'aaa message'),
(3, 'abc', 'abc@gmail.com', 'abc', 'aaa message'),
(4, 'abc', 'abc@gmail.com', 'abc', 'aaa message');

-- --------------------------------------------------------

--
-- Table structure for table `customer`
--

CREATE TABLE `customer` (
  `customer_id` int(15) NOT NULL,
  `name` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(50) NOT NULL,
  `phone` varchar(15) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `customer`
--

INSERT INTO `customer` (`customer_id`, `name`, `email`, `password`, `phone`) VALUES
(1, 'sagar', 'sagar@gmail.com', 'sagar123', '5142063938'),
(2, 'dhwani', 'dhwani@gmail.com', 'dhwani123', '5145730511'),
(3, 'ab', 'ab@gmail.com', 'ababab', '5151514545'),
(4, 'abc', 'abc@gmail.com', 'abc', '5145755625');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(15) NOT NULL,
  `customer_id` int(15) NOT NULL,
  `cart_id` int(15) NOT NULL,
  `payment_id` int(15) NOT NULL,
  `address1` varchar(100) DEFAULT NULL,
  `address2` varchar(100) DEFAULT NULL,
  `city` varchar(30) DEFAULT NULL,
  `state` varchar(30) DEFAULT NULL,
  `pincode` varchar(8) DEFAULT NULL,
  `phone` varchar(15) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `customer_id`, `cart_id`, `payment_id`, `address1`, `address2`, `city`, `state`, `pincode`, `phone`) VALUES
(1, 3, 14, 8, '1645, Boulevard de Maisonneuve Ouest', '1814', 'Montreal', 'Quebec', 'H3H 2N3', '5145755625');

-- --------------------------------------------------------

--
-- Table structure for table `payment`
--

CREATE TABLE `payment` (
  `payment_id` int(15) NOT NULL,
  `customer_id` int(15) NOT NULL,
  `fullname` varchar(50) NOT NULL,
  `cardno` varchar(50) NOT NULL,
  `exp` varchar(50) NOT NULL,
  `cvv` varchar(50) NOT NULL,
  `amount` float NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `payment`
--

INSERT INTO `payment` (`payment_id`, `customer_id`, `fullname`, `cardno`, `exp`, `cvv`, `amount`) VALUES
(1, 3, 'AB AB', '2450 4550 4560 1223', '03/23', '214', 0),
(2, 2, 'dhwani patel', '4556 5664 4225 1232', '02/25', '251', 1500),
(3, 1, 'Sagar Shah', '4545 5656 4747 8686', '02/23', '223', 2500),
(4, 1, 'Sagar Shah', '4545565647478686', '03/23', '213', 315),
(5, 3, 'ab', '4545525233446655', '03/23', '214', 510),
(6, 3, 'ab', '4545525233446655', '03/21', '213', 50),
(7, 3, 'ab', '5214562525652321', '03/23', '123', 90),
(8, 3, 'ab', '5521524156252323', '03/22', '213', 100);

-- --------------------------------------------------------

--
-- Table structure for table `product`
--

CREATE TABLE `product` (
  `product_id` int(15) NOT NULL,
  `name` varchar(50) NOT NULL,
  `price` float NOT NULL,
  `image` varchar(200) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `type` varchar(15) NOT NULL,
  `quantity` int(15) NOT NULL,
  `sellername` varchar(50) DEFAULT NULL,
  `availablecount` int(15) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `product`
--

INSERT INTO `product` (`product_id`, `name`, `price`, `image`, `description`, `type`, `quantity`, `sellername`, `availablecount`) VALUES
(2, 'Pillow', 25, 'images/01.jpg', 'this pillow gives you a peace of mind', 'bedroom', 20, 'seller_montreal', 6),
(3, 'Sofa', 45, 'images/02.webp', 'people can comfortably sit on together... Sofas are typically upholstered, with a high back and arms.', 'livingroom', 15, 'seller_toronto', 49),
(4, 'timer', 10, 'images/timer.png', 'this is timer', 'kitchen', 12, 'seller1', 40),
(5, 'Utensils', 10, 'images/utensils.jpg', 'To prepare your meal instantly without worry', 'kitchen', 12, 'krishna traders', 24),
(7, 'Rocking Chair', 25, 'images/rocking_chair.jpg', 'Get a rest in Your Garden too...', 'outdoor', 15, 'Seller_montreal', 13),
(8, 'String Chair', 10, 'images/string_chair.jpg', 'Best Show Piece as well', 'outdoor', 20, 'seller_toronto', 30);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`admin_id`);

--
-- Indexes for table `cart`
--
ALTER TABLE `cart`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_payment_id` (`payment_id`),
  ADD KEY `FK_customer_id` (`customer_id`) USING BTREE;

--
-- Indexes for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_customer_id` (`customer_id`),
  ADD KEY `FK_product_id` (`product_id`),
  ADD KEY `FK_cart_id` (`cart_id`);

--
-- Indexes for table `contactus`
--
ALTER TABLE `contactus`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `customer`
--
ALTER TABLE `customer`
  ADD PRIMARY KEY (`customer_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `cart_id` (`cart_id`),
  ADD KEY `payment_id` (`payment_id`);

--
-- Indexes for table `payment`
--
ALTER TABLE `payment`
  ADD PRIMARY KEY (`payment_id`),
  ADD KEY `fkcustomerid` (`customer_id`);

--
-- Indexes for table `product`
--
ALTER TABLE `product`
  ADD PRIMARY KEY (`product_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `admin_id` int(15) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `cart`
--
ALTER TABLE `cart`
  MODIFY `id` int(15) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id` int(15) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `contactus`
--
ALTER TABLE `contactus`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `customer`
--
ALTER TABLE `customer`
  MODIFY `customer_id` int(15) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(15) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `payment`
--
ALTER TABLE `payment`
  MODIFY `payment_id` int(15) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `product`
--
ALTER TABLE `product`
  MODIFY `product_id` int(15) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cart`
--
ALTER TABLE `cart`
  ADD CONSTRAINT `FK_payment_id` FOREIGN KEY (`payment_id`) REFERENCES `payment` (`payment_id`),
  ADD CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`);

--
-- Constraints for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `FK_cart_id` FOREIGN KEY (`cart_id`) REFERENCES `cart` (`id`),
  ADD CONSTRAINT `FK_customer_id` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`),
  ADD CONSTRAINT `FK_product_id` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`);

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_cartid` FOREIGN KEY (`cart_id`) REFERENCES `cart` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_customerid` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_paymentid` FOREIGN KEY (`payment_id`) REFERENCES `payment` (`payment_id`) ON DELETE CASCADE;

--
-- Constraints for table `payment`
--
ALTER TABLE `payment`
  ADD CONSTRAINT `fkcustomerid` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
