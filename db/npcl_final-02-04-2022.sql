-- phpMyAdmin SQL Dump
-- version 5.1.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 02, 2022 at 04:48 PM
-- Server version: 10.4.22-MariaDB
-- PHP Version: 7.4.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `npcl_final`
--

-- --------------------------------------------------------

--
-- Table structure for table `answer_list`
--

CREATE TABLE `answer_list` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `question_id` int(11) NOT NULL,
  `answer` varchar(1000) DEFAULT NULL,
  `status` int(11) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `answer_list`
--

INSERT INTO `answer_list` (`id`, `user_id`, `question_id`, `answer`, `status`, `created_at`, `updated_at`) VALUES
(1, 3, 1, '1', 1, '2021-03-15 18:29:06', '2021-03-15 12:59:06'),
(2, 3, 2, '2', 1, '2021-03-15 18:29:06', '2021-03-15 12:59:06'),
(3, 3, 3, '3', 1, '2021-03-15 18:29:06', '2021-03-15 12:59:06'),
(4, 3, 4, '4', 1, '2021-03-15 18:29:06', '2021-03-15 12:59:06'),
(5, 3, 5, '5', 1, '2021-03-15 18:29:06', '2021-03-15 12:59:06'),
(6, 4, 1, 'Sushant', 1, '2021-03-16 17:39:22', '2021-03-16 12:09:22'),
(7, 4, 2, 'Bella', 1, '2021-03-16 17:39:22', '2021-03-16 12:09:22'),
(8, 4, 3, 'Sultanpur', 1, '2021-03-16 17:39:22', '2021-03-16 12:09:22'),
(9, 4, 4, 'Sultanpur', 1, '2021-03-16 17:39:22', '2021-03-16 12:09:22'),
(10, 4, 5, 'Chennai', 1, '2021-03-16 17:39:22', '2021-03-16 12:09:22'),
(11, 5, 1, 'Fahim', 1, '2021-03-17 17:04:45', '2021-03-17 11:34:45'),
(12, 5, 2, 'Hitu', 1, '2021-03-17 17:04:45', '2021-03-17 11:34:45'),
(13, 5, 3, 'Delhi', 1, '2021-03-17 17:04:45', '2021-03-17 11:34:45'),
(14, 5, 4, 'Delhi', 1, '2021-03-17 17:04:45', '2021-03-17 11:34:45'),
(15, 5, 5, 'Delhi', 1, '2021-03-17 17:04:46', '2021-03-17 11:34:46');

-- --------------------------------------------------------

--
-- Table structure for table `downloads`
--

