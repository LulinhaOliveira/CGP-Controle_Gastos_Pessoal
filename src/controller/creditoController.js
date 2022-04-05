import * as yup from "yup";
import moment from "moment";
import prisma from '@prisma/client';
const prismaClient = new prisma.PrismaClient();

class CreditoController {
    async getAll(request, response){ 
        const {id_categoria} = request.body;
        console.log(id_categoria)
        await prismaClient.credito.findMany({
            where: {
                id_categoria 
            }
        }).then((results) => response.status(200).send({Busca : true , results})
        ).catch((err)=>response.status(400).send({Busca : false, error : err} ))
    }
    
    //Fazer Controle de Acesso
    async getOne(request, response){
        const {id} = request.params;

        await prismaClient.credito.findUnique(
            {where : {
                id 
            }
        }).then((results) => response.status(200).send({Busca : true , results})
        ).catch((err) => response.status(400).send({Busca : false , err}))
    }
   
    //Fazer Controle de Acesso
    async remove(request, response){
        const {id} = request.params;

            const credito = await prismaClient.credito.findUnique({
                where:{
                    id
                }
            }).then(async (results) => {
                await prismaClient.credito.delete({
                    where:{
                        id
                    } 
                }).then(() => {
                    await prismaClient.categorias.update({
                        where : {
                            id : credito.id_categoria
                        },
                        data : {
                            valor_atual : valor_atual - credito.valor_total
                        }
                    }).then(()=>{
                        await prismaClient.cartao.update({
                            where : {
                                id : credito.id_cartao
                            },
                            data : {
                                saldo_parcelado : saldo_parcelado - credito.valor_parcela
                            }
                        }).then((results) => response.status(200).send({remove : true })
                        ).catch((err) => response.status(400).send({remove : false , err}))
                    }).catch((err) => response.status(400).send({remove : false , err}))
                }).catch((err) => response.status(400).send({remove : false , err}))
            }).catch((err) => response.status(400).send({remove : false , err}))
    }

    async store(request, response) {
        const { valor_total , num_parcelas , desc, id_categoria, id_cartao } = request.body;
        const valor_parcela =  valor_total/num_parcelas;
        let categoria;
        
        const schema = yup.object().shape({
            valor_total : yup.number("O nome deve ser numero"),
            num_parcelas : yup.number("O valor deve ser um numero"),
            desc : yup.string("A descrição dev  e ser uma String"),
 })
        
        await schema.validate({valor_total, num_parcelas, desc})
        .then( async ()=>{
                
        const categoriaAux = {
            connect : {
                id: id_categoria
            }
        }   
        const cartaoAux = {
            connect :{
                id: id_cartao
            }
        }

        await prismaClient.credito.create({
            data :{
                valor_total,
                num_parcelas,
                valor_parcela,
                desc,
                author : categoriaAux,
                author2 : cartaoAux
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
                        valor_atual : results.valor_atual + valor_total
                    }   
                }).then( async (results) => {
                    await prismaClient.cartao.findUnique(
                        {where : {
                            id : id_cartao
                        }
                }).then( async (results) => {
                    await prismaClient.cartao.update({
                        where:{
                            id : id_cartao
                        },
                        data:{
                            saldo_parcelado : results.saldo_parcelado + valor_parcela
                        } 
                        }).then((results)=> response.send({CreditoCriado : true})
                        ).catch((err)=>response.status(400).send({Error: err.errors}))
                    }).catch((err)=>response.status(400).send({Error: err.errors}))
                }).catch((err)=>response.status(400).send({Error: err.errors}))
            }).catch((err)=>response.status(400).send({Error: err.errors}))
        }).catch((err)=>response.status(400).send({Error: err.errors}))
        }).catch((err)=> response.status(400).send({categoria_Cridada : false, error: err.message }))

     
    }   
}

export default CreditoController;