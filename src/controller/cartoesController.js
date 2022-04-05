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
        ).catch((err)=>response.status(400).send({Busca : false, error : err} ))
    }
    
    //Fazer Controle de Acesso
    async getOne(request, response){
        const {id} = request.params;

        await prismaClient.cartao.findUnique(
            {where : {
                id 
            }
        }).then((results) => response.status(200).send({Busca : true , results})
        ).catch((err) => response.status(400).send({Busca : false , err}))
    }
   
    //Fazer Controle de Acesso
    async remove(request, response){
        const {id} = request.params;

        await prismaClient.cartao.delete({
            where:{
                id
            }
        }).then((results) => response.status(200).send({remove : true })
        ).catch((err) => response.status(400).send({remove : false , err}))
    
    }

    async store(request, response) {
       const { nome, dat_ven } = request.body;
       
       const schema = yup.object().shape({
        nome : yup.string("O nome deve ser uma String").required("O nome é obrigatório"),
        })

        await schema.validate({nome})
        .then(async () => {

            let dat_ven_parse;

            if(dat_ven){
                if((moment(dat_ven, "DD MM YYYY").isValid())){
                    dat_ven_parse = new Date(moment(dat_ven, "DD MM YYYY"));
                }else{
                    return response.status(400).send({Error: "Insira uma Data Valida"});
                }  
            }
       
       const user = {
            connect : {
                id : request.loggedUser.id
            }
        }   

        console.log(dat_ven_parse);
        await prismaClient.cartao.create({
            data : {
                nome,
                dat_ven : dat_ven_parse,
                author2 : user
            }
        }).then(()=> response.status(200).send({Cartao_Criado : true , nome, dat_ven})
        ).catch((err)=> response.status(400).send({Cartao_Cridada : false, error: err }))
    
    }).catch((err)=> response.status(400).send({Cartao_Cridada : false, error: err.message }))
    
}
    async uptadeAll(request, response){
        const {id} = request.params;
        const { nome, dat_ven } = request.body;
       
       const schema = yup.object().shape({
        nome : yup.string("O nome deve ser uma string").min(1 , "O nome não pode ser Vazio")
        })

        await schema.validate({nome})
        .then(async () => {

            let dat_ven_parse;

            if(dat_ven){
                if((moment(dat_ven, "DD MM YYYY").isValid())){
                    dat_ven_parse = new Date(moment(dat_ven, "DD MM YYYY"));
                }else{
                    return response.status(400).send({Error: "Insira uma Data Valida"});
                }  
            }
            await prismaClient.cartao.update({
                where : {id},
                data : {
                   nome,
                   dat_ven : dat_ven_parse
                }
            })
            .then(()=> response.status(200).send({Messagem: "Dados Atualizado"}))
            .catch((err)=> response.status(400).send({Error: err.message}));
        })
        .catch((err)=>response.status(400).send({Error: err.errors}))

    }

}

export default CartoesController;