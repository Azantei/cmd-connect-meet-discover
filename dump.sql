-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: cmd_db
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `name_2` (`name`),
  UNIQUE KEY `name_3` (`name`),
  UNIQUE KEY `name_4` (`name`),
  UNIQUE KEY `name_5` (`name`),
  UNIQUE KEY `name_6` (`name`),
  UNIQUE KEY `name_7` (`name`),
  UNIQUE KEY `name_8` (`name`),
  UNIQUE KEY `name_9` (`name`),
  UNIQUE KEY `name_10` (`name`),
  UNIQUE KEY `name_11` (`name`),
  UNIQUE KEY `name_12` (`name`),
  UNIQUE KEY `name_13` (`name`),
  UNIQUE KEY `name_14` (`name`),
  UNIQUE KEY `name_15` (`name`),
  UNIQUE KEY `name_16` (`name`),
  UNIQUE KEY `name_17` (`name`),
  UNIQUE KEY `name_18` (`name`),
  UNIQUE KEY `name_19` (`name`),
  UNIQUE KEY `name_20` (`name`),
  UNIQUE KEY `name_21` (`name`),
  UNIQUE KEY `name_22` (`name`),
  UNIQUE KEY `name_23` (`name`),
  UNIQUE KEY `name_24` (`name`),
  UNIQUE KEY `name_25` (`name`),
  UNIQUE KEY `name_26` (`name`),
  UNIQUE KEY `name_27` (`name`),
  UNIQUE KEY `name_28` (`name`),
  UNIQUE KEY `name_29` (`name`),
  UNIQUE KEY `name_30` (`name`),
  UNIQUE KEY `name_31` (`name`),
  UNIQUE KEY `name_32` (`name`),
  UNIQUE KEY `name_33` (`name`),
  UNIQUE KEY `name_34` (`name`),
  UNIQUE KEY `name_35` (`name`),
  UNIQUE KEY `name_36` (`name`),
  UNIQUE KEY `name_37` (`name`),
  UNIQUE KEY `name_38` (`name`),
  UNIQUE KEY `name_39` (`name`),
  UNIQUE KEY `name_40` (`name`),
  UNIQUE KEY `name_41` (`name`),
  UNIQUE KEY `name_42` (`name`),
  UNIQUE KEY `name_43` (`name`),
  UNIQUE KEY `name_44` (`name`),
  UNIQUE KEY `name_45` (`name`),
  UNIQUE KEY `name_46` (`name`),
  UNIQUE KEY `name_47` (`name`),
  UNIQUE KEY `name_48` (`name`),
  UNIQUE KEY `name_49` (`name`),
  UNIQUE KEY `name_50` (`name`),
  UNIQUE KEY `name_51` (`name`),
  UNIQUE KEY `name_52` (`name`),
  UNIQUE KEY `name_53` (`name`),
  UNIQUE KEY `name_54` (`name`),
  UNIQUE KEY `name_55` (`name`),
  UNIQUE KEY `name_56` (`name`),
  UNIQUE KEY `name_57` (`name`),
  UNIQUE KEY `name_58` (`name`),
  UNIQUE KEY `name_59` (`name`),
  UNIQUE KEY `name_60` (`name`),
  UNIQUE KEY `name_61` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (7,'Arts'),(3,'Coffee'),(9,'Fitness'),(6,'Food'),(10,'Games'),(15,'Movies'),(4,'Music'),(1,'Outdoors'),(11,'Photography'),(2,'Running'),(5,'Sports'),(8,'Tech'),(13,'Travel');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `organizerId` int NOT NULL,
  `title` varchar(150) NOT NULL,
  `description` text,
  `location` varchar(255) DEFAULT NULL,
  `eventDate` datetime NOT NULL,
  `imageUrl` varchar(255) DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `organizerId` (`organizerId`),
  CONSTRAINT `events_ibfk_1` FOREIGN KEY (`organizerId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `events`
--

LOCK TABLES `events` WRITE;
/*!40000 ALTER TABLE `events` DISABLE KEYS */;
/*!40000 ALTER TABLE `events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `interests`
--

DROP TABLE IF EXISTS `interests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `interests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `postId` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `interests_user_id_post_id` (`userId`,`postId`),
  KEY `postId` (`postId`),
  CONSTRAINT `interests_ibfk_37` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `interests_ibfk_38` FOREIGN KEY (`postId`) REFERENCES `posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `interests`
--

LOCK TABLES `interests` WRITE;
/*!40000 ALTER TABLE `interests` DISABLE KEYS */;
INSERT INTO `interests` VALUES (1,5,23,'2026-04-21 03:22:42','2026-04-21 03:22:42'),(2,3,23,'2026-04-21 03:23:38','2026-04-21 03:23:38'),(4,14,20,'2026-04-21 22:47:17','2026-04-21 22:47:17'),(5,5,29,'2026-04-23 01:07:05','2026-04-23 01:07:05'),(6,7,36,'2026-04-23 01:07:22','2026-04-23 01:07:22');
/*!40000 ALTER TABLE `interests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `moderation_logs`
--

DROP TABLE IF EXISTS `moderation_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `moderation_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `moderatorId` int NOT NULL,
  `action` varchar(100) NOT NULL,
  `targetType` enum('post','user') NOT NULL,
  `targetId` int NOT NULL,
  `notes` text,
  `createdAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `moderatorId` (`moderatorId`),
  CONSTRAINT `moderation_logs_ibfk_1` FOREIGN KEY (`moderatorId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `moderation_logs`
--

LOCK TABLES `moderation_logs` WRITE;
/*!40000 ALTER TABLE `moderation_logs` DISABLE KEYS */;
INSERT INTO `moderation_logs` VALUES (1,2,'escalate','user',3,'Requires Admin Decision: Denny says he sucks','2026-04-20 04:05:25'),(2,2,'escalate','user',5,'Requires Admin Decision: Dylan wants revenge.','2026-04-20 05:39:31'),(3,2,'escalate','post',8,'Harassment or Threats','2026-04-20 18:59:34'),(4,2,'escalate','user',7,'Harassment or Threats','2026-04-20 18:59:59'),(5,2,'escalate','post',7,'Serious Policy Violation','2026-04-20 19:00:21'),(6,2,'escalate','user',7,'Harassment or Threats','2026-04-20 19:22:33'),(7,2,'escalate','post',9,'Potential Legal Issue','2026-04-20 19:22:41'),(8,2,'escalate','user',6,'Potential Legal Issue','2026-04-20 19:24:50'),(9,2,'escalate','post',10,'Harassment or Threats','2026-04-20 19:25:13'),(10,2,'escalate','post',5,'Harassment or Threats','2026-04-20 19:28:55'),(11,2,'escalate','user',6,'Potential Legal Issue','2026-04-20 19:30:48'),(12,2,'escalate','user',6,'Harassment or Threats','2026-04-20 19:30:51'),(13,2,'dismiss','post',19,NULL,'2026-04-20 22:41:55'),(14,2,'warn','user',7,'Inappropriate Content: Stop swearing so much!','2026-04-21 00:35:05'),(15,2,'warn','user',12,'Community Guidelines Violation: First of all, how dare you.','2026-04-21 04:16:47'),(16,2,'escalate','post',15,'Serious Policy Violation: Test sent from moderator.','2026-04-21 04:18:31'),(17,2,'dismiss','post',20,NULL,'2026-04-21 04:20:42'),(18,2,'escalate','post',12,'Harassment or Threats','2026-04-21 04:21:26'),(19,2,'escalate','user',5,'Serious Policy Violation','2026-04-21 04:40:36'),(20,2,'warn','post',12,'Harassment','2026-04-21 21:53:41'),(21,2,'escalate','user',7,'Harassment or Threats','2026-04-21 22:47:53'),(22,2,'dismiss','post',15,NULL,'2026-04-21 22:50:57'),(23,2,'escalate','user',3,'Serious Policy Violation','2026-04-21 22:51:47'),(24,2,'escalate','user',12,'Serious Policy Violation','2026-04-21 22:58:04'),(25,2,'escalate','user',14,'Serious Policy Violation','2026-04-21 23:03:38'),(26,2,'escalate','post',28,'Harassment or Threats','2026-04-21 23:06:23'),(27,2,'warn','user',6,'Inappropriate Content: You are being warned that you have violated our community guidelines with inappropriate content.','2026-04-22 00:26:37'),(28,2,'escalate','user',11,'Potential Legal Issue: if Ross continues in this manner, we may get sued.','2026-04-22 00:28:25'),(29,2,'dismiss','post',32,NULL,'2026-04-22 00:28:39'),(30,2,'escalate','post',33,'Requires Admin Decision','2026-04-22 00:38:09'),(31,2,'escalate','user',6,'Harassment or Threats','2026-04-22 21:36:19'),(32,5,'escalate','post',35,'Harassment or Threats','2026-04-23 01:08:20'),(33,5,'escalate','post',32,'Requires Admin Decision','2026-04-23 01:08:33');
/*!40000 ALTER TABLE `moderation_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `platform_settings`
--

DROP TABLE IF EXISTS `platform_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `platform_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `key` varchar(100) NOT NULL,
  `value` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key` (`key`),
  UNIQUE KEY `key_2` (`key`),
  UNIQUE KEY `key_3` (`key`),
  UNIQUE KEY `key_4` (`key`),
  UNIQUE KEY `key_5` (`key`),
  UNIQUE KEY `key_6` (`key`),
  UNIQUE KEY `key_7` (`key`),
  UNIQUE KEY `key_8` (`key`),
  UNIQUE KEY `key_9` (`key`),
  UNIQUE KEY `key_10` (`key`),
  UNIQUE KEY `key_11` (`key`),
  UNIQUE KEY `key_12` (`key`),
  UNIQUE KEY `key_13` (`key`),
  UNIQUE KEY `key_14` (`key`),
  UNIQUE KEY `key_15` (`key`),
  UNIQUE KEY `key_16` (`key`),
  UNIQUE KEY `key_17` (`key`),
  UNIQUE KEY `key_18` (`key`),
  UNIQUE KEY `key_19` (`key`),
  UNIQUE KEY `key_20` (`key`),
  UNIQUE KEY `key_21` (`key`),
  UNIQUE KEY `key_22` (`key`),
  UNIQUE KEY `key_23` (`key`),
  UNIQUE KEY `key_24` (`key`),
  UNIQUE KEY `key_25` (`key`),
  UNIQUE KEY `key_26` (`key`),
  UNIQUE KEY `key_27` (`key`),
  UNIQUE KEY `key_28` (`key`),
  UNIQUE KEY `key_29` (`key`),
  UNIQUE KEY `key_30` (`key`),
  UNIQUE KEY `key_31` (`key`),
  UNIQUE KEY `key_32` (`key`),
  UNIQUE KEY `key_33` (`key`),
  UNIQUE KEY `key_34` (`key`),
  UNIQUE KEY `key_35` (`key`),
  UNIQUE KEY `key_36` (`key`),
  UNIQUE KEY `key_37` (`key`),
  UNIQUE KEY `key_38` (`key`),
  UNIQUE KEY `key_39` (`key`),
  UNIQUE KEY `key_40` (`key`),
  UNIQUE KEY `key_41` (`key`),
  UNIQUE KEY `key_42` (`key`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `platform_settings`
--

LOCK TABLES `platform_settings` WRITE;
/*!40000 ALTER TABLE `platform_settings` DISABLE KEYS */;
INSERT INTO `platform_settings` VALUES (1,'platformName','C.M.D. — Connect. Meet. Discover.'),(2,'distanceRadius','10 mi'),(3,'guestBrowsing','false'),(4,'registrationOpen','true'),(5,'maintenanceMode','false');
/*!40000 ALTER TABLE `platform_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `posts`
--

DROP TABLE IF EXISTS `posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `posts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `title` varchar(150) NOT NULL,
  `category` json DEFAULT NULL,
  `imageUrl` varchar(255) DEFAULT NULL,
  `isHidden` tinyint(1) DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `description` text,
  `type` enum('activity','event') NOT NULL DEFAULT 'activity',
  `location` varchar(255) DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `status` enum('published','draft','pending') DEFAULT 'published',
  `maxAttendees` int DEFAULT NULL,
  `rsvpEnabled` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `posts`
--

LOCK TABLES `posts` WRITE;
/*!40000 ALTER TABLE `posts` DISABLE KEYS */;
INSERT INTO `posts` VALUES (2,2,'Leon Kennedy Party','[]','/uploads/post-2-1776480934436.jpg',0,'2026-04-18 02:55:34','2026-04-18 02:55:34','Bring your Leon Kennedy swag and join me in the park. Let\'s have a day to honor this deity, worship his hotness, and celebrate our taste in fictional men.','activity','Thornton A. Sullivan Park, 11405 Silver Lake Rd, Everett, WA 98208','2026-06-20 00:00:00','published',NULL,0),(3,2,'Kakashi Picnic','[]','/uploads/post-2-1776493896454.webp',0,'2026-04-18 06:24:12','2026-04-18 06:35:18','When we aren\'t honoring Leon Kennedy, we must pay homage to the second god: Kakashi. Bring your ninja skills to the park to celebrate his buff bod, because winner takes Kakashi as their prize.','activity','The Stilly Diner, Arlington, WA 98223','2026-08-01 00:00:00','published',NULL,0),(4,3,'Skateboarding DIY and Tricks','[]','/uploads/post-3-1776577892853.png',1,'2026-04-19 05:51:32','2026-04-21 22:51:47','Why waste resources? Let\'s make our own skateboards out of carboard, wood, expired pepperoni, whatever you got! Then let\'s do some crazy rap battles while busting moves on the court. 2:00 - Be there!','activity','Skate Park on Hanford & Margial, 1099 SW Hanford St, Seattle, WA 98134','2026-04-25 00:00:00','published',NULL,0),(6,5,'END OF THE SEMESTER PARTY!','[\"Food\", \"Music\"]',NULL,1,'2026-04-20 05:37:43','2026-04-21 04:40:36','Let\'s meet at the Irishman at 7 pm Friday of finals week to PARTY! I don\'t care if you aren\'t a student, you\'re in my major, you go to my school, it\'s time to celebrate!','activity','The Irishman, 2923 Colby Ave, Everett, WA 98201','2026-05-09 02:00:00','published',NULL,0),(7,7,'Work Out Session','[\"Fitness\", \"Sports\"]','/uploads/post-7-1776706392403.jpg',1,'2026-04-20 17:33:12','2026-04-21 22:47:53','I\'m an EvCC student and I\'ll be at the gym at 8 am and I\'m looking for some workout buddies to keep me motivated! ?\r\nYou have to be an EvCC member to get into the gym, but let\'s rally and pump iron!','activity','Everett Community College Walt Price Student Fitness Center, 2206 Tower St, Everett, WA 98201','2026-04-21 15:00:00','published',NULL,0),(10,6,'Tester','[]',NULL,0,'2026-04-20 19:24:15','2026-04-22 21:36:43','Yet another test','activity','Everett Community College Walt Price Student Fitness Center, 2206 Tower St, Everett, WA 98201','2026-05-08 17:00:00','published',NULL,0),(12,6,'test','[]',NULL,0,'2026-04-20 19:30:06','2026-04-22 21:36:43','test','activity',NULL,NULL,'published',NULL,0),(14,5,'RSVP Test','[]',NULL,1,'2026-04-20 21:46:35','2026-04-21 04:40:36','Test','activity',NULL,NULL,'published',NULL,0),(15,5,'RSVP test 4 real','[]',NULL,1,'2026-04-20 21:46:51','2026-04-21 04:40:36',NULL,'event',NULL,NULL,'published',NULL,1),(16,4,'Fuck this','[]',NULL,0,'2026-04-20 21:58:17','2026-04-20 21:58:17','fuck fuck','activity',NULL,NULL,'pending',NULL,0),(17,7,'Fuck','[]',NULL,1,'2026-04-20 21:58:58','2026-04-21 22:47:53','fuck fuck','activity',NULL,NULL,'pending',NULL,0),(18,7,'FUCK THIS SHIT','[]',NULL,1,'2026-04-20 22:35:01','2026-04-21 22:47:53','FUCK FUCK','activity',NULL,NULL,'pending',NULL,0),(20,7,'FUCK THIS SHIT','[]',NULL,1,'2026-04-20 22:41:44','2026-04-21 22:47:53','fuck','activity',NULL,NULL,'published',NULL,0),(22,12,'TestingTesting','[]',NULL,1,'2026-04-21 03:07:11','2026-04-21 22:58:04','Testing','activity',NULL,NULL,'published',NULL,0),(23,7,'Work Out Session!','[\"Fitness\", \"Running\", \"Sports\"]','/uploads/post-7-1776741613983.jpg',1,'2026-04-21 03:20:13','2026-04-21 22:47:53','Come to EvCC with me to have a work out buddy. Looking to make friends and motivation to keep pumping iron!  ?\r\nEverett Community College are the only ones who can access the gym, sorry!','activity','Everett Community College Walt Price Student Fitness Center, 2206 Tower St, Everett, WA 98201','2026-04-21 15:00:00','published',NULL,0),(24,3,'RAGE!','[\"Fitness\", \"Outdoors\"]','/uploads/post-3-1776742012459.jpg',1,'2026-04-21 03:26:52','2026-04-21 22:51:47','I have a garage full of junk and I also have pent up anger. You probably have that, too! Bring your junk if you have it (no worries if not, you can use mine!) and your anger. Bring safety gear and let\'s break stuff! Only the first 5 people, I\'ll make a new post if I have room for more!','event','160 W Dayton St, Edmonds, WA 98020','2026-04-21 17:00:00','published',5,1),(29,7,'Work Out Session','[\"Fitness\", \"Sports\", \"Running\"]','/uploads/post-7-1776815418660.jpg',0,'2026-04-21 23:50:18','2026-04-21 23:50:18','Looking for some new peeps to work out with to keep me motivated!\r\nI\'ll be at the Everett Community College gym - you have to be an EvCC member to join sorry!\r\nLet\'s get to know each other while pumping iron!','event','Everett Community College Walt Price Student Fitness Center, 2206 Tower St, Everett, WA 98201',NULL,'published',NULL,1),(30,3,'RAGE!','[\"Fitness\", \"Games\", \"Outdoors\"]','/uploads/post-3-1776815552927.jpg',0,'2026-04-21 23:52:32','2026-04-21 23:52:32','I got a garage full of junk and I\'ve got lots of rage! I bet you got some, too! Bring your own safety gear and join me in beating junk to absolute dust.\r\nYou can bring your own sledgehammer, but i have some lying around.\r\n\r\nOnly the first 5 can come unless you bring your own junk to bash.','event','160 W Dayton St, Edmonds, WA 98020','2026-04-22 00:00:00','published',5,1),(31,15,'End of the Semester Party!','[\"Food\", \"Games\", \"Music\"]','/uploads/post-15-1776816472571.jpg',0,'2026-04-22 00:07:52','2026-04-22 00:07:52','HEY YA\'LL! LETS PARTAAAAAH. After finals week, meet me at Cocos at 7:00 PM. I don\'t care if you\'re a student, a senior, at WSU. Just come and have a drink and have fun!','event','Cocos Mariscos & Bar, 2707 Bickford Ave, Ste F, Snohomish, WA 98290','2026-05-09 02:00:00','published',NULL,1),(32,11,'test for reporting','[]',NULL,1,'2026-04-22 00:15:23','2026-04-23 01:08:33','REPORT ME I DARE YOU!','activity',NULL,NULL,'published',NULL,0),(34,11,'test','[]',NULL,0,'2026-04-22 01:46:12','2026-04-22 03:48:51','test','activity',NULL,NULL,'published',NULL,0),(35,6,'test2','[]',NULL,1,'2026-04-22 01:46:40','2026-04-23 01:08:20','tester','activity',NULL,NULL,'published',NULL,0),(36,6,'Tamagotchi Giveaway','[]','/uploads/post-6-1776893754783.jpg',0,'2026-04-22 21:35:54','2026-04-22 21:36:43','First 6 people to come to WSU Everett get a Tamagotchi. Learn to care for another thing while barely taking care of yourself.','event','915 N Broadway, Everett, WA 98201','2026-04-27 17:00:00','published',6,1);
/*!40000 ALTER TABLE `posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reports`
--

DROP TABLE IF EXISTS `reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reporterId` int NOT NULL,
  `reason` text NOT NULL,
  `status` enum('pending','reviewed','escalated','resolved') DEFAULT 'pending',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `targetType` enum('post','user') NOT NULL,
  `targetId` int NOT NULL,
  `notes` text,
  PRIMARY KEY (`id`),
  KEY `reporterId` (`reporterId`),
  CONSTRAINT `reports_ibfk_1` FOREIGN KEY (`reporterId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reports`
--

LOCK TABLES `reports` WRITE;
/*!40000 ALTER TABLE `reports` DISABLE KEYS */;
INSERT INTO `reports` VALUES (1,5,'He sucks','resolved','2026-04-20 04:00:16','2026-04-20 04:19:53','user',3,'Dismissed by admin.'),(2,3,'He reported me.','resolved','2026-04-20 05:38:28','2026-04-20 05:40:52','user',5,'Content removed by admin.'),(3,5,'Other — He\'s body shaming me','resolved','2026-04-20 18:48:04','2026-04-20 19:13:53','post',7,'Dismissed by admin.'),(4,3,'Violates community guidelines','resolved','2026-04-20 18:50:47','2026-04-20 19:14:29','post',8,'Content removed by admin.'),(5,3,'He didn\'t help me with systems programming.','resolved','2026-04-20 18:51:49','2026-04-20 19:13:30','user',7,'User banned by admin.'),(6,2,'Violates community guidelines','resolved','2026-04-20 19:02:30','2026-04-21 04:22:31','post',5,'Content removed by admin.'),(7,5,'Violates community guidelines','resolved','2026-04-20 19:22:06','2026-04-20 19:23:09','post',9,'Content removed by admin.'),(8,5,'Test','resolved','2026-04-20 19:22:15','2026-04-20 19:22:58','user',7,'User banned by admin.'),(9,3,'Harassment or bullying','resolved','2026-04-20 19:24:32','2026-04-21 22:58:30','post',10,'Dismissed by admin.'),(10,3,'Test','resolved','2026-04-20 19:24:39','2026-04-20 19:25:03','user',6,'User banned by admin.'),(11,7,'Harassment or bullying','resolved','2026-04-20 19:26:23','2026-04-20 19:27:06','post',11,'Auto-dismissed: post deleted by author.'),(12,2,'test','resolved','2026-04-20 19:30:19','2026-04-21 22:58:27','user',6,'Dismissed by admin.'),(13,2,'test','resolved','2026-04-20 19:30:38','2026-04-21 22:58:26','user',6,'Dismissed by admin.'),(14,7,'Auto-flagged by content filter: potential profanity detected.','resolved','2026-04-20 22:36:20','2026-04-20 22:41:55','post',19,NULL),(15,7,'Auto-flagged by content filter: potential profanity detected.','resolved','2026-04-20 22:41:44','2026-04-21 04:20:42','post',20,NULL),(16,11,'Nhan swears too much.','reviewed','2026-04-21 00:17:35','2026-04-21 00:35:05','user',7,NULL),(17,2,'Inappropriate content','resolved','2026-04-21 00:18:45','2026-04-21 22:50:57','post',15,NULL),(18,3,'Harassment or bullying — He didn\'t go to my Evening with Industry and had the audacity to ask for food.','reviewed','2026-04-21 03:55:54','2026-04-21 21:53:41','post',12,NULL),(19,3,'Other','resolved','2026-04-21 03:56:17','2026-04-21 22:58:24','post',12,'Dismissed by admin.'),(20,3,'Because he left us and graduated.','reviewed','2026-04-21 03:57:53','2026-04-21 04:16:47','user',12,NULL),(21,12,'Other','resolved','2026-04-21 03:59:25','2026-04-21 04:19:22','post',15,'Dismissed by admin.'),(22,12,'Just because','resolved','2026-04-21 03:59:36','2026-04-21 04:41:23','user',5,'Dismissed by admin.'),(23,14,'Inappropriate as fuck.','resolved','2026-04-21 22:47:31','2026-04-21 22:58:22','user',7,'Dismissed by admin.'),(24,2,'Just cuz','resolved','2026-04-21 22:51:23','2026-04-21 22:58:20','user',3,'Dismissed by admin.'),(25,7,'WHAT','resolved','2026-04-21 22:57:52','2026-04-21 22:58:18','user',12,'Dismissed by admin.'),(26,11,'Clown cars offend me','resolved','2026-04-21 23:03:23','2026-04-21 23:03:50','user',14,'Dismissed by admin.'),(27,4,'Other — Someone else hates clown cars','resolved','2026-04-21 23:06:14','2026-04-21 23:06:33','post',28,'Content removed by admin.'),(28,15,'Inappropriate content — He dared me.','resolved','2026-04-22 00:16:29','2026-04-22 00:28:39','post',32,NULL),(29,3,'He\'s trolling.','resolved','2026-04-22 00:19:10','2026-04-22 03:48:51','user',11,'Dismissed by admin.'),(30,7,'Violated community guidelines with posts.','reviewed','2026-04-22 00:21:06','2026-04-22 00:26:37','user',6,NULL),(31,3,'Other','resolved','2026-04-22 00:37:59','2026-04-22 00:38:40','post',33,'Content removed by admin.'),(32,12,'Harassment or bullying','escalated','2026-04-22 01:47:07','2026-04-23 01:08:20','post',35,NULL),(33,12,'Spam or misleading content','pending','2026-04-22 01:47:32','2026-04-22 01:47:32','post',34,NULL),(34,2,'harassment','resolved','2026-04-22 02:30:35','2026-04-22 21:36:43','user',6,'Dismissed by admin.'),(35,6,'He dared me.','pending','2026-04-23 01:06:18','2026-04-23 01:06:18','user',11,NULL),(36,3,'Inappropriate content','escalated','2026-04-23 01:06:41','2026-04-23 01:08:33','post',32,NULL);
/*!40000 ALTER TABLE `reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rsvps`
--

DROP TABLE IF EXISTS `rsvps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rsvps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `postId` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rsvps_user_id_post_id` (`userId`,`postId`),
  KEY `postId` (`postId`),
  CONSTRAINT `rsvps_ibfk_121` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `rsvps_ibfk_122` FOREIGN KEY (`postId`) REFERENCES `posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rsvps`
--

LOCK TABLES `rsvps` WRITE;
/*!40000 ALTER TABLE `rsvps` DISABLE KEYS */;
INSERT INTO `rsvps` VALUES (1,3,4,'2026-04-19 05:52:42','2026-04-19 05:52:42'),(9,5,15,'2026-04-20 21:46:56','2026-04-20 21:46:56'),(15,11,24,'2026-04-21 03:41:36','2026-04-21 03:41:36'),(16,6,24,'2026-04-21 03:44:07','2026-04-21 03:44:07'),(17,12,24,'2026-04-21 03:44:17','2026-04-21 03:44:17'),(18,7,24,'2026-04-21 03:44:28','2026-04-21 03:44:28'),(19,4,24,'2026-04-21 03:44:37','2026-04-21 03:44:37'),(20,3,29,'2026-04-21 23:50:32','2026-04-21 23:50:32'),(21,15,29,'2026-04-22 00:10:14','2026-04-22 00:10:14'),(22,5,36,'2026-04-23 01:06:51','2026-04-23 01:06:51'),(23,7,31,'2026-04-23 01:07:28','2026-04-23 01:07:28'),(24,12,36,'2026-04-23 01:07:39','2026-04-23 01:07:39'),(25,19,31,'2026-04-23 01:07:53','2026-04-23 01:07:53'),(26,10,29,'2026-04-23 01:08:02','2026-04-23 01:08:02');
/*!40000 ALTER TABLE `rsvps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_warnings`
--

DROP TABLE IF EXISTS `user_warnings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_warnings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `moderatorId` int NOT NULL,
  `message` text NOT NULL,
  `isRead` tinyint(1) DEFAULT '0',
  `createdAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `user_warnings_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_warnings`
--

LOCK TABLES `user_warnings` WRITE;
/*!40000 ALTER TABLE `user_warnings` DISABLE KEYS */;
INSERT INTO `user_warnings` VALUES (1,7,2,'Inappropriate Content: Stop swearing so much!',1,'2026-04-21 00:35:05'),(2,12,2,'Community Guidelines Violation: First of all, how dare you.',0,'2026-04-21 04:16:47'),(3,6,2,'Harassment',1,'2026-04-21 21:53:41'),(4,6,2,'Inappropriate Content: You are being warned that you have violated our community guidelines with inappropriate content.',1,'2026-04-22 00:26:37');
/*!40000 ALTER TABLE `user_warnings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('community_member','moderator','admin') DEFAULT 'community_member',
  `isBanned` tinyint(1) DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `name` varchar(100) NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `interests` json DEFAULT NULL,
  `profilePic` varchar(255) DEFAULT NULL,
  `showLocation` tinyint(1) DEFAULT '1',
  `showInterests` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `email_2` (`email`),
  UNIQUE KEY `email_3` (`email`),
  UNIQUE KEY `email_4` (`email`),
  UNIQUE KEY `email_5` (`email`),
  UNIQUE KEY `email_6` (`email`),
  UNIQUE KEY `email_7` (`email`),
  UNIQUE KEY `email_8` (`email`),
  UNIQUE KEY `email_9` (`email`),
  UNIQUE KEY `email_10` (`email`),
  UNIQUE KEY `email_11` (`email`),
  UNIQUE KEY `email_12` (`email`),
  UNIQUE KEY `email_13` (`email`),
  UNIQUE KEY `email_14` (`email`),
  UNIQUE KEY `email_15` (`email`),
  UNIQUE KEY `email_16` (`email`),
  UNIQUE KEY `email_17` (`email`),
  UNIQUE KEY `email_18` (`email`),
  UNIQUE KEY `email_19` (`email`),
  UNIQUE KEY `email_20` (`email`),
  UNIQUE KEY `email_21` (`email`),
  UNIQUE KEY `email_22` (`email`),
  UNIQUE KEY `email_23` (`email`),
  UNIQUE KEY `email_24` (`email`),
  UNIQUE KEY `email_25` (`email`),
  UNIQUE KEY `email_26` (`email`),
  UNIQUE KEY `email_27` (`email`),
  UNIQUE KEY `email_28` (`email`),
  UNIQUE KEY `email_29` (`email`),
  UNIQUE KEY `email_30` (`email`),
  UNIQUE KEY `email_31` (`email`),
  UNIQUE KEY `email_32` (`email`),
  UNIQUE KEY `email_33` (`email`),
  UNIQUE KEY `email_34` (`email`),
  UNIQUE KEY `email_35` (`email`),
  UNIQUE KEY `email_36` (`email`),
  UNIQUE KEY `email_37` (`email`),
  UNIQUE KEY `email_38` (`email`),
  UNIQUE KEY `email_39` (`email`),
  UNIQUE KEY `email_40` (`email`),
  UNIQUE KEY `email_41` (`email`),
  UNIQUE KEY `email_42` (`email`),
  UNIQUE KEY `email_43` (`email`),
  UNIQUE KEY `email_44` (`email`),
  UNIQUE KEY `email_45` (`email`),
  UNIQUE KEY `email_46` (`email`),
  UNIQUE KEY `email_47` (`email`),
  UNIQUE KEY `email_48` (`email`),
  UNIQUE KEY `email_49` (`email`),
  UNIQUE KEY `email_50` (`email`),
  UNIQUE KEY `email_51` (`email`),
  UNIQUE KEY `email_52` (`email`),
  UNIQUE KEY `email_53` (`email`),
  UNIQUE KEY `email_54` (`email`),
  UNIQUE KEY `email_55` (`email`),
  UNIQUE KEY `email_56` (`email`),
  UNIQUE KEY `email_57` (`email`),
  UNIQUE KEY `email_58` (`email`),
  UNIQUE KEY `email_59` (`email`),
  UNIQUE KEY `email_60` (`email`),
  UNIQUE KEY `email_61` (`email`),
  UNIQUE KEY `email_62` (`email`),
  UNIQUE KEY `email_63` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (2,'MalvikaGandhe@outlook.com','$2b$12$iNv6ge3hFjXDtfrwES.ksOSGqgosZZnNtD9vEX1DiwtHb8nPQDXny','moderator',0,'2026-04-18 02:07:23','2026-04-20 03:46:28','Malvika Gandhe','Everett, WA','[\"Music\", \"Tech\", \"Games\"]','/uploads/user-2-1776480665388.jpg',1,1),(3,'DylanGyori@outlook.com','$2b$12$IML3C3KRAMSd50z3n2Mhx.YcCDmWVgQx2NcoM/myRCg7NxaVybWVq','community_member',0,'2026-04-19 05:43:14','2026-04-21 22:54:06','Dylan Gyori',NULL,'[\"Outdoors\", \"Running\", \"Music\", \"Food\", \"Tech\", \"Games\", \"Travel\"]',NULL,1,1),(4,'CamilleOrego@outlook.com','$2b$12$jDf0VuBvgAPas9EpaMTEgOa.gnLc7/6mmssWqRSTB/.tgS0ASsPSa','admin',0,'2026-04-19 06:06:36','2026-04-19 06:06:36','Camille Orego',NULL,'[]',NULL,1,1),(5,'DennyHuang@outlook.com','$2b$12$sj09hJntRmWAm/0Qb2viH./ztRl/JH/BxVbSru38r9eH.dZqoITcW','moderator',0,'2026-04-20 03:59:46','2026-04-20 22:28:51','Denny Huang','Lake Stevens, WA','[\"Music\", \"Tech\", \"Games\"]',NULL,1,1),(6,'HarryHy@outlook.com','$2b$12$x8bUTaHY2coxkRroHzPunO.EtK1BGsFrqdU2N1kzfv9GaB7x6/ri.','community_member',0,'2026-04-20 04:21:06','2026-04-21 22:54:14','Harry Ky','Everett, WA','[\"Music\", \"Tech\"]',NULL,1,1),(7,'NhanNguyen@outlook.com','$2b$12$kFVw6eendP.FD2B2LTDG5.yt7XGDoVYNBx3exnKxYxyN0HVWcxtvS','community_member',0,'2026-04-20 16:30:56','2026-04-21 22:56:22','Nhan Nguyen','Everett, WA','[\"Arts\", \"Fitness\", \"Food\", \"Games\", \"Music\", \"Outdoors\", \"Photography\", \"Tech\"]',NULL,1,1),(10,'YuliyaFedorchenko@outlook.com','$2b$12$Ufz/U93vgFmmXKtQfFtVcOjgCK9hQ83mE28plhKuddTQSk7Nm63ES','community_member',0,'2026-04-20 22:44:53','2026-04-21 22:54:03','Yuliya Fedorchenko','Everett, WA','[\"Fitness\", \"Food\", \"Music\", \"Outdoors\", \"Running\", \"Sports\", \"Travel\"]',NULL,1,1),(11,'RossKugler@outlook.com','$2b$12$vAaLFSUsEoYLt.FCqF.lueqSCzx7njh4qr17eUyLVXhb9Q8W1Tdt6','community_member',0,'2026-04-21 00:11:59','2026-04-21 22:54:01','Ross Kugler','Marysville, WA','[\"Food\", \"Music\", \"Tech\"]',NULL,1,1),(12,'MattMcGinn@outlook.com','$2b$12$i0pfUnfjW0pL.rXi5/pPwu9CMkKh7cGK5BG46OY.HNC.cmdi1Itka','community_member',0,'2026-04-21 03:00:34','2026-04-21 22:56:25','Matt McGinn','Everett, WA','[\"Food\", \"Music\", \"Outdoors\", \"Sports\", \"Travel\"]',NULL,1,1),(14,'YakupAtahanov@outlook.com','$2b$12$dWcWA98IrZiZaIjPNJR1Zu6ALTRIuOBHD6sVAhRZbWsEnmt72EYyu','community_member',0,'2026-04-21 22:44:15','2026-04-21 22:53:57','Yakup Atahanov','Everett, WA','[\"Coffee\", \"Food\", \"Games\", \"Music\", \"Tech\", \"Travel\"]',NULL,1,1),(15,'MannyMargarito@outlook.com','$2b$12$2SBmCiCS2e9dtj4RrjKeoeLDC1PoKx66SFeTRc5zG8uMFgFPvX8/6','community_member',0,'2026-04-21 23:19:29','2026-04-22 00:36:48','Manny Margarito','Everett, WA','[\"Fitness\", \"Games\", \"Movies\", \"Music\", \"Sports\", \"Tech\"]',NULL,1,1),(19,'KristineWashburn@outlook.com','$2b$12$Q6Jq2pjXujD2gwTcKSesC.zwWJ4/kPg.G2JYRFt3CEW/gE2UbFu4.','community_member',0,'2026-04-22 02:55:19','2026-04-22 02:55:33','Kristine Washburn','Everett, WA','[\"Arts\", \"Coffee\", \"Food\", \"Games\", \"Movies\", \"Music\", \"Outdoors\", \"Tech\", \"Travel\"]',NULL,1,1);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-22 18:29:59
