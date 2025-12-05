-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 05-12-2025 a las 05:18:27
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `twin_messenger`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `contacts_list`
--

CREATE TABLE `contacts_list` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `contact_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `contacts_list`
--

INSERT INTO `contacts_list` (`id`, `user_id`, `contact_id`, `created_at`) VALUES
(1, 1, 2, '2025-12-03 19:31:00'),
(2, 2, 1, '2025-12-03 19:31:00'),
(3, 1, 3, '2025-12-03 19:31:00'),
(4, 3, 1, '2025-12-03 19:31:00'),
(5, 2, 3, '2025-12-03 19:31:00'),
(6, 3, 2, '2025-12-03 19:31:00'),
(7, 6, 7, '2025-12-03 19:32:25'),
(8, 7, 6, '2025-12-03 19:32:25'),
(9, 8, 6, '2025-12-03 20:45:53'),
(10, 6, 8, '2025-12-03 20:45:53'),
(11, 8, 7, '2025-12-03 20:47:06'),
(12, 7, 8, '2025-12-03 20:47:06');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `is_buzz` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `messages`
--

INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `message`, `is_read`, `is_buzz`, `created_at`) VALUES
(1, 1, 2, 'Hola Jorge, ¿cómo estás?', 1, 0, '2025-12-03 19:31:00'),
(2, 2, 1, '¡Hola Juan! Todo bien, ¿y tú?', 1, 0, '2025-12-03 19:31:00'),
(3, 1, 2, 'Perfecto, trabajando en el proyecto', 1, 0, '2025-12-03 19:31:00'),
(4, 8, 6, '📢 BUZZ!', 1, 1, '2025-12-03 20:46:04'),
(5, 6, 8, 'Hola', 1, 0, '2025-12-03 20:46:07'),
(6, 6, 8, 'hey', 1, 0, '2025-12-03 20:46:19'),
(7, 8, 6, '📢 BUZZ!', 1, 1, '2025-12-03 20:46:23'),
(8, 8, 6, 'hola', 1, 0, '2025-12-03 20:46:28'),
(9, 8, 7, 'hola', 1, 0, '2025-12-03 20:47:13'),
(10, 6, 8, 'hola', 1, 0, '2025-12-03 20:49:00'),
(11, 6, 8, '🔔 BUZZ!', 1, 1, '2025-12-03 20:49:07'),
(12, 8, 6, '🔔 BUZZ!', 1, 1, '2025-12-03 20:49:18'),
(13, 8, 6, '🔔 BUZZ!', 1, 1, '2025-12-03 20:49:24'),
(14, 6, 8, '🔔 BUZZ!', 1, 1, '2025-12-03 20:49:32'),
(15, 8, 6, '🔔 BUZZ!', 1, 1, '2025-12-03 20:49:37'),
(16, 6, 8, 'Hey tale', 1, 0, '2025-12-03 20:49:41'),
(17, 8, 6, 'lol', 1, 0, '2025-12-03 20:49:43'),
(18, 6, 8, 'apoco si te gusta el lol xd', 1, 0, '2025-12-03 20:49:57'),
(19, 8, 6, 'no, lol es laughing out loud', 1, 0, '2025-12-03 20:50:19'),
(20, 6, 8, '🔔 BUZZ!', 1, 1, '2025-12-03 21:00:03'),
(21, 8, 6, '🔔 BUZZ!', 1, 1, '2025-12-03 21:00:09'),
(22, 6, 8, 'que pasou bro', 1, 0, '2025-12-03 21:00:12'),
(23, 6, 8, 'jajsa', 1, 0, '2025-12-03 21:00:13'),
(24, 8, 6, 'que pasooo', 1, 0, '2025-12-03 21:00:15'),
(25, 8, 6, '🔔 BUZZ!', 1, 1, '2025-12-03 21:00:20'),
(26, 6, 8, 'no ps aca en twin messenger', 1, 0, '2025-12-03 21:00:27'),
(27, 6, 8, 'tu crees', 1, 0, '2025-12-03 21:00:29'),
(28, 6, 8, '🔔 BUZZ!', 1, 1, '2025-12-03 21:00:30'),
(29, 8, 6, 'que andan haciendo los vatos de la derecha?', 1, 0, '2025-12-03 21:00:54'),
(30, 7, 6, 'Hola', 1, 0, '2025-12-04 03:20:59'),
(31, 7, 6, 'que tal', 1, 0, '2025-12-04 03:21:07'),
(32, 7, 6, '🔔 BUZZ!', 1, 1, '2025-12-04 03:21:08'),
(33, 7, 6, 'hey', 1, 0, '2025-12-04 03:21:35'),
(34, 7, 6, 'hey', 1, 0, '2025-12-04 03:21:46'),
(35, 7, 6, 'hey', 1, 0, '2025-12-04 03:21:47'),
(36, 7, 6, '🔔 BUZZ!', 1, 1, '2025-12-04 03:21:49'),
(37, 7, 6, 'hola', 1, 0, '2025-12-04 03:21:51'),
(38, 7, 6, 'responde', 1, 0, '2025-12-04 03:21:53'),
(39, 7, 6, 'te estoy hablando', 1, 0, '2025-12-04 03:21:58'),
(40, 6, 7, 'Hola', 1, 0, '2025-12-04 15:39:23'),
(41, 6, 7, '🔔 BUZZ!', 1, 1, '2025-12-04 15:39:41'),
(42, 7, 6, 'J', 1, 0, '2025-12-04 15:40:36'),
(43, 6, 7, 'Ya', 1, 0, '2025-12-04 15:40:47'),
(44, 6, 7, '🔔 BUZZ!', 1, 1, '2025-12-04 15:44:36'),
(45, 6, 7, '🔔 BUZZ!', 1, 1, '2025-12-04 15:44:44'),
(46, 6, 7, '🔔 BUZZ!', 1, 1, '2025-12-04 15:44:55'),
(47, 6, 7, 'Hola', 1, 0, '2025-12-04 15:45:16'),
(48, 6, 7, '🔔 BUZZ!', 1, 1, '2025-12-04 15:46:10');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `status` enum('online','offline') NOT NULL DEFAULT 'offline',
  `last_activity` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `status`, `last_activity`, `created_at`) VALUES
(1, 'Juan Pérez', 'juan@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'offline', '2025-12-03 19:31:00', '2025-12-03 19:31:00'),
(2, 'Jorge García', 'jorge@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'offline', '2025-12-03 19:31:00', '2025-12-03 19:31:00'),
(3, 'María López', 'maria@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'offline', '2025-12-03 19:31:00', '2025-12-03 19:31:00'),
(4, 'Carlos Ruiz', 'carlos@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'offline', '2025-12-03 19:31:00', '2025-12-03 19:31:00'),
(5, 'Ana Martínez', 'ana@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'offline', '2025-12-03 19:31:00', '2025-12-03 19:31:00'),
(6, 'Angel Perez', 'angel@gmail.com', '$2y$12$MOkRl9uiU1zuH3iXQbmUYuCLU7W/mFyIsm9vw4IOg3YtqtOLv7XNC', 'offline', '2025-12-03 19:31:44', '2025-12-03 19:31:44'),
(7, 'Alex Perez', 'alex@gmail.com', '$2y$12$5P9UFwS/svNes0Ww.Rm72eftoNg8y.ZbegpRaX9T7fRfeD6NLe7di', 'offline', '2025-12-03 19:32:12', '2025-12-03 19:32:12'),
(8, 'Dominique', 'vaqueradominique@gmail.com', '$2y$12$J/fpFAIMhHiaAwVIIO6ZUOmYd3og8Unoc9iPW3QCYM0HLgO8uy3b.', 'offline', '2025-12-03 20:45:29', '2025-12-03 20:45:29');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `contacts_list`
--
ALTER TABLE `contacts_list`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_contact` (`user_id`,`contact_id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_contact` (`contact_id`);

--
-- Indices de la tabla `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_sender` (`sender_id`),
  ADD KEY `idx_receiver` (`receiver_id`),
  ADD KEY `idx_conversation` (`sender_id`,`receiver_id`,`created_at`),
  ADD KEY `idx_unread` (`receiver_id`,`is_read`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_email` (`email`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `contacts_list`
--
ALTER TABLE `contacts_list`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `contacts_list`
--
ALTER TABLE `contacts_list`
  ADD CONSTRAINT `fk_contacts_contact` FOREIGN KEY (`contact_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_contacts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `fk_messages_receiver` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_messages_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
