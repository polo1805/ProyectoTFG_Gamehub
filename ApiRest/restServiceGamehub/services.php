<?
// Mostrar errores PHP (Desactivar en producción)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
require_once('./config/conexionBBDD.php');
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;
require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';
class Services{


    public function status(){
        header('Content-Type: application/json');
        $conexionBD = new ConexionBBDD;
        $conn = $conexionBD->conectarBBDD();
        if($conn){
            http_response_code('200');
            return json_encode([
                'status'=>200 , 
                'message'=>'OK'
            ]);
        }
            
    }
    public function registrarUsuario(){
        header('Content-Type: application/json');
        $conexionBD = new ConexionBBDD;
        $conn = $conexionBD->conectarBBDD();
        if($conn){
            $json = file_get_contents('php://input');
            $datos = json_decode($json , true);
            if(isset($datos['NOMBRE'] , $datos['EMAIL'] , $datos['USERNAME'] , $datos['PASSWORD'])){
                //Definimos los datos que se van a registrar
                $nombre = $datos['NOMBRE'] ; 
                $email = $datos['EMAIL'] ; 
                $fecha = date('Y-m-d');
                $contraseña = $datos['PASSWORD'] ; 
                $username = $datos['USERNAME'];
                $rol = 'USER';
                $imagen = 'default.jpg';
                $contraseñaHash = password_hash($contraseña , PASSWORD_DEFAULT);//Encriptacion de contraseñas
                $validacion = false;
                $codigo = random_int(100000 , 900000);
                $stmt = $conn->prepare("SELECT * FROM USUARIOS 
                WHERE ( CORREO_ELECTRONICO = ? OR NOMBRE_USUARIO = ? ) AND VALIDACION = 1");//Comprobamos que si el usuario ya existe y si existe que este validado
                $stmt->bind_param('ss' , $email , $username);
                $stmt->execute();
                $result = $stmt->get_result();

                if($result->num_rows > 0){//La select nos devuelve datos , por lo que el usuario existe y esta validado , mandamos un error
                    http_response_code(409);
                    return json_encode([
                        'status'=>409 , 
                        'message'=>'El correo electronico o el nombre de usuario ya existen'
                    ]);
                }else{ //El usuario sabemos que no esta validado pero comprobamos que existe para volver a mandarle otro codigo de verificacion
                    $stmt = $conn->prepare("SELECT * FROM USUARIOS 
                    WHERE CORREO_ELECTRONICO = ? OR NOMBRE_USUARIO = ?");//Miramos si el usuario existe para asi no volver a crearlo 
                    $stmt->bind_param('ss' , $email , $username);
                    $stmt->execute();
                    $result = $stmt->get_result();
                    if($result->num_rows > 0){//Existe por lo que le enviamos el codigo y lo actualizamos en la bbdd
                        $stmt = $conn -> prepare("UPDATE USUARIOS SET CODIGO_VERIFICACION = ? 
                        WHERE CORREO_ELECTRONICO = ?");
                        $stmt->bind_param('ss' , $codigo , $email);
                        $stmt->execute();
                        $this->enviarCodigo($email , $codigo);
                    }else{ // No existe por lo que tendremos insertarlo 
                        $stmt = $conn->prepare("INSERT INTO USUARIOS (NOMBRE , CORREO_ELECTRONICO , FECHA_REGISTRO , NOMBRE_USUARIO , CONTRASEÑA , ROL , IMAGEN , 
                        VALIDACION , CODIGO_VERIFICACION) 
                        VALUES (? , ? , ? , ? , ? , ? , ? , ? , ? )");
        
                        $stmt -> bind_param('sssssssii' , $nombre , $email , $fecha , $username , $contraseñaHash , $rol , $imagen , $validacion , $codigo);
        
                        if($stmt->execute()){ //Registrado con exito
                            return $this->enviarCodigo($email , $codigo);
        
                        }else{ //Error al registrar el usuario
                            http_response_code(502);
                            return json_encode([
                                'status'=>502 , 
                                'message'=>'No se ha podido registrar el usuario : ' . $conn->error 
                            ]);
                        }
                    }
                }


            }else{ //No se han enviado todos los datos
                http_response_code(400);
                return json_encode([
                    'status'=>400 , 
                    'message'=>'Datos incompletos o invalidos'
                ]);
            }
        }
    }
    // Verifica si el usuario y contraseña corresponden con registrado en la bbdd en el log in
    public function comprobarUsuario(){
        header('Content-Type: application/json');
        $conexionBD = new ConexionBBDD;
        $conn = $conexionBD->conectarBBDD();
        if($conn){
            $json = file_get_contents('php://input');
            $datos = json_decode($json , true);
            if(isset($datos['USUARIO'] , $datos['CONTRASEÑA'])){
                $usuario = $datos['USUARIO'];
                $contraseña = $datos['CONTRASEÑA'];
                $stmt = $conn->prepare("SELECT CONTRASEÑA FROM USUARIOS 
                WHERE ( CORREO_ELECTRONICO = ? OR NOMBRE_USUARIO = ? ) AND VALIDACION = 1");
                $stmt->bind_param('ss' , $usuario , $usuario);
                $stmt->execute();
                $result = $stmt ->get_result();
                if($result->num_rows>0){ // si nos devuelve es que el usuario existe
                    $row = $result->fetch_assoc();
                    $passwordHashed = $row['CONTRASEÑA'];
                    if(password_verify($contraseña , $passwordHashed)){//comprobamos que la contraseña recibida es la misma que la haseada en el bbdd
                        http_response_code(200);
                        return json_encode([
                            'status'=>200 ,
                            'message' =>'Usuario correcto'
                        ]);
                    }else{
                        http_response_code(401);
                        return json_encode([
                            'status'=>401 ,
                            'message' =>'Contraseña incorrecta'
                        ]);
                    }
                }else{
                    http_response_code(404);
                    return json_encode([
                        'status'=>404 ,
                        'message' =>'Usuario no encontrado'
                    ]);
                }
   
            }
        }
    }
    //Comprueba que el codigo recibido , es el codigo registrado en la base de datos
    public function validarCodigo(){
        header('Content-Type: application/json');
        $conexionBD = new ConexionBBDD;
        $conn = $conexionBD->conectarBBDD();
        if($conn){
            $json = file_get_contents('php://input');
            $datos = json_decode($json , true);
            if(isset($datos['EMAIL'] , $datos['CODIGO'])){
                $email = $datos['EMAIL'];
                $codigo = $datos['CODIGO'];
                $stmt = $conn->prepare("SELECT CODIGO_VERIFICACION FROM USUARIOS 
                WHERE CORREO_ELECTRONICO = ?");//Obtenemos el codigo de verificacion de la BBDD y lo comparamos con el recibido
                $stmt->bind_param('s' , $email);
                $stmt->execute();
                $result = $stmt ->get_result();
                if($result->num_rows>0){
                    $row = $result->fetch_assoc();
                    if($row['CODIGO_VERIFICACION'] != $codigo){//Si no es el mismo el recibido que el de la BBDD , mandamos error
                        http_response_code(401);
                        return json_encode([
                            'status'=>401 ,
                            'message' =>'Codigo de validacion incorrecto'
                        ]);
                    }else{//Si es igual , actulizamos el estado de validacion a true
                        $stmt = $conn ->prepare("UPDATE USUARIOS SET VALIDACION = 1 WHERE CORREO_ELECTRONICO = ?");
                        $stmt -> bind_param('s' , $email);
                        $stmt->execute();
                        http_response_code(200);
                        return json_encode([
                            'status'=>200 ,
                            'message' =>'Codigo de validacion correcto'
                        ]);
                    }
                }
            }
        }
    }
    public function enviarCodigo($email , $codigo){
        $mail = new PHPMailer(true);
        try{
            //configuracion del servidor SMTP de gmail
            $mail->isSMTP();
            $mail->Host = 'smtp.gmail.com';
            $mail->SMTPAuth = true ; 
            $mail->Username = 'gamehub.webapp@gmail.com';
            $mail->Password = 'khajrtqsmdugjojg';
            $mail->SMTPSecure = PHPMailer :: ENCRYPTION_STARTTLS;
            $mail->Port = 587 ; 
            //Configuaracion del envio de email
            $mail->setFrom('gamehub.webapp@gmail.com' , 'Gamehub');
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
                'status'=>200 ,
                'message' =>'Usuario registrado con exito'
            ]);
        }catch(Exception $e){ 
            http_response_code(500);
            return json_encode([
                'status'=>500 ,
                'message' =>'Error al enviar el correo electronico : ' . $mail->ErrorInfo
            ]);
        }
    }

}