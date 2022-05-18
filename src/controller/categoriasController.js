import * as yup from "yup";
import moment from "moment";
import prisma from "@prisma/client";

const prismaClient = new prisma.PrismaClient();

class CategoriasController {
  async getAll(request, response) {
    let { dat_prev, dat_pos } = request.params;

    dat_prev = new Date(dat_prev);
    dat_pos = new Date(dat_pos);

    await prismaClient.categorias
      .findMany({
        where: {
          id_user: request.loggedUser.id,
        },
        include: {
          Contas: {
            where: {
              dat_hora: {
                gte: dat_prev,
                lt: dat_pos,
              },
            },
          },
          Creditos: {
            where: {
              dat_hota: {
                gte: dat_prev,
                lt: dat_pos,
              },
            },
          },
          Debitos: {
            where: {
              dat_hora: {
                gte: dat_prev,
                lt: dat_pos,
              },
            },
          },
        },
      })
      .then((results) => response.status(200).send({ Busca: true, results }))
      .catch((err) => response.status(400).send({ Busca: false, error: err }));
  }

  //Fazer Controle de Acesso
  async getOne(request, response) {
    const { id } = request.params;

    await prismaClient.categorias
      .findUnique({
        where: {
          id,
        },
      })
      .then((results) => response.status(200).send({ Busca: true, results }))
      .catch((err) => response.status(400).send({ Busca: false, err }));
  }

  //Fazer Controle de Acesso
  async remove(request, response) {
    const { id } = request.params;

    await prismaClient.categorias
      .delete({
        where: {
          id,
        },
      })
      .then((results) => response.status(200).send({ remove: true }))
      .catch((err) => response.status(400).send({ remove: false, err }));
  }

  async store(request, response) {
    const { nome, desc, valor_planejado, tipo } = request.body;

    const schema = yup.object().shape({
      nome: yup
        .string("O nome deve ser String")
        .required("O nome é obrigatório."),
      valor_planejado: yup
        .number("O valor deve ser um numero")
        .required("O valor é obrigatório"),
      desc: yup.string("A descrição dev  e ser uma String"),
      tipo: yup
        .mixed()
        .oneOf(["debitos", "credito", "contas"])
        .required("Tipo deve Ser Obrigatorio"),
    });

    await schema
      .validate({ nome, valor_planejado, tipo, desc })
      .then(async () => {
        const user = {
          connect: {
            id: request.loggedUser.id,
          },
        };

        await prismaClient.categorias
          .create({
            data: {
              nome,
              desc,
              valor_planejado,
              tipo,
              author: user,
            },
          })
          .then(async () => {
            const result = await prismaClient.user.findUnique({
              where: {
                id: request.loggedUser.id,
              },
            });
            await prismaClient.user.update({
              where: {
                id: request.loggedUser.id,
              },
              data: {
                saldo_resto: result.saldo_resto - valor_planejado,
              },
            });

            response.status(200).send({
              Categoria_Criada: true,
              nome,
              valor_planejado,
              desc,
              tipo,
            });
          })
          .catch((err) =>
            response
              .status(400)
              .send({ Categoria_Cridada: false, error: err.message })
          );
      })
      .catch((err) =>
        response
          .status(400)
          .send({ categoria_Cridada: false, error: err.message })
      );
  }

  async uptadeAll(request, response) {
    const { id } = request.params;
    const { nome, desc, valor_planejado } = request.body;

    const schema = yup.object().shape({
      nome: yup
        .string("O nome deve ser uma string")
        .min(1, "O nome não pode ser Vazio"),
      valor_planejado: yup.number("O valor deve ser um numero"),
      desc: yup.string("A descrição dev  e ser uma String"),
    });

    await schema
      .validate({ nome, valor_planejado, desc })
      .then(async () => {
        await prismaClient.categorias
          .update({
            where: { id },
            data: {
              nome,
              valor_planejado,
              desc,
            },
          })
          .then(() =>
            response.status(200).send({ Messagem: "Dados Atualizado" })
          )
          .catch((err) => response.status(400).send({ Error: err }));
      })
      .catch((err) => response.status(400).send({ Error: err.errors }));
  }
}

export default CategoriasController;
