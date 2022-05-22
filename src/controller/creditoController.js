import * as yup from "yup";
import moment from "moment";
import prisma from "@prisma/client";
const prismaClient = new prisma.PrismaClient();

class CreditoController {
  async getAll(request, response) {
    const { id_categoria } = request.body;
    console.log(id_categoria);
    await prismaClient.creditos
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

    await prismaClient.creditos
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
    let valor;
    let valor_parcela;
    let id_cartao;

    await prismaClient.creditos
      .findUnique({
        where: {
          id,
        },
      })
      .then(async (results) => {
        await prismaClient.creditos
          .delete({
            where: {
              id,
            },
          })
          .then(async (results) => {
            valor = results.valor_total;
            valor_parcela = results.valor_parcela;
            id_cartao = results.id_cartao;
            await prismaClient.categorias
              .findUnique({
                where: {
                  id: results.id_categoria,
                },
              })
              .then(async (results) => {
                await prismaClient.categorias
                  .update({
                    where: {
                      id: results.id,
                    },
                    data: {
                      valor_atual: results.valor_atual - valor,
                    },
                  })
                  .then(async () => {
                    await prismaClient.cartao
                      .findUnique({
                        where: {
                          id: id_cartao,
                        },
                      })
                      .then(async (results) => {
                        console.log(results);
                        await prismaClient.cartao
                          .update({
                            where: {
                              id: results.id,
                            },
                            data: {
                              saldo_parcelado:
                                results.saldo_parcelado - valor_parcela,
                            },
                          })
                          .then((results) =>
                            response.status(200).send({ remove: true })
                          )
                          .catch((err) =>
                            response.status(400).send({ remove: false, err })
                          );
                      })
                      .catch((err) =>
                        response.status(400).send({ remove: false, err })
                      );
                  })
                  .catch((err) =>
                    response.status(400).send({ remove: false, err })
                  );
              })
              .catch((err) =>
                response.status(400).send({ remove: false, err })
              );
          })
          .catch((err) => response.status(400).send({ remove: false, err }));
      })
      .catch((err) => response.status(400).send({ remove: false, err }));
  }

  async store(request, response) {
    const { valor_total, num_parcelas, desc, id_categoria, id_cartao } =
      request.body;
    const valor_parcela = valor_total / num_parcelas;
    let categoria;

    const schema = yup.object().shape({
      valor_total: yup.number("O nome deve ser numero"),
      num_parcelas: yup.number("O valor deve ser um numero"),
      desc: yup.string("A descrição dev  e ser uma String"),
    });

    console.log(valor_total, num_parcelas, desc);
    await schema
      .validate({ valor_total, num_parcelas, desc })
      .then(async () => {
        const categoriaAux = {
          connect: {
            id: id_categoria,
          },
        };
        const cartaoAux = {
          connect: {
            id: id_cartao,
          },
        };

        await prismaClient.creditos
          .create({
            data: {
              valor_total,
              num_parcelas,
              valor_parcela,
              desc,
              author: categoriaAux,
              author2: cartaoAux,
            },
          })
          .then(async (results) => {
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
                      valor_atual: results.valor_atual + valor_total,
                    },
                  })
                  .then(async (results) => {
                    await prismaClient.cartao
                      .findUnique({
                        where: {
                          id: id_cartao,
                        },
                      })
                      .then(async (results) => {
                        await prismaClient.cartao
                          .update({
                            where: {
                              id: id_cartao,
                            },
                            data: {
                              saldo_parcelado:
                                results.saldo_parcelado + valor_parcela,
                            },
                          })
                          .then((results) =>
                            response.send({ CreditoCriado: true })
                          )
                          .catch((err) =>
                            response.status(400).send({ Error: err.errors })
                          );
                      })
                      .catch((err) =>
                        response.status(400).send({ Error: err.errors })
                      );
                  })
                  .catch((err) =>
                    response.status(400).send({ Error: err.errors })
                  );
              })
              .catch((err) => response.status(400).send({ Error: err.errors }));
          })
          .catch((err) => response.status(400).send({ Error: err.errors }));
      })
      .catch((err) =>
        response.status(400).send({ Credito_Criado: false, error: err.message })
      );
  }
}

export default CreditoController;
