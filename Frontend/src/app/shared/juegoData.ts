export class RegistroJuego{
    constructor(
        public NOMBRE : string | undefined |null , 
        public PORTADA : string | undefined |null, 
        public DESCRIPCION : string | undefined |null , 
        public FECHA_LANZAMIENTO : string  | undefined  |null, 
        public GENERO : string | undefined |null , 
        public CALIFICACION : number | undefined |null ,
    ){}
}