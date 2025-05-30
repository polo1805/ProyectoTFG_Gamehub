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
    private $port;

        //Constructor de la clase que inicializa los parametros de conexion 
    public function __construct(){
        $this->host = $_ENV['DB_HOST'] ; 
        $this->user = $_ENV['DB_USER'] ;
        $this->pass = $_ENV['DB_PASSWORD'];
        $this->dbname = $_ENV['DB_NAME'];
    }
        //Metodo que realiza la conexion a la base de datos 
public function conectarBBDD(){
        $host_name = 'db5017923875.hosting-data.io';
        $database = 'dbs14268221';
        $user_name = 'dbu5685385';
        $password = 'Poloo1805';

        $link = new mysqli($host_name, $user_name, $password, $database);

        if ($link->connect_error) {
            die('<p>Error al conectar con servidor MySQL: '. $link->connect_error .'</p>');
        } else {
            return $link;
        }
    }
}