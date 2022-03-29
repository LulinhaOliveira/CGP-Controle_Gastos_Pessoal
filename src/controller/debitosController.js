import * as yup from "yup";
import moment from "moment";
import prisma from '@prisma/client';
const prismaClient = new prisma.PrismaClient();

class DebitosController {
    async getAll(request, response){
        const {id_categoria} = request.body;
        console.log(id_categoria)
        await prismaClient.debitos.findMany({
            where: {
                id_categoria 
            }
        }).then((results) => response.status(200).send({Busca : true , results})
        ).catch((err)=>response.status(400).send({Busca : false, error : err} ))
    }
    
    //Fazer Controle de Acesso
    async getOne(request, response){
        const {id} = request.params;

        await prismaClient.debitos.findUnique(
            {where : {
                id 
            }
        }).then((results) => response.status(200).send({Busca : true , results})
        ).catch((err) => response.status(200).send({Busca : false , err}))
    }
   
    //Fazer Controle de Acesso
    async remove(request, response){
        const {id} = request.params;

        await prismaClient.debitos.delete({
            where:{
                id
            }
        }).then((results) => response.status(200).send({remove : true })//Diminuir Valor da Categoria
        ).catch((err) => response.status(200).send({remove : false , err}))
    }

    async store(request, response) {
        const { valor , desc , id_categoria } = request.body;
        let categoria;
        const categoriaAux = {
            connect : {
                id: id_categoria
            }
        }   

        await prismaClient.debitos.create({
            data :{
                valor,
                desc,
                author : categoriaAux
            }
        }).then( async (results)=> {
             await prismaClient.categorias.findUnique(
                {where : {
                    id : id_categoria
                }
            }).then( async (results) => {
                
                await prismaClient.categorias.update({
                    where:{
                        id : id_categoria
                    },
                    data:{
                        valor_atual : results.valor_atual + valor
                    }   
                }).then((results) => response.send({results , Criado : true}))
            })
        })
        
    
    }     
      
}

export default DebitosController;