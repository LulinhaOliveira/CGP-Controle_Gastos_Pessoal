import prisma from "@prisma/client";
const prismaClient = new prisma.PrismaClient();
import jsonwebtoken from "jsonwebtoken";

const { JWT_SECRET } = process.env;

const ControlAcessMiddleware = (request, response, next) => {
  const { loggedUser } = request;

  if (
    request.url === "/cgp/login" ||
    (request.url === "/cgp/users" && request.method === "POST") ||
    (request.url === "/cgp/categorias" && request.method === "POST") ||
    (request.url === "/cgp/cartoes" && request.method === "POST") ||
    (request.url === "/cgp/users" && request.method === "GET")
  ) {
    return next();
  }

  let param = String(request.url).split("/");
  let paramRota = param[2];
  let paramId = param[3];

  if (paramRota === "categorias") {
    if (paramId !== undefined) {
      (async () => {
        await prismaClient.categorias
          .findUnique({
            where: { id: paramId },
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
  } else if (paramRota === "users") {
    let id = String(request.url).split("/");
    id = id[id.length - 1];

    if (id === loggedUser.id) {
      return next();
    } else {
      return response.status(401).send({ Messagem: "Esse dado não é seu" });
    }
  } else if (paramRota === "cartoes") {
    if (paramId !== undefined) {
      (async () => {
        await prismaClient.cartao
          .findUnique({
            where: { id: paramId },
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
      if (paramId !== undefined) {
        (async () => {
          await prismaClient.credito
            .findUnique({
              where: { id: paramId },
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
            console.log(loggedUser.id);
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
            where: { id: paramId },
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
  } else if (paramRota === "contas") {
    if (request.method === "POST") {
      (async () => {
        await prismaClient.categorias
          .findUnique({
            where: { id: request.body.id_categoria },
          })
          .then((results) => {
            console.log(loggedUser.id);
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
            where: { id: paramId },
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
