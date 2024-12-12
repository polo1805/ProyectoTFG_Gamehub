<?
require_once('./config/conexionBBDD.php');
require_once('./services.php');


$service = new Services();
$credencialesSMTP = new credenciales_SMTP;
$request = trim($_SERVER['REQUEST_URI'] , '/');
header('Content-Type: application/json');
if($_SERVER['REQUEST_METHOD']==='GET'){
    switch($request){
        case 'status':
            echo $service->status();
        break;
        default:
            http_response_code(404);
            echo json_encode([
                'status'=>404 , 
                'message'=>"Llamada a la API erronea"
            ]);
    }
    
}
if($_SERVER['REQUEST_METHOD']==='POST'){
    switch($request){
        case 'registrarUsuario':
            echo $service->registrarUsuario();
        break;
        case 'comprobarUsuario':
            echo $service->comprobarUsuario();
        break;
        case 'validarCodigo':
            echo $service->validarCodigo();
        break;
        default:
            http_response_code(404);
            echo json_encode([
                'status'=>404 , 
                'message'=>"Llamada a la API erronea"
            ]);
    }
    
}


