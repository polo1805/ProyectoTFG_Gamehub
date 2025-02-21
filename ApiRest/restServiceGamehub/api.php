<?

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
require __DIR__ . '/vendor/autoload.php';
require_once('./config/conexionBBDD.php');
require_once('./services.php');


$service = new Services();
$request = trim($_SERVER['REQUEST_URI'] , '/');
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
        case 'registrarJuego':
            echo $service->registrarJuego();
        break;
        case 'buscarJuegos':
            echo $service->buscarJuegos();
        break;
        case 'verJuegos':
            echo $service->verJuegos();
        break;
        case 'subirPost':
            echo $service->subirPost();
        break; 
        case 'getPostsPerfil':
            echo $service->getPostsPerfil();
        break;
        case 'anadirLike':
            echo $service->anadirLike();
        break;
        case 'eliminarLike':
            echo $service->eliminarLike();
        break;
        case 'getLikes':
            echo $service->getLikes();
        break; 
        case 'anadirComentario':
            echo $service->anadirComentario();
        break;
        case 'getNumeroComentarios':
            echo $service->getNumeroComentarios();
        break;
        case 'eliminarPostPerfil':
            echo $service->eliminarPostPerfil();
        break; 
        case 'cargarPost':
            echo $service->cargarPost();
        break;
        case 'cargarComentarios':
            echo $service->cargarComentarios();
        break;
        case 'getUsuario':
            echo $service->getUsuario();
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


