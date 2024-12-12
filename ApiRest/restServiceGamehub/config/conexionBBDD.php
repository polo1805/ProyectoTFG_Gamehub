<?
Class ConexionBBDD{
        //Se definen los parametros que se utilizaran para realizar la conexion 
    private $host = 'localhost' ; 
    private $user = 'root' ;
    private $pass = '1234';
    private $dbname = 'gamehub';
    private $conexion ; 


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

    public function cerrarConexion(){
        if($this->conexion){
            $this->conexion->close();
        }
    }
}