CREATE TABLE `downloads` (
  `id` int(11) NOT NULL,
  `projectId` int(11) NOT NULL,
  `build_name` varchar(255) DEFAULT NULL,
  `build_type` tinyint(4) NOT NULL COMMENT '1-android,2-ios,3-windows(Desktop)',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `licenses`
--

CREATE TABLE `licenses` (
  `id` int(11) NOT NULL,
  `license_name` varchar(100) NOT NULL,
  `license_description` varchar(1000) DEFAULT NULL,
  `price` varchar(100) DEFAULT NULL,
  `license_type` enum('limited','unlimited') DEFAULT NULL,
  `project_count` int(100) NOT NULL,
  `scene_count` int(100) NOT NULL,
  `status` enum('active','inactive','trashed') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `licenses`
--

INSERT INTO `licenses` (`id`, `license_name`, `license_description`, `price`, `license_type`, `project_count`, `scene_count`, `status`, `created_at`, `updated_at`) VALUES
(1, '1st', 'desc', '20000', 'limited', 5, 7, 'active', '2022-03-09 19:13:11', '2022-03-09 19:13:11');

-- --------------------------------------------------------

--
-- Table structure for table `login_history`
--

CREATE TABLE `login_history` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `login_history`
--

INSERT INTO `login_history` (`id`, `user_id`, `created_at`, `updated_at`) VALUES
(1, 4, '2021-03-24 16:44:43', '2021-03-24 11:14:43'),
(2, 4, '2021-03-24 16:58:07', '2021-03-24 11:28:07'),
(3, 4, '2021-03-24 17:04:53', '2021-03-24 11:34:53'),
(4, 4, '2021-03-24 17:28:52', '2021-03-24 11:58:52'),
(5, 4, '2021-03-24 17:31:25', '2021-03-24 12:01:25'),
(6, 4, '2021-03-25 10:50:22', '2021-03-25 05:20:22'),
(7, 4, '2021-03-25 11:49:50', '2021-03-25 06:19:50'),
(8, 4, '2021-03-25 11:53:48', '2021-03-25 06:23:48'),
(9, 4, '2021-03-25 12:43:30', '2021-03-25 07:13:30'),
(10, 4, '2021-03-25 14:31:26', '2021-03-25 09:01:26'),
(11, 4, '2021-03-25 14:42:53', '2021-03-25 09:12:53'),
(12, 4, '2021-03-25 14:49:02', '2021-03-25 09:19:02'),
(13, 4, '2021-03-25 14:57:47', '2021-03-25 09:27:47'),
(14, 4, '2021-03-25 15:15:08', '2021-03-25 09:45:08'),
(15, 4, '2021-03-25 15:29:10', '2021-03-25 09:59:10'),
(16, 4, '2021-03-25 15:32:38', '2021-03-25 10:02:38'),
(17, 4, '2021-03-25 15:37:04', '2021-03-25 10:07:04'),
(18, 4, '2021-03-25 15:39:20', '2021-03-25 10:09:20'),
(19, 4, '2021-03-25 15:41:10', '2021-03-25 10:11:10'),
(20, 4, '2021-03-25 15:42:31', '2021-03-25 10:12:31'),
(21, 4, '2021-03-25 15:47:50', '2021-03-25 10:17:50'),
(22, 4, '2021-03-25 16:09:31', '2021-03-25 10:39:31'),
(23, 4, '2021-03-25 16:13:11', '2021-03-25 10:43:11'),
(24, 4, '2021-03-25 16:36:44', '2021-03-25 11:06:44'),
(25, 4, '2021-03-25 18:19:48', '2021-03-25 12:49:48'),
(26, 4, '2021-03-26 11:42:36', '2021-03-26 06:12:36'),
(27, 4, '2021-03-26 12:07:41', '2021-03-26 06:37:41'),
(28, 4, '2021-03-26 14:19:07', '2021-03-26 08:49:07'),
(29, 4, '2021-03-26 15:17:33', '2021-03-26 09:47:33'),
(30, 4, '2021-03-27 13:55:48', '2021-03-27 08:25:48'),
(31, 4, '2021-03-30 11:36:11', '2021-03-30 06:06:11'),
(32, 4, '2021-03-30 11:47:11', '2021-03-30 06:17:11'),
(33, 4, '2021-03-30 12:26:00', '2021-03-30 06:56:00'),
(34, 4, '2021-03-30 12:41:14', '2021-03-30 07:11:14'),
(35, 4, '2021-03-30 12:48:56', '2021-03-30 07:18:56'),
(36, 4, '2021-03-30 12:50:10', '2021-03-30 07:20:10'),
(37, 4, '2021-03-30 12:52:35', '2021-03-30 07:22:35'),
(38, 4, '2021-03-30 12:56:42', '2021-03-30 07:26:42'),
(39, 4, '2021-03-30 12:59:58', '2021-03-30 07:29:58'),
(40, 4, '2021-03-30 16:23:39', '2021-03-30 10:53:39'),
(41, 4, '2021-03-30 17:12:32', '2021-03-30 11:42:32'),
(42, 4, '2021-03-30 17:15:00', '2021-03-30 11:45:00'),
(43, 4, '2021-03-30 17:19:55', '2021-03-30 11:49:55'),
(44, 4, '2021-03-30 17:25:45', '2021-03-30 11:55:45'),
(45, 4, '2021-03-30 17:30:11', '2021-03-30 12:00:11'),
(46, 4, '2021-03-30 17:32:45', '2021-03-30 12:02:45'),
(47, 4, '2021-03-30 17:44:47', '2021-03-30 12:14:47'),
(48, 4, '2021-03-30 17:46:46', '2021-03-30 12:16:46'),
(49, 4, '2021-03-30 17:49:25', '2021-03-30 12:19:25'),
(50, 4, '2021-03-30 17:52:58', '2021-03-30 12:22:58'),
(51, 4, '2021-03-30 17:56:08', '2021-03-30 12:26:08'),
(52, 4, '2021-03-30 17:58:30', '2021-03-30 12:28:30'),
(53, 4, '2021-03-30 18:02:28', '2021-03-30 12:32:28'),
(54, 4, '2021-03-30 19:17:26', '2021-03-30 13:47:26'),
(55, 4, '2021-03-30 19:42:45', '2021-03-30 14:12:45'),
(56, 4, '2021-03-30 19:50:39', '2021-03-30 14:20:39'),
(57, 4, '2021-03-30 19:53:08', '2021-03-30 14:23:08'),
(58, 4, '2021-03-30 20:02:12', '2021-03-30 14:32:12'),
(59, 13, '2021-04-16 12:01:15', '2021-04-16 06:31:15'),
(60, 4, '2021-04-16 12:01:30', '2021-04-16 06:31:30'),
(61, 13, '2021-04-16 12:42:44', '2021-04-16 07:12:44'),
(62, 13, '2021-04-16 12:43:26', '2021-04-16 07:13:26'),
(63, 4, '2022-04-02 19:32:18', '2022-04-02 14:02:18'),
(64, 4, '2022-04-02 19:32:36', '2022-04-02 14:02:36'),
(65, 4, '2022-04-02 19:33:00', '2022-04-02 14:03:00'),
(66, 4, '2022-04-02 20:13:57', '2022-04-02 14:43:57');

-- --------------------------------------------------------

--
-- Table structure for table `projecthotspots`
--

CREATE TABLE `projecthotspots` (
  `id` int(11) NOT NULL,
  `viewId` int(11) NOT NULL,
  `hotspot_title` varchar(255) DEFAULT NULL,
  `x` float NOT NULL,
  `y` float NOT NULL,
  `z` float NOT NULL,
  `hotspot_data` text NOT NULL COMMENT 'ViewId, ImageName, VideoName, Text, Music',
  `hotspot_type` tinyint(4) NOT NULL COMMENT '1-Hotspot, 2-Image, 3-Video, 4-Text, 5-Music',
  `hotspot_icon` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `projecthotspots`
--

INSERT INTO `projecthotspots` (`id`, `viewId`, `hotspot_title`, `x`, `y`, `z`, `hotspot_data`, `hotspot_type`, `hotspot_icon`, `created_at`, `updated_at`) VALUES
(14, 17, 'Auditorium', 723.97, -1112.94, 4811.96, '16160607173196133.png', 2, '16160607173196133.png', '2021-03-18 09:48:26', '2021-03-24 10:18:11'),
(15, 17, 'IT Store', -4839.74, -1175.75, -376.09, '16160625648706119.png', 2, '16160625648706119.png', '2021-03-18 10:17:01', '2021-03-24 10:18:11'),
(20, 17, 'Fire Extinguisher', 802.57, -1153.79, -4791.3, '16160607356861595.png', 2, '16160607356861595.png', '2021-03-18 10:25:54', '2021-03-24 10:18:11'),
(21, 17, 'Basement Lobby', 3878.61, -2692.43, -1626.89, '16160622356877588.png', 2, '16160622356877588.png', '2021-03-18 10:27:23', '2021-03-24 10:18:11'),
(24, 17, 'Click to go', 4759.53, -1333.49, 686.75, '18', 1, '16160622356880408.png', '2021-03-18 10:31:25', '2021-03-24 10:18:11'),
(25, 18, 'Washroom', 61.84, -1447.14, -4779.66, '16160625648701908.png', 2, '16160625648701908.png', '2021-03-18 10:33:04', '2021-03-24 10:18:11'),
(26, 18, 'Auditorium', 1666.06, -1624.3, 4415.82, '16160622356862244.png', 2, '16160622356862244.png', '2021-03-18 10:34:10', '2021-03-24 10:18:11'),
(28, 18, 'Move Ahead', 4795.19, -1401.04, -13.78, '19', 1, '16160622356880408.png', '2021-03-18 10:41:43', '2021-03-24 10:18:11'),
(29, 19, 'IT Department', 4635.2, -208.83, -1835.05, '16160622356942635.png', 2, '16160622356942635.png', '2021-03-18 10:47:00', '2021-03-24 10:18:11'),
(30, 19, 'GIS Lab', 900.36, -1511.22, 4675.01, '16160622356890090.png', 2, '16160622356890090.png', '2021-03-18 10:48:06', '2021-03-24 10:18:11'),
(31, 19, 'Enter to the GIS Lab', 1063.24, 824.72, 4812, '20', 1, '16160622356880408.png', '2021-03-18 10:48:52', '2021-03-24 10:18:11'),
(33, 20, 'Exit Door', 4249.18, 560.85, 2559.81, '16160622356889241.png', 2, '16160622356889241.png', '2021-03-18 10:50:40', '2021-03-24 10:18:11'),
(41, 34, 'Test', 633.27, -414.34, 4936.87, '35', 1, 'hotspot.png', '2021-04-16 06:35:48', '2021-04-16 06:35:48'),
(42, 34, 'HR Desk', 1387.9, 304.94, 4785.01, 'Testing purpose hotspot', 4, NULL, '2021-04-16 06:35:58', '2021-04-16 06:35:58');

-- --------------------------------------------------------

--
-- Table structure for table `projectinventory`
--

CREATE TABLE `projectinventory` (
  `id` int(11) NOT NULL,
  `projectId` int(11) NOT NULL,
  `original_filename` varchar(255) DEFAULT NULL,
  `filename` varchar(255) NOT NULL,
  `thumbnail` varchar(100) DEFAULT NULL,
  `filetype` tinyint(4) NOT NULL COMMENT '1-image,2-video,3-audio',
  `default_inventory` tinyint(4) NOT NULL DEFAULT 0 COMMENT '1-default, 0-not default',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Dumping data for table `projectinventory`
--

INSERT INTO `projectinventory` (`id`, `projectId`, `original_filename`, `filename`, `thumbnail`, `filetype`, `default_inventory`, `created_at`, `updated_at`) VALUES
(1, 0, 'hotspot.png', 'hotspot.png', NULL, 1, 1, '2020-04-30 06:05:31', '2021-03-24 10:18:11'),
(2, 0, 'image.png', 'image.png', NULL, 1, 1, '2020-04-30 06:05:31', '2021-03-24 10:18:11'),
(3, 0, 'video.png', 'video.png', NULL, 1, 1, '2020-04-30 06:05:31', '2021-03-24 10:18:11'),
(4, 0, 'text.png', 'text.png', NULL, 1, 1, '2020-04-30 06:05:31', '2021-03-24 10:18:11'),
(154, 9, 'Portal4.mp4', '16160604648577661.mp4', NULL, 2, 0, '2021-03-18 09:41:05', '2021-03-24 10:18:11'),
(151, 9, 'Portal-1.mp4', '16160603440518342.mp4', NULL, 2, 0, '2021-03-18 09:39:04', '2021-03-24 10:18:11'),
(221, 21, '02-Process Area Statin Plant.m4v', '16185548329638043.m4v', '16185548329638043_thumbnail.png', 2, 0, '2021-04-16 06:33:55', '2021-04-16 06:33:55'),
(222, 21, '01-Change Room Statin Plant.m4v', '16185548980352085.m4v', '16185548980352085_thumbnail.png', 2, 0, '2021-04-16 06:35:02', '2021-04-16 06:35:02'),
(153, 9, 'Portal3.mp4', '16160604359925003.mp4', NULL, 2, 0, '2021-03-18 09:40:36', '2021-03-24 10:18:11'),
(152, 9, 'Portal-2.mp4', '16160603856798601.mp4', NULL, 2, 0, '2021-03-18 09:39:45', '2021-03-24 10:18:11'),
(155, 9, '16159822047178670.png', '16160607173196133.png', NULL, 1, 0, '2021-03-18 09:45:17', '2021-03-24 10:18:11'),
(156, 9, '16159822047127547.png', '16160607356861595.png', NULL, 1, 0, '2021-03-18 09:45:35', '2021-03-24 10:18:11'),
(157, 9, 'Auditorium.png', '16160622356862244.png', NULL, 1, 0, '2021-03-18 10:10:35', '2021-03-24 10:18:11'),
(158, 9, 'Basement Lobby.png', '16160622356877588.png', NULL, 1, 0, '2021-03-18 10:10:35', '2021-03-24 10:18:11'),
(159, 9, 'Click to go.png', '16160622356880408.png', NULL, 1, 0, '2021-03-18 10:10:35', '2021-03-24 10:18:11'),
(160, 9, 'Exit Door.png', '16160622356889241.png', NULL, 1, 0, '2021-03-18 10:10:35', '2021-03-24 10:18:11'),
(161, 9, 'GIS Lab.png', '16160622356890090.png', NULL, 1, 0, '2021-03-18 10:10:35', '2021-03-24 10:18:11'),
(162, 9, 'IT Department.png', '16160622356942635.png', NULL, 1, 0, '2021-03-18 10:10:35', '2021-03-24 10:18:11'),
(163, 9, 'Washroom.png', '16160622356965223.png', NULL, 1, 0, '2021-03-18 10:10:35', '2021-03-24 10:18:11'),
(164, 9, 'IT Store.png', '16160624719855406.png', NULL, 1, 0, '2021-03-18 10:14:31', '2021-03-24 10:18:11'),
(165, 9, '16160607173196133.png', '16160625648672340.png', NULL, 1, 0, '2021-03-18 10:16:04', '2021-03-24 10:18:11'),
(166, 9, '16160607356861595.png', '16160625648680797.png', NULL, 1, 0, '2021-03-18 10:16:04', '2021-03-24 10:18:11'),
(167, 9, '16160622356862244.png', '16160625648689963.png', NULL, 1, 0, '2021-03-18 10:16:04', '2021-03-24 10:18:11'),
(168, 9, '16160622356877588.png', '16160625648693647.png', NULL, 1, 0, '2021-03-18 10:16:05', '2021-03-24 10:18:11'),
(169, 9, '16160622356880408.png', '16160625648691087.png', NULL, 1, 0, '2021-03-18 10:16:05', '2021-03-24 10:18:11'),
(170, 9, '16160622356889241.png', '16160625648696166.png', NULL, 1, 0, '2021-03-18 10:16:05', '2021-03-24 10:18:11'),
(171, 9, '16160622356890090.png', '16160625648690327.png', NULL, 1, 0, '2021-03-18 10:16:05', '2021-03-24 10:18:11'),
(172, 9, '16160622356942635.png', '16160625648701153.png', NULL, 1, 0, '2021-03-18 10:16:05', '2021-03-24 10:18:11'),
(173, 9, '16160622356965223.png', '16160625648701908.png', NULL, 1, 0, '2021-03-18 10:16:05', '2021-03-24 10:18:11'),
(174, 9, '16160624719855406.png', '16160625648706119.png', NULL, 1, 0, '2021-03-18 10:16:05', '2021-03-24 10:18:11'),
(176, 9, 'img3.jpg', '16163971434561845.jpg', NULL, 1, 0, '2021-03-22 07:12:23', '2021-03-24 10:18:11');

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `projectName` varchar(255) NOT NULL,
  `version` varchar(255) NOT NULL,
  `android` tinyint(4) NOT NULL DEFAULT 0,
  `IOS` tinyint(4) NOT NULL DEFAULT 0,
  `windows_desktop` tinyint(4) NOT NULL DEFAULT 0,
  `web` tinyint(4) NOT NULL DEFAULT 0,
  `pano` tinyint(4) NOT NULL DEFAULT 0 COMMENT '0-not created,1-created',
  `application_name` varchar(15) NOT NULL,
  `status` tinyint(4) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`id`, `userId`, `projectName`, `version`, `android`, `IOS`, `windows_desktop`, `web`, `pano`, `application_name`, `status`, `created_at`, `updated_at`) VALUES
(21, 4, 'Shivangi Test', '1.0', 0, 0, 0, 1, 1, 'Shivangi Test', 1, '2021-04-16 06:33:31', '2021-04-16 06:36:01'),
(9, 4, 'KP4-Basement', '1', 0, 0, 0, 1, 1, 'KP4-Basement', 1, '2021-03-18 09:38:38', '2021-03-24 11:59:07');

-- --------------------------------------------------------

--
-- Table structure for table `projectviews`
--

CREATE TABLE `projectviews` (
  `id` int(11) NOT NULL,
  `projectid` int(11) NOT NULL,
  `viewname` varchar(255) DEFAULT NULL,
  `data` varchar(255) DEFAULT NULL,
  `ismuted` tinyint(1) DEFAULT 0 COMMENT '0-unmute,1-mute',
  `custom_audio` varchar(255) NOT NULL,
  `view_filetype` tinyint(4) NOT NULL COMMENT '1-image,2-video',
  `x_pos` float DEFAULT NULL,
  `y_pos` float DEFAULT NULL,
  `z_pos` float DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `projectviews`
--

INSERT INTO `projectviews` (`id`, `projectid`, `viewname`, `data`, `ismuted`, `custom_audio`, `view_filetype`, `x_pos`, `y_pos`, `z_pos`, `created_at`, `updated_at`) VALUES
(18, 9, 'V2', '16160603856798601.mp4', 0, '', 2, NULL, NULL, NULL, '2021-03-18 09:40:15', '2021-03-24 10:18:11'),
(17, 9, 'V1', '16160603440518342.mp4', 0, '', 2, NULL, NULL, NULL, '2021-03-18 09:39:30', '2021-03-24 10:18:11'),
(19, 9, 'V3', '16160604359925003.mp4', 0, '', 2, NULL, NULL, NULL, '2021-03-18 09:40:48', '2021-03-24 10:18:11'),
(20, 9, 'V4', '16160604648577661.mp4', 0, '', 2, NULL, NULL, NULL, '2021-03-18 09:41:14', '2021-03-24 10:18:11'),
(34, 21, 'View 1', '16185548329638043.m4v', 0, '', 2, NULL, NULL, NULL, '2021-04-16 06:34:20', '2021-04-16 06:34:20'),
(35, 21, 'View 2', '16185548980352085.m4v', 0, '', 2, NULL, NULL, NULL, '2021-04-16 06:35:27', '2021-04-16 06:35:27');

-- --------------------------------------------------------

--
-- Table structure for table `questions_list`
--

CREATE TABLE `questions_list` (
  `id` int(11) NOT NULL,
  `question` varchar(1000) NOT NULL,
  `status` int(11) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `questions_list`
--

INSERT INTO `questions_list` (`id`, `question`, `status`, `created_at`, `updated_at`) VALUES
(1, 'What is your name?', 1, '2021-03-11 18:26:19', '2021-03-11 12:56:19'),
(2, 'What is your pet name?', 1, '2021-03-11 18:26:39', '2021-03-11 12:56:39'),
(3, 'From where you did your high school?', 1, '2021-03-11 18:26:58', '2021-03-11 12:56:58'),
(4, 'From where you did your intermediate?', 1, '2021-03-11 18:27:09', '2021-03-11 12:57:09'),
(5, 'In which year you completed your graduation?', 1, '2021-03-11 18:27:29', '2021-03-11 12:57:29');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone_number` bigint(20) NOT NULL,
  `company_profile` varchar(255) DEFAULT NULL,
  `professional_title` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `user_type` tinyint(4) NOT NULL COMMENT '1-admin, 2-user',
  `license_id` int(11) DEFAULT NULL,
  `otp` varchar(100) DEFAULT NULL,
  `wrong_attemp` int(11) NOT NULL,
  `status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '1-active,0-inactive',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `phone_number`, `company_profile`, `professional_title`, `image`, `user_type`, `license_id`, `otp`, `wrong_attemp`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Admin', 'rohitsharma@simulanis.com', '$2a$10$lbNWSqciDMScYH0wW2.EeO4UTH2FktnFldbsR5Mci1dJA.syoF042', 8287371866, NULL, NULL, '1616582577729.jpg', 1, NULL, NULL, 0, 1, '2021-03-24 10:22:31', '2022-03-09 19:08:01'),
(4, 'Shivangi Tripathi', 'shivangitripathi@simulanis.com', '$2a$10$9CkQvyc8y0meYPPnvF3vveSBHyYh5M3yirc.feDAjprx1Qlvfs/te', 7785926269, 'Simulanis', 'Web Developer', '1616582655132.jpg', 2, NULL, NULL, 0, 1, '2022-04-02 14:02:16', '2022-04-02 14:02:16'),
(13, 'Shivi', 'test@simulanis.com', '$2a$10$8cS.3WWfKc4NVNSJa5V6c.2.ObwNmnU1bvoJmZSxql9LNHD8L80y6', 1234567890, 'test', 'test', '1618557193588.jpg', 2, NULL, NULL, 0, 1, '2021-03-26 11:06:40', '2021-04-16 07:13:13'),
(14, 'rohit', 'test1@simulanis.com', '$2a$10$oB06F9Gfre7N4KnL79zLcOHHvtagyndmt5tqHbKO0wV7bXHZkwvMu', 1234567890, 'test1', 'test1', '1616758131380.png', 2, NULL, NULL, 0, 1, '2021-03-26 11:28:51', '2022-03-09 19:08:25');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `answer_list`
--
ALTER TABLE `answer_list`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `downloads`
--
ALTER TABLE `downloads`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `licenses`
--
ALTER TABLE `licenses`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `login_history`
--
ALTER TABLE `login_history`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `projecthotspots`
--
ALTER TABLE `projecthotspots`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `projectinventory`
--
ALTER TABLE `projectinventory`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `projectviews`
--
ALTER TABLE `projectviews`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `questions_list`
--
ALTER TABLE `questions_list`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `answer_list`
--
ALTER TABLE `answer_list`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `downloads`
--
ALTER TABLE `downloads`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `licenses`
--
ALTER TABLE `licenses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `login_history`
--
ALTER TABLE `login_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=67;

--
-- AUTO_INCREMENT for table `projecthotspots`
--
ALTER TABLE `projecthotspots`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `projectinventory`
--
ALTER TABLE `projectinventory`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=223;

--
-- AUTO_INCREMENT for table `projects`
--
ALTER TABLE `projects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `projectviews`
--
ALTER TABLE `projectviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `questions_list`
--
ALTER TABLE `questions_list`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
