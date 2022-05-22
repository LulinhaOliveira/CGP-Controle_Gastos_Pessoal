import prisma from "@prisma/client";
const prismaClient = new prisma.PrismaClient();
import jsonwebtoken from "jsonwebtoken";

const { JWT_SECRET } = process.env;

const ControlAcessMiddleware = (request, response, next) => {
  const { loggedUser } = request;
  if (
    request.url === "/cgp/login" ||
    request.url === "/cgp/users" ||
    (request.url === "/cgp/categorias" && request.method === "POST") ||
    (request.url === "/cgp/cartoes" && request.method === "POST") ||
    (request.url === "/cgp/users" && request.method === "GET") ||
    (request.url === "/cgp/usersData" && request.method === "GET") ||
    (request.url === "/cgp/users" && request.method === "PUT") ||
    request.url === "/cgp/users/saldo_mensal"
  ) {
    return next();
  }

  let param = String(request.url).split("/");
  let paramRota = param[2];
  let param1 = param[3];
  let param2 = param[4];
  if (paramRota === "categorias") {
    if (param1 !== undefined) {
      if (param2 === undefined) {
        (async () => {
          await prismaClient.categorias
            .findUnique({
              where: { id: param1 },
            })
            .then((results) => {
              if (results) {
                if (results.id_user === loggedUser.id) {
                  return next();
                } else {
                  return response
                    .status(401)
                    .send({ Messagem: "Esse dado não é seu" });
                }
              } else {
                return response
                  .status(400)
                  .send({ Messagem: "Categoria não existe" });
              }
            })
            .catch((err) => {
              return response.status(400).send({ Messagem: err });
            });
        })();
      } else {
        return next();
      }
    } else {
      return next();
    }
  } else if (paramRota === "users") {
    let id = String(request.url).split("/");
    id = id[id.length - 1];

    if (id === loggedUser.id) {
      return next();
    } else {
      return response.status(401).send({ Messagem: "Esse dado não é seu" });
    }
  } else if (paramRota === "cartoes") {
    if (param1 !== undefined) {
      (async () => {
        await prismaClient.cartao
          .findUnique({
            where: { id: param1 },
          })
          .then((results) => {
            if (results.id_user === loggedUser.id) {
              return next();
            } else {
              return response
                .status(401)
                .send({ Messagem: "Esse dado não é seu" });
            }
          })
          .catch((err) => {
            return response.status(400).send({ Messagem: err });
          });
      })();
    } else {
      return next();
    }
  } else if (paramRota === "credito") {
    if (request.method === "POST") {
      let id_categoria_user;
      (async () => {
        await prismaClient.categorias
          .findUnique({
            where: { id: request.body.id_categoria },
          })
          .then(async (results) => {
            id_categoria_user = results.id_user;
            await prismaClient.cartao
              .findUnique({
                where: { id: request.body.id_cartao },
              })
              .then((results) => {
                if (
                  results.id_user === loggedUser.id &&
                  id_categoria_user === loggedUser.id
                ) {
                  return next();
                } else {
                  return response
                    .status(401)
                    .send({ Messagem: "Esse dado não é seu" });
                }
              })
              .catch((err) => {
                return response.status(400).send({ Messagem: err });
              });
          })
          .catch((err) => {
            return response.status(400).send({ Messagem: err });
          });
      })();
    } else {
      if (param1 !== undefined) {
        (async () => {
          await prismaClient.creditos
            .findUnique({
              where: { id: param1 },
            })
            .then(async (results) => {
              await prismaClient.categorias
                .findUnique({
                  where: { id: results.id_categoria },
                })
                .then((results) => {
                  if (results.id_user === loggedUser.id) {
                    return next();
                  } else {
                    return response
                      .status(401)
                      .send({ Messagem: "Esse dado não é seu" });
                  }
                })
                .catch((err) => {
                  return response.status(400).send({ Messagem: err });
                });
            })
            .catch((err) => {
              return response.status(400).send({ Messagem: err });
            });
        })();
      } else {
        return next();
      }
    }
  } else if (paramRota === "debito") {
    if (request.method === "POST") {
      (async () => {
        await prismaClient.categorias
          .findUnique({
            where: { id: request.body.id_categoria },
          })
          .then((results) => {
            if (results.id_user === loggedUser.id) {
              return next();
            } else {
              return response
                .status(401)
                .send({ Messagem: "Esse dado não é seu" });
            }
          })
          .catch((err) => {
            return response.status(400).send({ Messagem: err });
          });
      })();
    } else {
      (async () => {
        await prismaClient.debitos
          .findUnique({
            where: { id: param1 },
          })
          .then(async (results) => {
            await prismaClient.categorias
              .findUnique({
                where: { id: results.id_categoria },
              })
              .then((results) => {
                if (results.id_user === loggedUser.id) {
                  return next();
                } else {
                  return response
                    .status(401)
                    .send({ Messagem: "Esse dado não é seu" });
                }
              })
              .catch((err) => {
                return response.status(400).send({ Messagem: "aqui" });
              });
          })
          .catch((err) => {
            return response.status(400).send({ Messagem: "acola" });
          });
      })();
    }
  } else if (paramRota === "contas") {
    if (request.method === "POST") {
      (async () => {
        await prismaClient.categorias
          .findUnique({
            where: { id: request.body.id_categoria },
          })
          .then((results) => {
            if (results.id_user === loggedUser.id) {
              return next();
            } else {
              return response
                .status(401)
                .send({ Messagem: "Esse dado não é seu" });
            }
          })
          .catch((err) => {
            return response.status(400).send({ Messagem: err });
          });
      })();
    } else {
      (async () => {
        await prismaClient.contas
          .findUnique({
            where: { id: param1 },
          })
          .then(async (results) => {
            await prismaClient.categorias
              .findUnique({
                where: { id: results.id_categoria },
              })
              .then((results) => {
                if (results.id_user === loggedUser.id) {
                  return next();
                } else {
                  return response
                    .status(401)
                    .send({ Messagem: "Esse dado não é seu" });
                }
              })
              .catch((err) => {
                return response.status(400).send({ Messagem: err });
              });
          })
          .catch((err) => {
            return response.status(400).send({ Messagem: err });
          });
      })();
    }
  } else {
    return response.send({ Rota: Desconhecida });
  }
};

export default ControlAcessMiddleware;
