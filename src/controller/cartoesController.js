import * as yup from "yup";
import moment from "moment";
import prisma from '@prisma/client';
const prismaClient = new prisma.PrismaClient();

class CartoesController {
    async getAll(request, response){
        
        await prismaClient.cartao.findMany({
            where: {
                id_user : request.loggedUser.id
            }
        }).then((results) => response.status(200).send({Busca : true , results})
        ).catch((err)=>response.status(200).send({Busca : false, error : err} ))
    }
    
    //Fazer Controle de Acesso
    async getOne(request, response){
        const {id} = request.params;

        await prismaClient.cartao.findUnique(
            {where : {
                id 
            }
        }).then((results) => response.status(200).send({Busca : true , results})
        ).catch((err) => response.status(200).send({Busca : false , err}))
    }
   
    //Fazer Controle de Acesso
    async remove(request, response){
        const {id} = request.params;

        await prismaClient.cartao.delete({
            where:{
                id
            }
        }).then((results) => response.status(200).send({remove : true })
        ).catch((err) => response.status(200).send({remove : false , err}))
    
    }

    async store(request, response) {
       const { nome, dat_ven } = request.body;
        const user = {
            connect : {
                id : request.loggedUser.id
            }
        }   

        await prismaClient.cartao.create({
            data : {
                nome,
                dat_ven,
                author2 : user
            }
        }).then(()=> response.status(200).send({Cartao_Criado : true , nome, dat_ven})
        ).catch((err)=> response.status(400).send({Categoria_Cridada : false, error: err.message }))

    }

    //Falta o Update

}

export default CartoesController;