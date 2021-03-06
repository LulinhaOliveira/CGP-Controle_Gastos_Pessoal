import * as yup from "yup";
import moment from "moment";
import prisma from "@prisma/client";
const prismaClient = new prisma.PrismaClient();

class DebitosController {
  async getAll(request, response) {
    const { id_categoria } = request.body;

    await prismaClient.debitos
      .findMany({
        where: {
          id_categoria,
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

    await prismaClient.debitos
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
    let valor;
    await prismaClient.debitos
      .findUnique({
        where: {
          id,
        },
      })
      .then(async (results) => {
        await prismaClient.debitos
          .delete({
            where: {
              id,
            },
          })
          .then(async (results) => {
            valor = results.valor;
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
                  .then((results) =>
                    response
                      .status(200)
                      .send({ Remove: true, Messagem: "Sucesso" })
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
      .catch((err) =>
        response.status(400).send({ Error: err, Messagem: "Requisição Falhou" })
      );
  }

  async store(request, response) {
    const { valor, desc, id_categoria } = request.body;
    let categoria;

    const schema = yup.object().shape({
      valor: yup.number("O valor deve ser numero"),
      desc: yup.string("A descrição deve ser uma String"),
    });

    await schema
      .validate({ valor, desc })
      .then(async () => {
        const categoriaAux = {
          connect: {
            id: id_categoria,
          },
        };

        await prismaClient.debitos
          .create({
            data: {
              valor,
              desc,
              author: categoriaAux,
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
      .catch((err) =>
        response.status(400).sen({ Error: err, Messagem: "Requisição Falhou" })
      );
  }
}

export default DebitosController;
