import * as yup from "yup";
import moment from "moment";
import prisma from '@prisma/client';
const prismaClient = new prisma.PrismaClient();

class CategoriasController {

    async getAll(request, response){

        await prismaClient.categorias.findMany({
            where: {
                id_user : request.loggedUser.id
            }
        }).then((results) => response.status(200).send({Busca : true , results})
        ).catch((err)=>response.status(200).send({Busca : false, error : err} ))

    }

    //Fazer Controle de Acesso
    async getOne(request, response){
        const {id} = request.params;

        await prismaClient.categorias.findUnique(
            {where : {
                id 
            }
        }).then((results) => response.status(200).send({Busca : true , results})
        ).catch((err) => response.status(200).send({Busca : false , err}))
    }
    
    //Fazer Controle de Acesso
    async remove(request, response){
        const {id} = request.params;

        await prismaClient.categorias.delete({
            where:{
                id
            }
        }).then((results) => response.status(200).send({remove : true })
        ).catch((err) => response.status(200).send({remove : false , err}))
    }

    async store(request, response){
        const { nome, desc, valor_planejado, tipo} = request.body;
        const user = {
            connect : {
                id : request.loggedUser.id
            }
        }   

        await prismaClient.categorias.create({
            data : {
                nome,
                desc,
                valor_planejado,
                tipo,
                author : user
            }
        }).then(()=> response.status(200).send({Categoria_Criada : true , nome, valor_planejado, desc, tipo})
        ).catch((err)=> response.status(400).send({Categoria_Cridada : false, error: err.message }))

    }

    //Falta o Update
}

export default CategoriasController;