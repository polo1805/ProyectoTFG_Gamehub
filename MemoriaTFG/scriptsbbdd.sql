-- phpMyAdmin SQL Dump
-- version 4.9.11
-- https://www.phpmyadmin.net/
--
-- Servidor: db5017923875.hosting-data.io
-- Tiempo de generación: 29-05-2025 a las 20:53:32
-- Versión del servidor: 8.0.36
-- Versión de PHP: 7.4.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `dbs14268221`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `COMENTARIOS`
--

CREATE TABLE `COMENTARIOS` (
  `ID_COMENTARIO` int NOT NULL,
  `ID_USUARIO` int NOT NULL,
  `ID_PUBLICACION` int NOT NULL,
  `CONTENIDO` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `FECHA_COMENTARIO` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `COMENTARIOS`
--

INSERT INTO `COMENTARIOS` (`ID_COMENTARIO`, `ID_USUARIO`, `ID_PUBLICACION`, `CONTENIDO`, `FECHA_COMENTARIO`) VALUES
(23, 47, 105, 'eeee', '2025-02-28 18:53:58'),
(24, 47, 105, 'eeee', '2025-02-28 18:54:04'),
(25, 47, 105, 'eeeee', '2025-02-28 18:54:26'),
(26, 47, 105, 'EEEEE', '2025-02-28 18:54:59'),
(27, 47, 105, 'EEEE', '2025-02-28 18:56:06'),
(28, 47, 105, 'eeee', '2025-02-28 18:56:36'),
(29, 47, 105, 'eeeee', '2025-02-28 18:56:51'),
(30, 47, 105, 'eeeee', '2025-02-28 18:57:17');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `JUEGOS`
--

CREATE TABLE `JUEGOS` (
  `id_juego` int NOT NULL,
  `nombre_juego` varchar(255) NOT NULL,
  `portada` varchar(255) DEFAULT NULL,
  `descripcion` text,
  `fecha_lanzamiento` date DEFAULT NULL,
  `genero` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `calificacion_media` decimal(4,1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `JUEGOS`
--

INSERT INTO `JUEGOS` (`id_juego`, `nombre_juego`, `portada`, `descripcion`, `fecha_lanzamiento`, `genero`, `calificacion_media`) VALUES
(18, 'Red Dead Redemption 2', '67a65b20ed838_red-read-redemption2.png', 'Red Dead Redemption 2 es un videojuego de acción-aventura de mundo abierto con temática del Salvaje Oeste desarrollado y publicado por Rockstar Games.', '2018-10-26', 'Mundo abierto/Accion-Aventura/Tercera Persona/Primera Persona', '8.3'),
(19, 'Valorant', '67a8e0fa767bb_valorant.png', 'Valorant (estilizado como VALORANT) es un shooter táctico en primera persona de estilo hero shooter, desarrollado y publicado por Riot Games. ', '2020-06-02', 'Primera Persona/Shooters', '6.0'),
(20, 'The Last of Us', '6814d54c6559b_latest.png', 'The Last of Us es un videojuego de terror de acción y aventura de disparos en tercera persona desarrollado por la compañía estadounidense Naughty Dog y distribuido por Sony Computer Entertainment para la consola PlayStation 3 en 2013.', '2013-06-14', 'Terror/Accion-Aventura/Tercera Persona', '0.0'),
(22, 'The Last of Us Parte II', '6814e9b38c9eb_latest (1).png', 'The Last of Us Part II es un videojuego de terror de acción y aventura de disparos en tercera persona de 2020 desarrollado por Naughty Dog y publicado por Sony Interactive Entertainment. ', '2020-06-19', 'Terror/Accion-Aventura/Tercera Persona', '0.0'),
(24, 'Candy Crush Saga ', '6814eac80a9d6_co25lo.png', 'Candy Crush Saga es un videojuego de combinación de fichas gratuito desarrollado por King', '2012-04-12', 'Logica', '10.0');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `LIKES`
--

CREATE TABLE `LIKES` (
  `id_like` int NOT NULL,
  `id_usuario` int NOT NULL,
  `id_publicacion` int DEFAULT NULL,
  `fecha_like` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `PUBLICACIONES`
--

CREATE TABLE `PUBLICACIONES` (
  `id_publicacion` int NOT NULL,
  `id_usuario` int NOT NULL,
  `id_juego` int NOT NULL,
  `imagen` json DEFAULT NULL,
  `DESCRIPCION` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `calificacion` int DEFAULT NULL,
  `fecha_publicacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `PUBLICACIONES`
--

INSERT INTO `PUBLICACIONES` (`id_publicacion`, `id_usuario`, `id_juego`, `imagen`, `DESCRIPCION`, `calificacion`, `fecha_publicacion`) VALUES
(105, 47, 18, '[\"67c1f5b799570_LTIuanBn.png\"]', '', 10, '2025-02-28 17:43:19'),
(106, 47, 18, '[]', '', 9, '2025-03-18 21:41:56'),
(110, 47, 18, '[]', '', 9, '2025-04-05 09:53:01');

--
-- Disparadores `PUBLICACIONES`
--
DELIMITER $$
CREATE TRIGGER `ACTUALIZAR_CALIFICACION_MEDIA2` AFTER DELETE ON `PUBLICACIONES` FOR EACH ROW BEGIN
    UPDATE juegos
    SET calificacion_media = (
        SELECT IFNULL(AVG(calificacion), 0)
        FROM publicaciones
        WHERE id_juego = OLD.id_juego
    )
    WHERE id_juego = OLD.id_juego;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `actualizar_calificacion_media` AFTER INSERT ON `PUBLICACIONES` FOR EACH ROW BEGIN
    UPDATE juegos
    SET calificacion_media = (
        SELECT IFNULL(AVG(calificacion), 0)
        FROM publicaciones
        WHERE id_juego = NEW.id_juego
    )
    WHERE id_juego = NEW.id_juego;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `USUARIOS`
--

CREATE TABLE `USUARIOS` (
  `ID_USUARIO` int NOT NULL,
  `NOMBRE` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `CORREO_ELECTRONICO` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `FECHA_REGISTRO` date DEFAULT NULL,
  `NOMBRE_USUARIO` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `CONTRASEÑA` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `BIOGRAFIA` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `ROL` varchar(255) DEFAULT NULL,
  `IMAGEN` varchar(255) DEFAULT NULL,
  `VALIDACION` tinyint(1) NOT NULL DEFAULT '0',
  `CODIGO_VERIFICACION` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `USUARIOS`
--

INSERT INTO `USUARIOS` (`ID_USUARIO`, `NOMBRE`, `CORREO_ELECTRONICO`, `FECHA_REGISTRO`, `NOMBRE_USUARIO`, `CONTRASEÑA`, `BIOGRAFIA`, `ROL`, `IMAGEN`, `VALIDACION`, `CODIGO_VERIFICACION`) VALUES
(45, 'Gamehub Admin', 'gamehub.webapp@gmail.com', '2025-01-15', 'gamehubadmin', '$2y$10$UB/e0m7TZVbtP6TYuuSSP.3cvLt4rvz35isA7vR5aQSLCAxr2B0Nm', NULL, 'ADMIN', 'default.png', 1, '265275'),
(47, 'Alejandro Polo', 'alejandroo.polo@gmail.com', '2025-02-05', 'alejandroo_1805', '$2y$10$bB8pg99O1TZlsa/SOYmisem4MfSa9flyZ6X0.c0xIvlpw1dpq97IS', 'Hola me llamo ', 'USER', '68373550d129f-NYnP0rv0_400x400.png', 1, '829320');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `USUARIO_SEGUIDORES`
--

CREATE TABLE `USUARIO_SEGUIDORES` (
  `ID_SEGUIDOR` int NOT NULL,
  `ID_SEGUIDO` int NOT NULL,
  `FECHA` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `COMENTARIOS`
--
ALTER TABLE `COMENTARIOS`
  ADD PRIMARY KEY (`ID_COMENTARIO`),
  ADD KEY `ID_USUARIO` (`ID_USUARIO`),
  ADD KEY `FK_Comentario_Publicacion` (`ID_PUBLICACION`);

--
-- Indices de la tabla `JUEGOS`
--
ALTER TABLE `JUEGOS`
  ADD PRIMARY KEY (`id_juego`);

--
-- Indices de la tabla `LIKES`
--
ALTER TABLE `LIKES`
  ADD PRIMARY KEY (`id_like`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `FK_Likes_Publicacion` (`id_publicacion`);

--
-- Indices de la tabla `PUBLICACIONES`
--
ALTER TABLE `PUBLICACIONES`
  ADD PRIMARY KEY (`id_publicacion`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `id_juego` (`id_juego`);

--
-- Indices de la tabla `USUARIOS`
--
ALTER TABLE `USUARIOS`
  ADD PRIMARY KEY (`ID_USUARIO`),
  ADD UNIQUE KEY `correo_electronico` (`CORREO_ELECTRONICO`),
  ADD UNIQUE KEY `NOMBRE_USUARIO` (`NOMBRE_USUARIO`);

--
-- Indices de la tabla `USUARIO_SEGUIDORES`
--
ALTER TABLE `USUARIO_SEGUIDORES`
  ADD PRIMARY KEY (`ID_SEGUIDOR`,`ID_SEGUIDO`),
  ADD KEY `ID_SEGUIDO` (`ID_SEGUIDO`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `COMENTARIOS`
--
ALTER TABLE `COMENTARIOS`
  MODIFY `ID_COMENTARIO` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT de la tabla `JUEGOS`
--
ALTER TABLE `JUEGOS`
  MODIFY `id_juego` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT de la tabla `LIKES`
--
ALTER TABLE `LIKES`
  MODIFY `id_like` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT de la tabla `PUBLICACIONES`
--
ALTER TABLE `PUBLICACIONES`
  MODIFY `id_publicacion` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=114;

--
-- AUTO_INCREMENT de la tabla `USUARIOS`
--
ALTER TABLE `USUARIOS`
  MODIFY `ID_USUARIO` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `COMENTARIOS`
--
ALTER TABLE `COMENTARIOS`
  ADD CONSTRAINT `COMENTARIOS_ibfk_1` FOREIGN KEY (`ID_USUARIO`) REFERENCES `USUARIOS` (`ID_USUARIO`) ON DELETE CASCADE ON UPDATE RESTRICT,
  ADD CONSTRAINT `COMENTARIOS_ibfk_2` FOREIGN KEY (`ID_PUBLICACION`) REFERENCES `PUBLICACIONES` (`id_publicacion`) ON DELETE CASCADE ON UPDATE RESTRICT,
  ADD CONSTRAINT `FK_Comentario_Publicacion` FOREIGN KEY (`ID_PUBLICACION`) REFERENCES `PUBLICACIONES` (`id_publicacion`) ON DELETE CASCADE;

--
-- Filtros para la tabla `LIKES`
--
ALTER TABLE `LIKES`
  ADD CONSTRAINT `FK_Likes_Publicacion` FOREIGN KEY (`id_publicacion`) REFERENCES `PUBLICACIONES` (`id_publicacion`) ON DELETE CASCADE,
  ADD CONSTRAINT `LIKES_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `USUARIOS` (`ID_USUARIO`) ON DELETE CASCADE ON UPDATE RESTRICT,
  ADD CONSTRAINT `LIKES_ibfk_2` FOREIGN KEY (`id_publicacion`) REFERENCES `PUBLICACIONES` (`id_publicacion`);

--
-- Filtros para la tabla `PUBLICACIONES`
--
ALTER TABLE `PUBLICACIONES`
  ADD CONSTRAINT `fk_posts_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `USUARIOS` (`ID_USUARIO`) ON DELETE CASCADE,
  ADD CONSTRAINT `PUBLICACIONES_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `USUARIOS` (`ID_USUARIO`) ON DELETE CASCADE ON UPDATE RESTRICT,
  ADD CONSTRAINT `PUBLICACIONES_ibfk_2` FOREIGN KEY (`id_juego`) REFERENCES `JUEGOS` (`id_juego`) ON DELETE CASCADE ON UPDATE RESTRICT;

--
-- Filtros para la tabla `USUARIO_SEGUIDORES`
--
ALTER TABLE `USUARIO_SEGUIDORES`
  ADD CONSTRAINT `USUARIO_SEGUIDORES_ibfk_1` FOREIGN KEY (`ID_SEGUIDOR`) REFERENCES `USUARIOS` (`ID_USUARIO`) ON DELETE CASCADE ON UPDATE RESTRICT,
  ADD CONSTRAINT `USUARIO_SEGUIDORES_ibfk_2` FOREIGN KEY (`ID_SEGUIDO`) REFERENCES `USUARIOS` (`ID_USUARIO`) ON DELETE CASCADE ON UPDATE RESTRICT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
