<?
require __DIR__ . '/../vendor/autoload.php';//Cargamos el composer

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ .'/..');
$dotenv->load();
Class ConexionBBDD{
        //Se definen los parametros que se utilizaran para realizar la conexion 
    private $host; 
    private $user;
    private $pass;
    private $dbname;
    private $conexion ; 
    public function __construct(){
        $this->host = $_ENV['DB_HOST'] ; 
        $this->user = $_ENV['DB_USER'] ;
        $this->pass = $_ENV['DB_PASSWORD'];
        $this->dbname = $_ENV['DB_NAME'];
    }
        //Metodo que realiza la conexion a la base de datos 
public function conectarBBDD(){
    $this->conexion = new mysqli(
        $this->host , 
        $this->user , 
        $this->pass , 
        $this->dbname , 
        );
        if($this->conexion->connect_error){
            http_response_code(500);
            echo json_encode([
                'status'=>'500' , 
                'message'=> 'Internal Server Error'
            ]);
        }else{
            return $this->conexion;
        }
    }
}