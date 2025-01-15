<?

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
require __DIR__ . '/vendor/autoload.php';
require_once('./config/conexionBBDD.php');
require_once('./services.php');


$service = new Services();
$request = trim($_SERVER['REQUEST_URI'] , '/');
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
//Obtenemos el token

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
    //Llamadas a la API publicas 
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
        case 'getPerfil':
            echo( $service->getPerfil());
        break;
        case 'buscarUsuarios':
            echo $service->buscarUsuarios();
        break;
        default:
            http_response_code(404);
            echo json_encode([
                'status'=>404 , 
                'message'=>"Llamada a la API erronea"
            ]);
    }
    //Llamadas a la API con verificacion de JWT
    
    
}


