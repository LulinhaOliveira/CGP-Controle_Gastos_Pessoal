import * as yup from "yup";
import moment from "moment";
import prisma from "@prisma/client";

const prismaClient = new prisma.PrismaClient();

class ContasController {
  async getAll(request, response) {
    const { id_categoria } = request.body;

    await prismaClient.contas
      .findMany({
        where: {
          id_categoria,
        },
      })
      .then((results) => response.status(200).send({ Busca: true, results }))
      .catch((err) => response.status(400).send({ Busca: false, error: err }));
  }

  //Fazer Controle de Acesso
  async getOne(request, response) {
    const { id } = request.params;

    await prismaClient.contas
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

    const contas = await prismaClient.contas
      .findUnique({
        where: {
          id,
        },
      })
      .then(async (results) => {
        await prismaClient.contas
          .delete({
            where: {
              id,
            },
          })
          .then(async () => {
            await prismaClient.categorias
              .update({
                where: {
                  id: contas.id_categoria,
                },
                data: {
                  valor_atual: valor_atual - contas.valor_total,
                },
              })
              .then((results) => response.status(200).send({ remove: true }))
              .catch((err) =>
                response.status(400).send({ remove: false, err })
              );
          })
          .catch((err) => response.status(400).send({ remove: false, err }));
      })
      .catch((err) => response.status(400).send({ remove: false, err }));
  }

  async store(request, response) {
    const { dat_vencimento, id_categoria, desc, valor } = request.body;

    const schema = yup.object().shape({
      valor: yup.number("O valor deve ser numero"),
      desc: yup.string("A descrição deve ser uma String"),
    });

    await schema
      .validate({ valor_total, num_parcelas, desc })
      .then(async () => {
        let dat_vencimento_parse;

        if (dat_vencimento) {
          if (moment(dat_vencimento, "DD MM YYYY").isValid()) {
            dat_vencimento_parse = new Date(
              moment(dat_vencimento, "DD MM YYYY")
            );
          } else {
            return response
              .status(400)
              .send({ Error: "Insira uma Data Valida" });
          }
        }

        const category = {
          connect: {
            id: id_categoria,
          },
        };

        await prismaClient.contas
          .create({
            data: {
              dat_vencimento,
              author: category,
              valor,
              desc,
            },
          })
          .then(async () => {
            await prismaClient.categorias
              .findUnique({
                where: {
                  id: id_categoria,
                },
              })
              .then(async (results) => {
                await prismaClient.categorias
                  .update({
                    where: {
                      id: id_categoria,
                    },
                    data: {
                      valor_atual: results.valor_atual + valor,
                    },
                  })
                  .then((results) => response.send({ results, Criado: true }))
                  .catch((err) =>
                    response.status(400).send({ Error: err.errors })
                  );
              })
              .catch((err) => response.status(400).send({ Error: err.errors }));
          })
          .catch((err) => response.status(400).send({ Error: err.errors }));
      })
      .catch((err) => response.status(400).send({ Error: err.errors }));
  }
}

export default ContasController;
