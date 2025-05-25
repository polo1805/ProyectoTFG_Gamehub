-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 25-05-2025 a las 18:08:08
-- Versión del servidor: 8.0.36
-- Versión de PHP: 7.4.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `gamehub`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `comentarios`
--

CREATE TABLE `comentarios` (
  `ID_COMENTARIO` int NOT NULL,
  `ID_USUARIO` int NOT NULL,
  `ID_PUBLICACION` int NOT NULL,
  `CONTENIDO` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `FECHA_COMENTARIO` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `juegos`
--

CREATE TABLE `juegos` (
  `id_juego` int NOT NULL,
  `nombre_juego` varchar(255) NOT NULL,
  `portada` varchar(255) DEFAULT NULL,
  `descripcion` text,
  `fecha_lanzamiento` date DEFAULT NULL,
  `genero` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `calificacion_media` decimal(4,1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;



-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `likes`
--

CREATE TABLE `likes` (
  `id_like` int NOT NULL,
  `id_usuario` int NOT NULL,
  `id_publicacion` int DEFAULT NULL,
  `fecha_like` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `publicaciones`
--

CREATE TABLE `publicaciones` (
  `id_publicacion` int NOT NULL,
  `id_usuario` int NOT NULL,
  `id_juego` int NOT NULL,
  `imagen` json DEFAULT NULL,
  `DESCRIPCION` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `calificacion` int DEFAULT NULL,
  `fecha_publicacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ;

--
-- Disparadores `publicaciones`
--
DELIMITER $$
CREATE TRIGGER `ACTUALIZAR_CALIFICACION_MEDIA2` AFTER DELETE ON `publicaciones` FOR EACH ROW BEGIN
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
CREATE TRIGGER `actualizar_calificacion_media` AFTER INSERT ON `publicaciones` FOR EACH ROW BEGIN
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
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
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


-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario_seguidores`
--

CREATE TABLE `usuario_seguidores` (
  `ID_SEGUIDOR` int NOT NULL,
  `ID_SEGUIDO` int NOT NULL,
  `FECHA` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;



--
-- Indices de la tabla `comentarios`
--
ALTER TABLE `comentarios`
  ADD PRIMARY KEY (`ID_COMENTARIO`),
  ADD KEY `ID_USUARIO` (`ID_USUARIO`),
  ADD KEY `FK_Comentario_Publicacion` (`ID_PUBLICACION`);

--
-- Indices de la tabla `juegos`
--
ALTER TABLE `juegos`
  ADD PRIMARY KEY (`id_juego`);

--
-- Indices de la tabla `likes`
--
ALTER TABLE `likes`
  ADD PRIMARY KEY (`id_like`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `FK_Likes_Publicacion` (`id_publicacion`);

--
-- Indices de la tabla `publicaciones`
--
ALTER TABLE `publicaciones`
  ADD PRIMARY KEY (`id_publicacion`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `id_juego` (`id_juego`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`ID_USUARIO`),
  ADD UNIQUE KEY `correo_electronico` (`CORREO_ELECTRONICO`),
  ADD UNIQUE KEY `NOMBRE_USUARIO` (`NOMBRE_USUARIO`);

--
-- Indices de la tabla `usuario_seguidores`
--
ALTER TABLE `usuario_seguidores`
  ADD PRIMARY KEY (`ID_SEGUIDOR`,`ID_SEGUIDO`),
  ADD KEY `ID_SEGUIDO` (`ID_SEGUIDO`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `comentarios`
--
ALTER TABLE `comentarios`
  MODIFY `ID_COMENTARIO` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT de la tabla `juegos`
--
ALTER TABLE `juegos`
  MODIFY `id_juego` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT de la tabla `likes`
--
ALTER TABLE `likes`
  MODIFY `id_like` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT de la tabla `publicaciones`
--
ALTER TABLE `publicaciones`
  MODIFY `id_publicacion` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `ID_USUARIO` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `comentarios`
--
ALTER TABLE `comentarios`
  ADD CONSTRAINT `comentarios_ibfk_1` FOREIGN KEY (`ID_USUARIO`) REFERENCES `usuarios` (`ID_USUARIO`),
  ADD CONSTRAINT `comentarios_ibfk_2` FOREIGN KEY (`ID_PUBLICACION`) REFERENCES `publicaciones` (`id_publicacion`),
  ADD CONSTRAINT `FK_Comentario_Publicacion` FOREIGN KEY (`ID_PUBLICACION`) REFERENCES `publicaciones` (`id_publicacion`) ON DELETE CASCADE;

--
-- Filtros para la tabla `likes`
--
ALTER TABLE `likes`
  ADD CONSTRAINT `FK_Likes_Publicacion` FOREIGN KEY (`id_publicacion`) REFERENCES `publicaciones` (`id_publicacion`) ON DELETE CASCADE,
  ADD CONSTRAINT `likes_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`ID_USUARIO`),
  ADD CONSTRAINT `likes_ibfk_2` FOREIGN KEY (`id_publicacion`) REFERENCES `publicaciones` (`id_publicacion`);

--
-- Filtros para la tabla `publicaciones`
--
ALTER TABLE `publicaciones`
  ADD CONSTRAINT `publicaciones_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`ID_USUARIO`),
  ADD CONSTRAINT `publicaciones_ibfk_2` FOREIGN KEY (`id_juego`) REFERENCES `juegos` (`id_juego`);

--
-- Filtros para la tabla `usuario_seguidores`
--
ALTER TABLE `usuario_seguidores`
  ADD CONSTRAINT `usuario_seguidores_ibfk_1` FOREIGN KEY (`ID_SEGUIDOR`) REFERENCES `usuarios` (`ID_USUARIO`),
  ADD CONSTRAINT `usuario_seguidores_ibfk_2` FOREIGN KEY (`ID_SEGUIDO`) REFERENCES `usuarios` (`ID_USUARIO`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
