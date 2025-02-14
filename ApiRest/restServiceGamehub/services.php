<?

use Firebase\JWT\ExpiredException;

// Mostrar errores PHP (Desactivar en producción)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
//importamos la conexion con la bbddd
require_once(__DIR__ . './config/conexionBBDD.php');
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
            $headers = apache_request_headers();
            if(!array_key_exists('Authorization' , $headers)){
                return false ; 
            }
            $authorization = $headers["Authorization"];
            $authorizationArray = explode(" ", $authorization);
            $token = $authorizationArray[1];
            $decodedToken = JWT::decode($token, new Key($_ENV['KEY'], 'HS256'));
            return $decodedToken;
        } catch (DomainException $domainException) {
            return false ; 
        } catch (ExpiredException $expiredException) {
            return false ;
        } catch (Exception $exception){
            return false ; 
        }

    }

    function validarToken()
    {
        try {
            if(!$this->getToken()){
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
                    $contraseñaHash = password_hash($contraseña, PASSWORD_DEFAULT);//Encriptacion de contraseñas
                    $validacion = false;
                    $codigo = random_int(100000, 900000);
                    $stmt = $conn->prepare("SELECT * FROM USUARIOS 
                    WHERE ( CORREO_ELECTRONICO = ? OR NOMBRE_USUARIO = ? ) AND VALIDACION = 1");//Comprobamos que si el usuario ya existe y si existe que este validado
                    $stmt->bind_param('ss', $email, $username);
                    $stmt->execute();
                    $result = $stmt->get_result();

                    if ($result->num_rows > 0) {//La select nos devuelve datos , por lo que el usuario existe y esta validado , mandamos un error
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
                        if (password_verify($contraseña, $passwordHashed)) {//comprobamos que la contraseña recibida es la misma que la haseada en el bbdd
                            $id = $row['ID_USUARIO'];
                            $now = strtotime('now');
                            $payload = [
                                'exp' => $now + 31536000,//Un año en segundos
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
        } finally {
            $conn->close();
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
                    WHERE CORREO_ELECTRONICO = ?");//Obtenemos el codigo de verificacion de la BBDD y lo comparamos con el recibido
                    $stmt->bind_param('s', $email);
                    $stmt->execute();
                    $result = $stmt->get_result();
                    if ($result->num_rows > 0) {
                        $row = $result->fetch_assoc();
                        if ($row['CODIGO_VERIFICACION'] != $codigo) {//Si no es el mismo el recibido que el de la BBDD , mandamos error
                            http_response_code(401);
                            return json_encode([
                                'status' => 401,
                                'message' => 'Codigo de validacion incorrecto'
                            ]);
                        } else {//Si es igual , actulizamos el estado de validacion a true
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
    
    public function getPerfil()
    {
        if(!$this->validarToken()){//Comprobamos que el token es valido
            http_response_code(400);
            return json_encode([
                'status'=> 401 , 
                'message'=> 'No autorizado . Credenciales de autenticacion incorrectas'
            ]);
        }else{//Si es valido , obtenemos los datos del usuario que nos han mandado
            http_response_code(200);
            $json = file_get_contents('php://input');
            $datos = json_decode($json, true);
            if(isset($datos['USERNAME'])){
                $username = $datos['USERNAME'];
                $conexionBD = new ConexionBBDD;
                $conn = $conexionBD->conectarBBDD();
                $stmt = $conn->prepare("SELECT * FROM USUARIOS WHERE NOMBRE_USUARIO = ?");
                $stmt->bind_param('s', $username);
                $stmt->execute();
                $result = $stmt->get_result();
                if($result->num_rows > 0){
                    $row = $result->fetch_assoc();
                    return json_encode([
                        'status'=>200 , 
                        'message'=>$row
                    ]);
                }else{
                    return json_encode([
                        'status'=>404 , 
                        'message'=>'Usuario no encontrado'
                    ]);
                }
            }else{//Si no nos han mandado ningun usuario , obtenemos los datos del usuario que ha iniciado sesion
                return json_encode([
                    'status'=>200 , 
                    'message'=>$this->validarToken()
                ]);
            }

        }

    }
    public function buscarUsuarios(){
        try{
            header('Content-Type: application/json');
            if(!$this->validarToken()){
                http_response_code(400);
                return json_encode([
                    'status'=> 401 , 
                    'message'=> 'No autorizado . Credenciales de autenticacion incorrectas'
                ]);
            }else{            
                $conexionBD = new ConexionBBDD;
                $conn = $conexionBD->conectarBBDD();
                if($conn){
                    $json = file_get_contents('php://input');
                    $datos = json_decode($json, true);
                    if(isset($datos['INPUT'])){
                        $input = $datos['INPUT']."%";
                        $stmt = $conn->prepare("SELECT * FROM USUARIOS WHERE NOMBRE LIKE ? OR NOMBRE_USUARIO LIKE ?");
                        $stmt->bind_param('ss', $input , $input);
                        $stmt->execute();
                        $result = $stmt->get_result();
                        if($result->num_rows > 0){
                            $usuarios = [];
                            http_response_code(200);
                            while($row = $result->fetch_assoc()){
                                array_push($usuarios , $row);
                            }
                            return json_encode([
                                'status'=>200 , 
                                'message'=>$usuarios
                            ]);
                        }else{
                            http_response_code(404);
                            return json_encode([
                                'status'=>404 , 
                                'message'=>'No se han encontrado usuarios'
                            ]);
                        }
                    }
                }
            }
        }catch(Exception $error){
            http_response_code(500);
            return json_encode([
                'status'=>500 , 
                'message'=>'Internal Server Error : '.$error
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