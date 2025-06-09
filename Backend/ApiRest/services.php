<?

use Firebase\JWT\ExpiredException;

// Mostrar errores PHP (Desactivar en producción)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
//importamos la conexion con la bbddd
require_once(__DIR__.'/config/conexionBBDD.php');
//Importamos JWT
require 'vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
//Importamos PHPMailer
require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;
//Cargamos las variables de entorno 
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();
class Services
{
    //Metodo que se encarga de obtener el token 
    function getToken()
    {
        try {
            $headers = $_SERVER["REDIRECT_HTTP_AUTHORIZATION"];

            $authorizationArray = explode(" ", $headers);
            $token = $authorizationArray[1];
            $decodedToken = JWT::decode($token, new Key($_ENV['KEY'], 'HS256'));
            return $decodedToken;

        } catch (DomainException $domainException) {
            return false;
        } catch (ExpiredException $expiredException) {
            return false;
        } catch (Exception $exception) {
            return false;
        }
    }
    function validarToken()
    {
        try {
            if (!$this->getToken()) {
                return false;
            }
            $info = $this->getToken();
            $conexionBD = new ConexionBBDD();
            $conn = $conexionBD->conectarBBDD();
            $stmt = $conn->prepare("SELECT * FROM USUARIOS WHERE ID_USUARIO = ?");
            $stmt->bind_param('s', $info->data);
            $stmt->execute();
            $result = $stmt->get_result();
            if ($result->num_rows > 0) {
                $row = $result->fetch_assoc();
                return $row;
            } else {
                return false;
            }
        } catch (Exception $exception) {
            return false;
        }
    }
    public function status()
    {
        try {
            header('Content-Type: application/json');
            $conexionBD = new ConexionBBDD;
            $conn = $conexionBD->conectarBBDD();
            if ($conn) {
                http_response_code('200');
                return json_encode([
                    'status' => 200,
                    'message' => 'OK'
                ]);
            }
        } catch (Exception $error) {
            http_response_code(500);
            return json_encode([
                'status' => 500,
                'message' => 'Internal Server Error : ' . $error
            ]);
        } finally {
            $conn->close();
        }
    }
    public function registrarUsuario()
    {
        try {
            $conexionBD = new ConexionBBDD;
            $conn = $conexionBD->conectarBBDD();
            if ($conn) {
                $json = file_get_contents('php://input');
                $datos = json_decode($json, true);
                if (isset($datos['NOMBRE'], $datos['EMAIL'], $datos['USERNAME'], $datos['PASSWORD'])) {
                    //Definimos los datos que se van a registrar
                    $nombre = $datos['NOMBRE'];
                    $email = $datos['EMAIL'];
                    $fecha = date('Y-m-d');
                    $contraseña = $datos['PASSWORD'];
                    $username = $datos['USERNAME'];
                    $rol = 'USER';
                    $imagen = 'default.png';
                    $contraseñaHash = password_hash($contraseña, PASSWORD_DEFAULT); //Encriptacion de contraseñas
                    $validacion = false;
                    $codigo = random_int(100000, 900000);
                    $stmt = $conn->prepare("SELECT * FROM USUARIOS 
                    WHERE ( CORREO_ELECTRONICO = ? OR NOMBRE_USUARIO = ? ) AND VALIDACION = 1"); //Comprobamos que si el usuario ya existe y si existe que este validado
                    $stmt->bind_param('ss', $email, $username);
                    $stmt->execute();
                    $result = $stmt->get_result();

                    if ($result->num_rows > 0) { //La select nos devuelve datos , por lo que el usuario existe y esta validado , mandamos un error
                        http_response_code(409);
                        return json_encode([
                            'status' => 409,
                            'message' => 'El correo electronico o el nombre de usuario ya existen'
                        ]);
                    } else { //El usuario sabemos que no esta validado pero comprobamos que existe para volver a mandarle otro codigo de verificacion
                        $stmt = $conn->prepare("SELECT * FROM USUARIOS 
                        WHERE CORREO_ELECTRONICO = ? OR NOMBRE_USUARIO = ?"); //Miramos si el usuario existe para asi no volver a crearlo 
                        $stmt->bind_param('ss', $email, $username);
                        $stmt->execute();
                        $result = $stmt->get_result();
                        if ($result->num_rows > 0) { //Existe por lo que le enviamos el codigo y lo actualizamos en la bbdd
                            $stmt = $conn->prepare("UPDATE USUARIOS SET CODIGO_VERIFICACION = ? 
                            WHERE CORREO_ELECTRONICO = ?");
                            $stmt->bind_param('ss', $codigo, $email);
                            $stmt->execute();
                            $this->enviarCodigo($email, $codigo);
                        } else { // No existe por lo que tendremos insertarlo 
                            $stmt = $conn->prepare("INSERT INTO USUARIOS (NOMBRE , CORREO_ELECTRONICO , FECHA_REGISTRO , NOMBRE_USUARIO , CONTRASEÑA , ROL , IMAGEN , 
                            VALIDACION , CODIGO_VERIFICACION) 
                            VALUES (? , ? , ? , ? , ? , ? , ? , ? , ? )");

                            $stmt->bind_param('sssssssii', $nombre, $email, $fecha, $username, $contraseñaHash, $rol, $imagen, $validacion, $codigo);

                            if ($stmt->execute()) { //Registrado con exito
                                return $this->enviarCodigo($email, $codigo);
                            } else { //Error al registrar el usuario
                                http_response_code(502);
                                return json_encode([
                                    'status' => 502,
                                    'message' => 'No se ha podido registrar el usuario : ' . $conn->error
                                ]);
                            }
                        }
                    }
                } else { //No se han enviado todos los datos
                    http_response_code(400);
                    return json_encode([
                        'status' => 400,
                        'message' => 'Datos incompletos o invalidos'
                    ]);
                }
            }
        } catch (Exception $error) {
            http_response_code(500);
            return json_encode([
                'status' => 500,
                'message' => 'Internal Server Error : ' . $error
            ]);
        } finally {
            $conn->close();
        }
    }
    // Verifica si el usuario y contraseña corresponden con registrado en la bbdd en el log in
    public function comprobarUsuario()
    {
        try {
            $conexionBD = new ConexionBBDD;
            $conn = $conexionBD->conectarBBDD();
            if ($conn) {
                $json = file_get_contents('php://input');
                $datos = json_decode($json, true);
                if (isset($datos['USUARIO'], $datos['CONTRASEÑA'])) {
                    $usuario = $datos['USUARIO'];
                    $contraseña = $datos['CONTRASEÑA'];
                    $stmt = $conn->prepare("SELECT * FROM USUARIOS 
                    WHERE ( CORREO_ELECTRONICO = ? OR NOMBRE_USUARIO = ? ) AND VALIDACION = 1");
                    $stmt->bind_param('ss', $usuario, $usuario);
                    $stmt->execute();
                    $result = $stmt->get_result();
                    if ($result->num_rows > 0) { // si nos devuelve es que el usuario existe
                        $row = $result->fetch_assoc();
                        $passwordHashed = $row['CONTRASEÑA'];
                        if (password_verify($contraseña, $passwordHashed)) { //comprobamos que la contraseña recibida es la misma que la haseada en el bbdd
                            $id = $row['ID_USUARIO'];
                            $now = strtotime('now');
                            $payload = [
                                'exp' => $now + 31536000, //Un año en segundos
                                'data' => $id,
                            ];
                            $jwt = JWT::encode($payload, $_ENV['KEY'], 'HS256');
                            http_response_code(200);
                            return json_encode([
                                'status' => 200,
                                'message' => 'Usuario correcto',
                                'token' => $jwt,
                                'id' => $id,
                            ]);
                        } else { //Se ha equivocado de contraseña
                            http_response_code(401);
                            return json_encode([
                                'status' => 401,
                                'message' => 'Contraseña incorrecta'
                            ]);
                        }
                    } else { //El usuario no existe en la base de datos
                        http_response_code(404);
                        return json_encode([
                            'status' => 404,
                            'message' => 'Usuario no encontrado'
                        ]);
                    }
                }
            }
        } catch (Exception $error) {
            http_response_code(500);
            return json_encode([
                'status' => 500,
                'message' => 'Internal Server Error : ' . $error
            ]);
        }
    }
    //Comprueba que el codigo recibido , es el codigo registrado en la base de datos
    public function validarCodigo()
    {
        try {
            header('Content-Type: application/json');
            $conexionBD = new ConexionBBDD;
            $conn = $conexionBD->conectarBBDD();
            if ($conn) {
                $json = file_get_contents('php://input');
                $datos = json_decode($json, true);
                if (isset($datos['EMAIL'], $datos['CODIGO'])) {
                    $email = $datos['EMAIL'];
                    $codigo = $datos['CODIGO'];
                    $stmt = $conn->prepare("SELECT CODIGO_VERIFICACION FROM USUARIOS 
                    WHERE CORREO_ELECTRONICO = ?"); //Obtenemos el codigo de verificacion de la BBDD y lo comparamos con el recibido
                    $stmt->bind_param('s', $email);
                    $stmt->execute();
                    $result = $stmt->get_result();
                    if ($result->num_rows > 0) {
                        $row = $result->fetch_assoc();
                        if ($row['CODIGO_VERIFICACION'] != $codigo) { //Si no es el mismo el recibido que el de la BBDD , mandamos error
                            http_response_code(401);
                            return json_encode([
                                'status' => 401,
                                'message' => 'Codigo de validacion incorrecto'
                            ]);
                        } else { //Si es igual , actulizamos el estado de validacion a true
                            $stmt = $conn->prepare("UPDATE USUARIOS SET VALIDACION = 1 WHERE CORREO_ELECTRONICO = ?");
                            $stmt->bind_param('s', $email);
                            $stmt->execute();
                            http_response_code(200);
                            return json_encode([
                                'status' => 200,
                                'message' => 'Codigo de validacion correcto'
                            ]);
                        }
                    }
                }
            }
        } catch (Exception $error) {
            http_response_code(500);
            return json_encode([
                'status' => 500,
                'message' => 'Internal Server Error : ' . $error
            ]);
        } finally {
            $conn->close();
        }
    }
    public function getUsuario()
    {
        if (!$this->validarToken()) { //Comprobamos que el token es valido
            http_response_code(400);
            return json_encode([
                'status' => 401,
                'message' => 'No autorizado . Credenciales de autenticacion incorrectas'
            ]);
        } else { //Si es valido , obtenemos los datos del usuario que nos han mandado
            http_response_code(200);
            $json = file_get_contents('php://input');
            $datos = json_decode($json, true);
            if (isset($datos['ID_USUARIO'])) {
                $id = $datos['ID_USUARIO'];
                $conexionBD = new ConexionBBDD;
                $conn = $conexionBD->conectarBBDD();
                $stmt = $conn->prepare("SELECT * FROM USUARIOS WHERE ID_USUARIO = ?");
                $stmt->bind_param('s', $id);
                $stmt->execute();
                $result = $stmt->get_result();
                if ($result->num_rows > 0) {
                    $row = $result->fetch_assoc();
                    return json_encode([
                        'status' => 200,
                        'message' => $row
                    ]);
                } else {
                    return json_encode([
                        'status' => 404,
                        'message' => 'Usuario no encontrado'
                    ]);
                }
            } else { //Si no nos han mandado ningun usuario , obtenemos los datos del usuario que ha iniciado sesion
                return json_encode([
                    'status' => 200,
                    'message' => $this->validarToken()
                ]);
            }
        }
    }
    public function getPerfil()
    {
        if (!$this->validarToken()) { //Comprobamos que el token es valido
            http_response_code(400);
            return json_encode([
                'status' => 401,
                'message' => 'No autorizado . Credenciales de autenticacion incorrectas'
            ]);
        } else { //Si es valido , obtenemos los datos del usuario que nos han mandado
            http_response_code(200);
            $json = file_get_contents('php://input');
            $datos = json_decode($json, true);
            if (isset($datos['USERNAME'])) {
                $username = $datos['USERNAME'];
                $conexionBD = new ConexionBBDD;
                $conn = $conexionBD->conectarBBDD();
                $stmt = $conn->prepare("SELECT * FROM USUARIOS WHERE NOMBRE_USUARIO = ?");
                $stmt->bind_param('s', $username);
                $stmt->execute();
                $result = $stmt->get_result();
                if ($result->num_rows > 0) {
                    $row = $result->fetch_assoc();
                    return json_encode([
                        'status' => 200,
                        'message' => $row
                    ]);
                } else {
                    return json_encode([
                        'status' => 404,
                        'message' => 'Usuario no encontrado'
                    ]);
                }
            } else { //Si no nos han mandado ningun usuario , obtenemos los datos del usuario que ha iniciado sesion
                return json_encode([
                    'status' => 200,
                    'message' => $this->validarToken()
                ]);
            }
        }
    }
    public function buscarUsuarios()
    {
        try {
            header('Content-Type: application/json');
            if (!$this->validarToken()) {
                http_response_code(400);
                return json_encode([
                    'status' => 401,
                    'message' => 'No autorizado . Credenciales de autenticacion incorrectas'
                ]);
            } else {
                $conexionBD = new ConexionBBDD;
                $conn = $conexionBD->conectarBBDD();
                if ($conn) {
                    $json = file_get_contents('php://input');
                    $datos = json_decode($json, true);
                    if (isset($datos['INPUT'])) {
                        $input = $datos['INPUT'] . "%";
                        $stmt = $conn->prepare("SELECT * FROM USUARIOS WHERE (NOMBRE LIKE ? OR NOMBRE_USUARIO LIKE ?) AND ROL = 'USER'");
                        $stmt->bind_param('ss', $input, $input);
                        $stmt->execute();
                        $result = $stmt->get_result();
                        if ($result->num_rows > 0) {
                            $usuarios = [];
                            http_response_code(200);
                            while ($row = $result->fetch_assoc()) {
                                array_push($usuarios, $row);
                            }
                            return json_encode([
                                'status' => 200,
                                'message' => $usuarios
                            ]);
                        } else {
                            http_response_code(404);
                            return json_encode([
                                'status' => 404,
                                'message' => 'No se han encontrado usuarios'
                            ]);
                        }
                    }
                }
            }
        } catch (Exception $error) {
            http_response_code(500);
            return json_encode([
                'status' => 500,
                'message' => 'Internal Server Error : ' . $error
            ]);
        }
    }
    public function registrarJuego()
    {
        try {
            if (!$this->validarToken()) {
                http_response_code(400);
                return json_encode([
                    'status' => 401,
                    'message' => 'No autorizado . Credenciales de autenticacion incorrectas'
                ]);
            } else {
                $conexionBD = new ConexionBBDD();
                $conn = $conexionBD->conectarBBDD();
                if ($conn) {
                    if (isset($_POST['NOMBRE'], $_FILES['IMAGEN'], $_POST['DESCRIPCION'], $_POST['FECHA'], $_POST['GENERO'])) {
                        $nombre = $_POST['NOMBRE'];
                        $portada = $_FILES['IMAGEN'];
                        $genero = $_POST['GENERO'];
                        $fecha = $_POST['FECHA'];
                        $descripcion = $_POST['DESCRIPCION'];
                        $calificacion = 0;
                        $directorio = './uploads/fotosJuegos/';
                        $nombreArchivo = uniqid() . '_' . basename($_FILES['IMAGEN']['name']);
                        $rutaCompleta = $directorio . $nombreArchivo;
                        if (!move_uploaded_file($_FILES['IMAGEN']['tmp_name'], $rutaCompleta)) {
                            http_response_code(500);
                            return json_encode([
                                'status' => 500,
                                'message' => 'Error al subir imagen'
                            ]);
                        }
                        chmod($rutaCompleta, 0644);
                        $stmt = $conn->prepare("SELECT * FROM JUEGOS WHERE NOMBRE_JUEGO = ?");

                        $stmt->bind_param('s', $nombre);
                        $stmt->execute();
                        $result = $stmt->get_result();
                        if ($result->num_rows) {
                            http_response_code(409);
                            return json_encode([
                                'status' => 409,
                                'message' => 'El juego ya existe'
                            ]);
                        }
                        $stmt = $conn->prepare("INSERT INTO JUEGOS (NOMBRE_JUEGO , PORTADA , DESCRIPCION , FECHA_LANZAMIENTO , GENERO , CALIFICACION_MEDIA) 
                            VALUES (? , ? , ? , ? , ? , ?  )");
                        $stmt->bind_param('sssssd', $nombre, $nombreArchivo, $descripcion, $fecha, $genero, $calificacion);
                        if ($stmt->execute()) { //Registro del juego con exito
                            http_response_code(200);
                            return json_encode([
                                'status' => 200,
                                'message' => 'Juego registrado con exito'
                            ]);
                        } else { //Error al registrar el usuario
                            http_response_code(502);
                            return json_encode([
                                'status' => 502,
                                'message' => 'No se ha podido registrar el usuario : ' . $conn->error
                            ]);
                        }
                    }
                }
            }
        } catch (Exception $error) {
            http_response_code(500);
            return json_encode([
                'status' => 500,
                'message' => 'Internal Server Error : ' . $error
            ]);
        }
    }
    public function buscarJuegos()
    {
        try {
            header('Content-Type: application/json');
            if (!$this->validarToken()) {
                http_response_code(400);
                return json_encode([
                    'status' => 401,
                    'message' => 'No autorizado . Credenciales de autenticacion incorrectas'
                ]);
            } else {
                $conexionBD = new ConexionBBDD;
                $conn = $conexionBD->conectarBBDD();
                if ($conn) {
                    $json = file_get_contents('php://input');
                    $datos = json_decode($json, true);
                    if (isset($datos['INPUT'])) {
                        $input = $datos['INPUT'] . "%";
                        $stmt = $conn->prepare("SELECT * FROM JUEGOS WHERE NOMBRE_JUEGO LIKE ?");
                        $stmt->bind_param('s', $input);
                        $stmt->execute();
                        $result = $stmt->get_result();
                        if ($result->num_rows > 0) {
                            $juegos = [];
                            http_response_code(200);
                            while ($row = $result->fetch_assoc()) {
                                array_push($juegos, $row);
                            }
                            return json_encode([
                                'status' => 200,
                                'message' => $juegos
                            ]);
                        } else {
                            http_response_code(404);
                            return json_encode([
                                'status' => 404,
                                'message' => 'No se han encontrado juegos'
                            ]);
                        }
                    }
                }
            }
        } catch (Exception $error) {
            http_response_code(500);
            return json_encode([
                'status' => 500,
                'message' => 'Internal Server Error : ' . $error
            ]);
        }
    }
    public function verJuegos()
    {
        try {
            header('Content-Type: application/json');
            if (!$this->validarToken()) {
                http_response_code(400);
                return json_encode([
                    'status' => 401,
                    'message' => 'No autorizado . Credenciales de autenticacion incorrectas'
                ]);
            } else {
                $conexionBD = new ConexionBBDD;
                $conn = $conexionBD->conectarBBDD();
                if ($conn) {
                    $json = file_get_contents('php://input');
                    $datos = json_decode($json, true);
                    if (isset($datos['ID'])) {
                        $id = $datos['ID'];
                        $stmt = $conn->prepare("SELECT * FROM JUEGOS WHERE ID_JUEGO = ?");
                        $stmt->bind_param('s', $id);
                        $stmt->execute();
                        $result = $stmt->get_result();
                        if ($result->num_rows > 0) {
                            $row = $result->fetch_assoc();
                            http_response_code(200);
                            return json_encode([
                                'status' => 200,
                                'message' => $row
                            ]);
                        } else {
                            http_response_code(404);
                            return json_encode([
                                'status' => 404,
                                'message' => 'No se ha encontrado el juego'
                            ]);
                        }
                    }
                }
            }
        } catch (Exception $error) {
            http_response_code(500);
            return json_encode([
                'status' => 500,
                'message' => 'Internal Server Error : ' . $error
            ]);
        }
    }
    public function subirPost()
    {
        try {
            if (!$this->validarToken()) {
                http_response_code(401);
                return json_encode([
                    'status' => 401,
                    'message' => 'No autorizado. Credenciales de autenticacion incorrectas'
                ]);
            }
            $conexionBD = new ConexionBBDD();
            $conn = $conexionBD->conectarBBDD();
            if ($conn) {
                $descripcion = '';
                $valoracion = $_POST['valoracion'];
                $imagenes = [];
                $juegoID = $_POST['idJuego'];
                $userID = $_POST['idUser'];
                if (isset($_POST['descripcion'])) {
                    $descripcion = $_POST['descripcion'];
                }
                if (isset($_FILES['imagen'])) {
                    $directorio = './uploads/fotosPost/';
                    if (is_array($_FILES['imagen']['tmp_name'])) { // Múltiples archivos
                        foreach ($_FILES['imagen']['tmp_name'] as $key => $tmp_name) {
                            $nombreArchivo = uniqid() . '_' . basename($_FILES['imagen']['name'][$key]); // Usar $key
                            $rutaCompleta = $directorio . $nombreArchivo;

                            if (!move_uploaded_file($tmp_name, $rutaCompleta)) {
                                http_response_code(500);
                                return json_encode(['status' => 500, 'message' => 'Error al subir la imagen']);
                            } else {
                                $imagenes[] = $nombreArchivo;
                            }
                        }
                    } else { // Un solo archivo
                        $nombreArchivo = uniqid() . '_' . basename($_FILES['imagen']['name']);
                        $rutaCompleta = $directorio . $nombreArchivo;
                        if (!move_uploaded_file($_FILES['imagen']['tmp_name'], $rutaCompleta)) {
                            http_response_code(500);
                            return json_encode(['status' => 500, 'message' => 'Error al subir la imagen']);
                        } else {
                            chmod($rutaCompleta , 0644);
                            $imagenes[] = $nombreArchivo;
                        }
                    }
                }
                $stmt = $conn->prepare("INSERT INTO PUBLICACIONES (ID_USUARIO , ID_JUEGO , IMAGEN , DESCRIPCION , CALIFICACION) 
                        VALUES (? , ? , ? , ? , ?)");
                $imagenesjson = json_encode($imagenes);
                $stmt->bind_param('sssss', $userID, $juegoID, $imagenesjson, $descripcion, $valoracion);
                if ($stmt->execute()) {
                    http_response_code(200);
                    return json_encode([
                        'status' => 200,
                        'message' => 'Post subido con exito'
                    ]);
                } else {
                    http_response_code(200);
                    return json_encode([
                        'status' => 500,
                        'message' => 'Error al subir el post' . $stmt->error
                    ]);
                }
            }
        } catch (Exception $error) {
            http_response_code(500);
            return json_encode([
                'status' => 500,
                'message' => 'Internal Server Error : ' . $error
            ]);
        }
    }
    public function getPostsPerfil()
    {
        try {
            header('Content-Type: application/json');
            if (!$this->validarToken()) {
                http_response_code(400);
                return json_encode([
                    'status' => 401,
                    'message' => 'No autorizado . Credenciales de autenticacion incorrectas'
                ]);
            } else {
                $conexionBD = new ConexionBBDD;
                $conn = $conexionBD->conectarBBDD();
                if ($conn) {
                    $json = file_get_contents('php://input');
                    $datos = json_decode($json, true);
                    if (isset($datos['ID_USUARIO'])) {
                        $id = $datos['ID_USUARIO'];
                        $stmt = $conn->prepare("SELECT * FROM PUBLICACIONES WHERE ID_USUARIO = ?");
                        $stmt->bind_param('s', $id);
                        $stmt->execute();
                        $result = $stmt->get_result();
                        if ($result->num_rows > 0) {
                            $posts = [];
                            http_response_code(200);
                            while ($row = $result->fetch_assoc()) {
                                array_push($posts, $row);
                            }
                            return json_encode([
                                'status' => 200,
                                'message' => $posts
                            ]);
                        } else {
                            http_response_code(404);
                            return json_encode([
                                'status' => 404,
                                'message' => 'No se han encontrado posts'
                            ]);
                        }
                    }
                }
            }
        } catch (Exception $error) {
            http_response_code(500);
            return json_encode([
                'status' => 500,
                'message' => 'Internal Server Error : ' . $error
            ]);
        }
    }
    public function getLikes()
    {
        try {
            header('Content-Type: application/json');
            if (!$this->validarToken()) {
                http_response_code(400);
                return json_encode([
                    'status' => 401,
                    'message' => 'No autorizado . Credenciales de autenticacion incorrectas'
                ]);
            } else {
                $conexionBD = new ConexionBBDD;
                $conn = $conexionBD->conectarBBDD();
                if ($conn) {
                    $json = file_get_contents('php://input');
                    $datos = json_decode($json, true);
                    if (isset($datos['ID_USUARIO'], $datos['ID_POST'])) {
                        $id_user = $datos['ID_USUARIO'];
                        $id_post = $datos['ID_POST'];
                        $likes = [];
                        $stmt = $conn->prepare("SELECT COUNT(*) as N_LIKES FROM LIKES WHERE ID_PUBLICACION = ? ");
                        $stmt->bind_param('s', $id_post);
                        $stmt->execute();
                        $result = $stmt->get_result();
                        if ($result->num_rows > 0) {
                            $likes = $result->fetch_assoc();
                            $stmt = $conn->prepare("SELECT ID_USUARIO FROM LIKES WHERE ID_PUBLICACION = ? ");
                            $stmt->bind_param('s', $id_post);
                            $stmt->execute();
                            $result = $stmt->get_result();
                            if ($result->num_rows > 0) {
                                $likeUsuario = true;
                            } else {
                                $likeUsuario = false;
                            }
                            $likes['LIKE_USUARIO'] = $likeUsuario;
                            http_response_code(200);
                            return json_encode([
                                'status' => 200,
                                'message' => $likes
                            ]);
                        } else {
                            http_response_code(404);
                            return json_encode([
                                'status' => 404,
                                'message' => 'No se han encontrado posts'
                            ]);
                        }
                    }
                }
            }
        } catch (Exception $error) {
            http_response_code(500);
            return json_encode([
                'status' => 500,
                'message' => 'Internal Server Error : ' . $error
            ]);
        }
    }
    public function anadirLike()
    {
        try {
            header('Content-Type: application/json');
            if (!$this->validarToken()) {
                http_response_code(400);
                return json_encode([
                    'status' => 401,
                    'message' => 'No autorizado . Credenciales de autenticacion incorrectas'
                ]);
            } else {
                $conexionBD = new ConexionBBDD;
                $conn = $conexionBD->conectarBBDD();
                if ($conn) {
                    $json = file_get_contents('php://input');
                    $datos = json_decode($json, true);
                    if (isset($datos['ID_USUARIO'], $datos['ID_POST'])) {
                        $id_user = $datos['ID_USUARIO'];
                        $id_post = $datos['ID_POST'];
                        $stmt = $conn->prepare("INSERT INTO LIKES (ID_USUARIO , ID_PUBLICACION) VALUES ( ? , ? )");
                        $stmt->bind_param('ss', $id_user, $id_post);
                        if ($stmt->execute()) {
                            http_response_code(200);
                            return json_encode([
                                'status' => 200,
                                'message' => 'Like añadido correctamente'
                            ]);
                        } else {
                            http_response_code(404);
                            return json_encode([
                                'status' => 404,
                                'message' => 'Error al añadir el like'
                            ]);
                        }
                    }
                }
            }
        } catch (Exception $error) {
            http_response_code(500);
            return json_encode([
                'status' => 500,
                'message' => 'Internal Server Error : ' . $error
            ]);
        }
    }
    public function eliminarLike()
    {
        try {
            header('Content-Type: application/json');
            if (!$this->validarToken()) {
                http_response_code(400);
                return json_encode([
                    'status' => 401,
                    'message' => 'No autorizado . Credenciales de autenticacion incorrectas'
                ]);
            } else {
                $conexionBD = new ConexionBBDD;
                $conn = $conexionBD->conectarBBDD();
                if ($conn) {
                    $json = file_get_contents('php://input');
                    $datos = json_decode($json, true);
                    if (isset($datos['ID_USUARIO'], $datos['ID_POST'])) {
                        $id_user = $datos['ID_USUARIO'];
                        $id_post = $datos['ID_POST'];
                        $stmt = $conn->prepare("DELETE FROM LIKES WHERE ID_USUARIO = ? AND ID_PUBLICACION = ?");
                        $stmt->bind_param('ss', $id_user, $id_post);
                        if ($stmt->execute()) {
                            http_response_code(200);
                            return json_encode([
                                'status' => 200,
                                'message' => 'Like eliminado correctamente'
                            ]);
                        } else {
                            http_response_code(404);
                            return json_encode([
                                'status' => 404,
                                'message' => 'Error al eliminar el like'
                            ]);
                        }
                    }
                }
            }
        } catch (Exception $error) {
            http_response_code(500);
            return json_encode([
                'status' => 500,
                'message' => 'Internal Server Error : ' . $error
            ]);
        }
    }
    public function anadirComentario()
    {
        try {
            header('Content-Type: application/json');
            if (!$this->validarToken()) {
                http_response_code(400);
                return json_encode([
                    'status' => 401,
                    'message' => 'No autorizado . Credenciales de autenticacion incorrectas'
                ]);
            } else {
                $conexionBD = new ConexionBBDD;
                $conn = $conexionBD->conectarBBDD();
                if ($conn) {
                    $json = file_get_contents('php://input');
                    $datos = json_decode($json, true);
                    if (isset($datos['ID_USUARIO'], $datos['ID_POST'])) {
                        $id_user = $datos['ID_USUARIO'];
                        $id_post = $datos['ID_POST'];
                        $comentario = $datos['COMENTARIO'];
                        $stmt = $conn->prepare("INSERT INTO COMENTARIOS (ID_USUARIO , ID_PUBLICACION , CONTENIDO) VALUES ( ? , ? , ?)");
                        $stmt->bind_param('sss', $id_user, $id_post, $comentario);
                        if ($stmt->execute()) {
                            $id_comentario = $conn->insert_id;
                            $stmt = $conn->prepare("SELECT * FROM COMENTARIOS WHERE ID_COMENTARIO = ?");
                            $stmt->bind_param('s', $id_comentario);
                            $stmt->execute();   
                            $result = $stmt->get_result();
                            $row = $result->fetch_assoc();

                            http_response_code(200);
                            return json_encode([
                                'status' => 200,
                                'message' => $row,
                                'info' => 'Comentario agregado correctamente'
                            ]);
                        } else {
                            http_response_code(404);
                            return json_encode([
                                'status' => 404,
                                'message' => 'Error al subir el comentario'
                            ]);
                        }
                    }
                }
            }
        } catch (Exception $error) {
            http_response_code(500);
            return json_encode([
                'status' => 500,
                'message' => 'Internal Server Error : ' . $error
            ]);
        }
    }
    public function getNumeroComentarios()
    {
        try {
            header('Content-Type: application/json');
            if (!$this->validarToken()) {
                http_response_code(400);
                return json_encode([
                    'status' => 401,
                    'message' => 'No autorizado . Credenciales de autenticacion incorrectas'
                ]);
            } else {
                $conexionBD = new ConexionBBDD;
                $conn = $conexionBD->conectarBBDD();
                if ($conn) {
                    $json = file_get_contents('php://input');
                    $datos = json_decode($json, true);
                    if (isset($datos['ID_POST'])) {
                        $id_post = $datos['ID_POST'];
                        $stmt = $conn->prepare("SELECT COUNT(*) as N_COMENTARIOS FROM COMENTARIOS WHERE ID_PUBLICACION = ? ");
                        $stmt->bind_param('s', $id_post);
                        $stmt->execute();
                        $result = $stmt->get_result();
                        if ($result->num_rows > 0) {
                            $row = $result->fetch_assoc();
                            http_response_code(200);
                            return json_encode([
                                'status' => 200,
                                'message' => $row
                            ]);
                        } else {
                            http_response_code(404);
                            return json_encode([
                                'status' => 404,
                                'message' => 'No se han encontrado posts'
                            ]);
                        }
                    }
                }
            }
        } catch (Exception $error) {
            http_response_code(500);
            return json_encode([
                'status' => 500,
                'message' => 'Internal Server Error : ' . $error
            ]);
        }
    }
    public function eliminarPostPerfil()
    {
        try {
            header('Content-Type: application/json');
            if (!$this->validarToken()) {
                http_response_code(400);
                return json_encode([
                    'status' => 401,
                    'message' => 'No autorizado . Credenciales de autenticacion incorrectas'
                ]);
            } else {
                $conexionBD = new ConexionBBDD;
                $conn = $conexionBD->conectarBBDD();
                if ($conn) {
                    $json = file_get_contents('php://input');
                    $datos = json_decode($json, true);
                    if (isset($datos['ID_POST'])) {
                        $id_post = $datos['ID_POST'];
                        $stmt = $conn->prepare("DELETE FROM PUBLICACIONES WHERE ID_PUBLICACION = ?");
                        $stmt->bind_param('s', $id_post);
                        if ($stmt->execute()) {
                            http_response_code(200);
                            return json_encode([
                                'status' => 200,
                                'message' => 'Publicacion eliminada correctamente'
                            ]);
                        } else {
                            http_response_code(404);
                            return json_encode([
                                'status' => 404,
                                'message' => 'Error al eliminar la publicacion'
                            ]);
                        }
                    }
                }
            }
        } catch (Exception $error) {
            http_response_code(500);
            return json_encode([
                'status' => 500,
                'message' => 'Internal Server Error : ' . $error
            ]);
        }
    }
    public function cargarPost()
    {
        try {
            header('Content-Type: application/json');
            if (!$this->validarToken()) {
                http_response_code(400);
                return json_encode([
                    'status' => 401,
                    'message' => 'No autorizado . Credenciales de autenticacion incorrectas'
                ]);
            } else {
                $conexionBD = new ConexionBBDD;
                $conn = $conexionBD->conectarBBDD();
                if ($conn) {
                    $json = file_get_contents('php://input');
                    $datos = json_decode($json, true);
                    if (isset($datos['ID_POST'])) {
                        $id_post = $datos['ID_POST'];
                        $stmt = $conn->prepare("SELECT * FROM PUBLICACIONES WHERE ID_PUBLICACION = ? ");
                        $stmt->bind_param('s', $id_post);
                        $stmt->execute();
                        $result = $stmt->get_result();
                        if ($result->num_rows > 0) {
                            $row = $result->fetch_assoc();
                            http_response_code(200);
                            return json_encode([
                                'status' => 200,
                                'message' => $row
                            ]);
                        } else {
                            http_response_code(404);
                            return json_encode([
                                'status' => 404,
                                'message' => 'No se han encontrado posts'
                            ]);
                        }
                    }
                }
            }
        } catch (Exception $error) {
            http_response_code(500);
            return json_encode([
                'status' => 500,
                'message' => 'Internal Server Error : ' . $error
            ]);
        }
    }
    public function cargarComentarios()
    {
        try {
            header('Content-Type: application/json');
            if (!$this->validarToken()) {
                http_response_code(400);
                return json_encode([
                    'status' => 401,
                    'message' => 'No autorizado . Credenciales de autenticacion incorrectas'
                ]);
            } else {
                $conexionBD = new ConexionBBDD;
                $conn = $conexionBD->conectarBBDD();
                if ($conn) {
                    $json = file_get_contents('php://input');
                    $datos = json_decode($json, true);
                    if (isset($datos['ID_POST'])) {
                        $id = $datos['ID_POST'];
                        $stmt = $conn->prepare("SELECT * FROM COMENTARIOS WHERE ID_PUBLICACION = ?");
                        $stmt->bind_param('s', $id);
                        $stmt->execute();
                        $result = $stmt->get_result();
                        if ($result->num_rows > 0) {
                            $comentarios = [];
                            http_response_code(200);
                            while ($row = $result->fetch_assoc()) {
                                array_push($comentarios, $row);
                            }
                            return json_encode([
                                'status' => 200,
                                'message' => $comentarios
                            ]);
                        } else {
                            http_response_code(404);
                            return json_encode([
                                'status' => 404,
                                'message' => 'No se han encontrado comentarios'
                            ]);
                        }
                    }
                }
            }
        } catch (Exception $error) {
            http_response_code(500);
            return json_encode([
                'status' => 500,
                'message' => 'Internal Server Error : ' . $error
            ]);
        }
    }
    public function cargarPostParaTi()
    {
        try {
            header('Content-Type: application/json');
            if (!$this->validarToken()) {
                http_response_code(400);
                return json_encode([
                    'status' => 401,
                    'message' => 'No autorizado . Credenciales de autenticacion incorrectas'
                ]);
            } else {
                $conexionBD = new ConexionBBDD;
                $conn = $conexionBD->conectarBBDD();
                if ($conn) {
                    $stmt = $conn->prepare("SELECT * FROM PUBLICACIONES");
                    $stmt->execute();
                    $result = $stmt->get_result();
                    if ($result->num_rows > 0) {
                        $posts = [];
                        http_response_code(200);
                        while ($row = $result->fetch_assoc()) {
                            array_push($posts, $row);
                        }
                        return json_encode([
                            'status' => 200,
                            'message' => $posts
                        ]);
                    } else {
                        http_response_code(404);
                        return json_encode([
                            'status' => 404,
                            'message' => 'No se han encontrado post'
                        ]);
                    }
                }
            }
        } catch (Exception $error) {
            http_response_code(500);
            return json_encode([
                'status' => 500,
                'message' => 'Internal Server Error : ' . $error
            ]);
        }
    }
    public function eliminarComentario(){
        try {
            header('Content-Type: application/json');
            if (!$this->validarToken()) {
                http_response_code(400);
                return json_encode([
                    'status' => 401,
                    'message' => 'No autorizado . Credenciales de autenticacion incorrectas'
                ]);
            } else {
                $conexionBD = new ConexionBBDD;
                $conn = $conexionBD->conectarBBDD();
                if ($conn) {
                    $json = file_get_contents('php://input');
                    $datos = json_decode($json, true);
                    if (isset($datos['ID_COMENTARIO'])) {
                        $id_post = $datos['ID_COMENTARIO'];
                        $stmt = $conn->prepare("DELETE FROM COMENTARIOS WHERE ID_COMENTARIO = ?");
                        $stmt->bind_param('s', $id_post);
                        if ($stmt->execute()) {
                            http_response_code(200);
                            return json_encode([
                                'status' => 200,
                                'message' => 'Comentario eliminado correctamente'
                            ]);
                        } else {
                            http_response_code(404);
                            return json_encode([
                                'status' => 404,
                                'message' => 'Error al eliminar el comentario'
                            ]);
                        }
                    }
                }
            }
        } catch (Exception $error) {
            http_response_code(500);
            return json_encode([
                'status' => 500,
                'message' => 'Internal Server Error : ' . $error
            ]);
        }
    }
    public function cargarPostSiguiendo()
    {
        try {
            header('Content-Type: application/json');
            if (!$this->validarToken()) {
                http_response_code(400);
                return json_encode([
                    'status' => 401,
                    'message' => 'No autorizado . Credenciales de autenticacion incorrectas'
                ]);
            } else {
                $conexionBD = new ConexionBBDD;
                $conn = $conexionBD->conectarBBDD();
                if ($conn) {
                    $json = file_get_contents('php://input');
                    $datos = json_decode($json, true);
                    if(isset($datos['ID_USUARIO'])){
                        $idUsuario = $datos['ID_USUARIO'];
                        $stmt = $conn->prepare("SELECT * FROM PUBLICACIONES WHERE ID_USUARIO IN (SELECT ID_SEGUIDO FROM USUARIO_SEGUIDORES WHERE ID_SEGUIDOR = ?)");
                        $stmt->bind_param('s', $idUsuario);
                        $stmt->execute();
                        $result = $stmt->get_result();
                        if ($result->num_rows > 0) {
                            $posts = [];
                            http_response_code(200);
                            while ($row = $result->fetch_assoc()) {
                                array_push($posts, $row);
                            }
                            return json_encode([
                                'status' => 200,
                                'message' => $posts
                            ]);
                        } else {
                            http_response_code(404);
                            return json_encode([
                                'status' => 404,
                                'message' => 'No se han encontrado post'
                            ]);
                        }
                    }
                }
            }
        } catch (Exception $error) {
            http_response_code(500);
            return json_encode([
                'status' => 500,
                'message' => 'Internal Server Error : ' . $error
            ]);
        }
    }
    public function seguirUsuario(){
        try {
            header('Content-Type: application/json');
            if (!$this->validarToken()) {
                http_response_code(400);
                return json_encode([
                    'status' => 401,
                    'message' => 'No autorizado . Credenciales de autenticacion incorrectas'
                ]);
            } else {
                $conexionBD = new ConexionBBDD;
                $conn = $conexionBD->conectarBBDD();
                if ($conn) {
                    $json = file_get_contents('php://input');
                    $datos = json_decode($json, true);
                    if (isset($datos['ID_USUARIO'], $datos['ID_SEGUIDO'])) {
                        $id_usuario = $datos['ID_USUARIO'];
                        $id_seguido = $datos['ID_SEGUIDO'];
                        $stmt = $conn->prepare("INSERT INTO USUARIO_SEGUIDORES (ID_SEGUIDOR , ID_SEGUIDO) VALUES ( ? , ? )");
                        $stmt->bind_param('ss', $id_usuario , $id_seguido);
                        if ($stmt->execute()) {
                            $stmt = $conn->prepare("SELECT NOMBRE_USUARIO FROM USUARIOS WHERE ID_USUARIO = ?");
                            $stmt->bind_param('s', $id_seguido);
                            $stmt->execute();   
                            $result = $stmt->get_result();
                            $row = $result->fetch_assoc();
                            http_response_code(200);
                            return json_encode([
                                'status' => 200,
                                'message' => 'Has empezado a seguir a '.$row['NOMBRE_USUARIO'],
                            ]);
                        } else {
                            http_response_code(404);
                            return json_encode([
                                'status' => 404,
                                'message' => 'Ha ocurrido un error al seguir a este usuario'
                            ]);
                        }
                    }
                }
            }
        } catch (Exception $error) {
            http_response_code(500);
            return json_encode([
                'status' => 500,
                'message' => 'Internal Server Error : ' . $error
            ]);
        }
    }
    public function comprobarSeguimiento(){
        try {
            header('Content-Type: application/json');
            if (!$this->validarToken()) {
                http_response_code(400);
                return json_encode([
                    'status' => 401,
                    'message' => 'No autorizado . Credenciales de autenticacion incorrectas'
                ]);
            } else {
                $conexionBD = new ConexionBBDD;
                $conn = $conexionBD->conectarBBDD();
                if ($conn) {
                    $json = file_get_contents('php://input');
                    $datos = json_decode($json, true);
                    if (isset($datos['ID_USUARIO'], $datos['ID_SEGUIDO'])) {
                        $id_usuario = $datos['ID_USUARIO'];
                        $id_seguido = $datos['ID_SEGUIDO'];
                        $stmt = $conn->prepare("SELECT * FROM USUARIO_SEGUIDORES WHERE ID_SEGUIDOR = ? AND ID_SEGUIDO = ?");
                        $stmt->bind_param('ss', $id_usuario , $id_seguido);
                        $stmt->execute();
                        $result = $stmt->get_result();
                        if($result->num_rows > 0){
                            http_response_code(200);
                            return json_encode([
                                'status' => 200,
                                'message' => true,
                            ]);
                        }else{  
                            http_response_code(200);
                            return json_encode([
                                'status' => 200,
                                'message' => false
                            ]);
                        }
                    }
                }
            }
        } catch (Exception $error) {
            http_response_code(500);
            return json_encode([
                'status' => 500,
                'message' => 'Internal Server Error : ' . $error
            ]);
        }
    }
    public function eliminarSeguimiento(){
        try {
            header('Content-Type: application/json');
            if (!$this->validarToken()) {
                http_response_code(400);
                return json_encode([
                    'status' => 401,
                    'message' => 'No autorizado . Credenciales de autenticacion incorrectas'
                ]);
            } else {
                $conexionBD = new ConexionBBDD;
                $conn = $conexionBD->conectarBBDD();
                if ($conn) {
                    $json = file_get_contents('php://input');
                    $datos = json_decode($json, true);
                    if (isset($datos['ID_USUARIO'], $datos['ID_SEGUIDO'])) {
                        $id_usuario = $datos['ID_USUARIO'];
                        $id_seguido = $datos['ID_SEGUIDO'];
                        $stmt = $conn->prepare("SELECT NOMBRE_USUARIO FROM USUARIOS WHERE ID_USUARIO = ?");
                        $stmt->bind_param('s', $id_seguido);
                        $stmt->execute();
                        $result = $stmt->get_result();
                        if ($result->num_rows> 0) {
                            $row = $result->fetch_assoc();
                            $stmt = $conn->prepare("DELETE FROM USUARIO_SEGUIDORES WHERE ID_SEGUIDOR = ? AND ID_SEGUIDO = ?");
                            $stmt->bind_param('ss', $id_usuario , $id_seguido);
                            $stmt->execute();   
                            if($stmt->execute()){
                                http_response_code(200);
                                return json_encode([
                                    'status' => 200,
                                    'message' => 'Has dejado de seguir a '.$row['NOMBRE_USUARIO'],
                                ]);
                            }else{
                                http_response_code(404);
                                return json_encode([
                                    'status' => 404,
                                    'message' => 'Ha ocurrido un error al dejar de seguir a este usuario'
                                ]);
                            }
                        }
                    }
                }
            }
        } catch (Exception $error) {
            http_response_code(500);
            return json_encode([
                'status' => 500,
                'message' => 'Internal Server Error : ' . $error
            ]);
        }
    }
    public function getGeneroJuegos(){
        try{
            if(!$this->validarToken()){
                http_response_code(400);
                return json_encode([
                    'status' => 401,
                    'message' => 'No autorizado . Credenciales de autenticacion incorrectas'
                ]);
            }else{
                $conexionBD = new ConexionBBDD;
                $conn = $conexionBD->conectarBBDD();
                $stmt = $conn->prepare("SELECT GENERO FROM JUEGOS");
                $stmt->execute();
                $result = $stmt->get_result();
                $generos = [];
                if($result->num_rows > 0){
                    while($row = $result->fetch_assoc()){
                        //SEPARAMOS LOS GENEROS POR /
                        $generosArray = explode('/' , $row['GENERO']);
                        //AGREGAR LOS GENEROS AL ARRAY 
                        $generos = array_merge($generos , $generosArray);
                    }
                }
            }
            //ELIMINAMOS DUPLICADOS
            $generosUnicos = array_values(array_unique($generos));
            http_response_code(200);
            return json_encode([
                'status' => 200,
                'message' => $generosUnicos
            ]);
        }catch(Exception $error){
            http_response_code(500);
            return json_encode([
                'status' => 500,
                'message' => 'Internal Server Error : ' . $error
            ]);
        }
    }
    public function filtrarJuegosPorGenero(){
        try{
            if(!$this->validarToken()){
                http_response_code(400);
                return json_encode([
                    'status' => 401,
                    'message' => 'No autorizado . Credenciales de autenticacion incorrectas'
                ]);
            }else{
                $conexionBD = new ConexionBBDD;
                $conn = $conexionBD->conectarBBDD();
                if($conn){
                    $json = file_get_contents('php://input');
                    $datos = json_decode($json , true);
                    if(isset($datos['GENEROS']) && is_array($datos['GENEROS'])){
                        $generos = $datos['GENEROS'];
                        $sql = "SELECT * FROM JUEGOS WHERE ";
                        $parametros = [];
                        $filtros = [];
                        $tipos = "";
                        foreach($generos as $genero){
                            $filtros[] = "GENERO LIKE ?";
                            $parametros[] = "%$genero%";
                            $tipos .= "s";
                        }
                        $sql .= implode(" AND ", $filtros);
                        $stmt = $conn->prepare($sql);
                        $stmt->bind_param($tipos , ...$parametros);
                        $stmt->execute();
                        $result = $stmt->get_result();
                        if($result->num_rows > 0){
                            $juegos = [];
                            while($row = $result->fetch_assoc()){
                                array_push($juegos , $row);
                            }
                            http_response_code(200);
                            return json_encode([
                                'status' => 200,
                                'message' => $juegos
                            ]);
                        }else{
                            http_response_code(404);
                            return json_encode([
                                'status' => 404,
                                'message' => 'No se han encontrado juegos'
                            ]);
                        }
                    }
                }
            }
        }catch(Exception $error){
            http_response_code(500);
            return json_encode([
                'status' => 500,
                'message' => 'Internal Server Error : ' . $error
            ]);
        }
    }
    public function editarPerfil(){
        try{
            if(!$this->validarToken()){
                http_response_code(400);
                return json_encode([
                    'status' => 401,
                    'message' => 'No autorizado . Credenciales de autenticacion incorrectas'
                ]);
            }else{
                $conexionBD = new ConexionBBDD;
                $conn = $conexionBD->conectarBBDD();
                if($conn){
                    $nombre = $_POST['nombre'];
                    $username = $_POST['username'];
                    $biografia = $_POST['biografia'];
                    if($biografia == ""){
                        $biografia = null;
                    }
                    if($biografia == "null"){
                        $biografia = null;
                    }
                    $id_usuario = $_POST['id_usuario'];
                    if(isset($_FILES['imagen'])){
                        $nombreArchivo = uniqid().'-'.basename($_FILES['imagen']['name']);
                        $rutaDestino = './uploads/fotosPerfil/'.$nombreArchivo;
                        move_uploaded_file($_FILES['imagen']['tmp_name'] , $rutaDestino);
                        chmod($rutaDestino , 0644);
                        $stmt = $conn->prepare("UPDATE USUARIOS SET NOMBRE = ?, NOMBRE_USUARIO = ?, BIOGRAFIA = ?, IMAGEN = ? WHERE ID_USUARIO = ?");
                        $stmt->bind_param("ssssi", $nombre, $username, $biografia, $nombreArchivo, $id_usuario);
                    }else{
                        $stmt = $conn->prepare("UPDATE USUARIOS SET NOMBRE = ?, NOMBRE_USUARIO = ?, BIOGRAFIA = ? WHERE ID_USUARIO = ?");
                        $stmt->bind_param("sssi", $nombre, $username, $biografia, $id_usuario);
                    }
                    if($stmt->execute()){
                        http_response_code(200);
                        return json_encode([
                            'status' => 200,
                            'message' => 'Perfil actualizado correctamente'
                        ]);
                    }else{
                        http_response_code(404);
                        return json_encode([
                            'status' => 404,
                            'message' => 'Error al actualizar el perfil'
                        ]);
                    }
                }
            }

        }catch(Exception $error){
            http_response_code(500);
            return json_encode([
                'status' => 500,
                'message' => 'Internal Server Error : ' . $error
            ]);
        }
    }
    public function enviarCodigo($email, $codigo)
    {
        $mail = new PHPMailer(true);
        try {
            //configuracion del servidor SMTP de gmail
            $mail->isSMTP();
            $mail->Host = $_ENV['HOST'];
            $mail->SMTPAuth = true;
            $mail->Username = $_ENV['EMAIL'];
            $mail->Password = $_ENV['PASSWORD'];
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = $_ENV['PORT'];
            //Configuaracion del envio de email
            $mail->setFrom($_ENV['EMAIL'], 'Gamehub');
            $mail->addAddress($email);
            $mail->isHTML(true);
            //contenido del correo
            $mail->Subject = 'Codigo de validacion - Gamehub';
            $mail->Body = "<h1>Bienvenido a Gamehub</h1>
                <p>Gracias por registrarte . Aqui tienes tu codigo de validacion :</p>
                <h2 style='color:orange;'>$codigo</h2>
                <p>Introduce este codigo en nuestra plataforma para completar tu registro</p>
                <p>Si no solicitaste esto , ignora este correo</p>
            ";
            $mail->send();
            http_response_code(200);
            return json_encode([
                'status' => 200,
                'message' => 'Usuario registrado con exito'
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode([
                'status' => 500,
                'message' => 'Error al enviar el correo electronico : ' . $mail->ErrorInfo
            ]);
        }
    }
}
