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
      .catch((err) =>
        response.status(400).send({ Error: err, Messagem: "Requisição Falhou" })
      );
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
      .catch((err) =>
        response.status(400).send({ Error: err, Messagem: "Requisição Falhou" })
      );
  }

  //Fazer Controle de Acesso
  async remove(request, response) {
    const { id } = request.params;
    let valor_planejado;
    await prismaClient.categorias
      .delete({
        where: {
          id,
        },
      })
      .then(async (results) => {
        valor_planejado = results.valor_planejado;
        await prismaClient.user
          .findUnique({
            where: {
              id: request.loggedUser.id,
            },
          })
          .then(async (results) => {
            await prismaClient.user
              .update({
                where: {
                  id: request.loggedUser.id,
                },
                data: {
                  saldo_resto: valor_planejado + results.saldo_resto,
                },
              })
              .then(() =>
                response.status(200).send({ Remove: true, Messagem: "Sucesso" })
              )
              .catch((err) =>
                response
                  .status(400)
                  .send({ Error: err, Messagem: "Requisição Falhou" })
              );
          })
          .catch((err) =>
            response
              .status(400)
              .send({ Error: err, Messagem: "Requisição Falhou" })
          );
      })
      .catch((err) =>
        response.status(400).send({ Error: err, Messagem: "Requisição Falhou" })
      );
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
        .oneOf(["debitos", "creditos", "contas"])
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
            await prismaClient.user
              .findUnique({
                where: {
                  id: request.loggedUser.id,
                },
              })
              .then(async (results) => {
                await prismaClient.user
                  .update({
                    where: {
                      id: results.id,
                    },
                    data: {
                      saldo_resto: results.saldo_resto - valor_planejado,
                    },
                  })
                  .then(() => {
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
                      .send({ Error: err, Messagem: "Requisição Falhou" })
                  );
              })
              .catch((err) =>
                response
                  .status(400)
                  .send({ Error: err, Messagem: "Requisição Falhou" })
              );
          })
          .catch((err) => response.status(400).send({ Error: err }));
      })
      .catch((err) =>
        response.status(400).send({ Error: err, Messagem: "Requisição Falhou" })
      );
  }

  async uptadeAll(request, response) {
    const { id } = request.params;
    const { nome, desc, valor_planejado } = request.body;
    let old_valor_planejado;

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
          .findUnique({
            where: {
              id,
            },
          })
          .then(async (results) => {
            old_valor_planejado = results.valor_planejado;
            await prismaClient.categorias
              .update({
                where: { id },
                data: {
                  nome,
                  valor_planejado,
                  desc,
                },
              })
              .then(async (results) => {
                await prismaClient.user
                  .findUnique({ where: { id: request.loggedUser.id } })
                  .then(async (results) => {
                    console.log(results);
                    await prismaClient.user
                      .update({
                        where: { id: results.id },
                        data: {
                          saldo_resto:
                            results.saldo_resto +
                            (old_valor_planejado - valor_planejado),
                        },
                      })
                      .then(() =>
                        response
                          .status(200)
                          .send({ Messagem: "Dados Atualizado" })
                      )
                      .catch((err) =>
                        response
                          .status(400)
                          .send({ Error: err, Messagem: "Requisição Falhou" })
                      );
                  })
                  .catch((err) =>
                    response
                      .status(400)
                      .send({ Error: err, Messagem: "Requisição Falhou" })
                  );
              })
              .catch((err) =>
                response
                  .status(400)
                  .send({ Error: err, Messagem: "Requisição Falhou" })
              );
          })
          .catch((err) => response.status(400).send({ Error: err.errors }));
      })
      .catch((err) => response.status(400).send({ Error: err.errors }));
  }
}

export default CategoriasController;
