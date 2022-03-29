import jsonwebtoken from "jsonwebtoken";

const {JWT_SECRET} = process.env;

const ControlAcessMiddleware = (request, response, next) =>{

    if(request.url === '/cgp/login' || (request.url === '/cgp/users' && request.method === 'POST')
     || (request.url === 'cpg/categorias' && request.method === 'POST')){
        return next();
    }


    const {loggedUser} = request;
    let id = String(request.url).split("/");
    id = id [id.length - 1];
    

    if(id === loggedUser.id){
        return next();
    }else{
    
        return response.status(401).send({Messagem : "Esse dado não é seu"});
    }

    

}

export default ControlAcessMiddleware;