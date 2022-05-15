import * as yup from "yup";
import bcryptjs from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import moment from "moment";
import prisma from "@prisma/client";
const prismaClient = new prisma.PrismaClient();

const { JWT_SECRET } = process.env;

const hashPassword = (password) => {
  const salt = bcryptjs.genSaltSync(10);
  const hash = bcryptjs.hashSync(password, salt);

  return hash;
};

const filtroDate = () => {
  const date = new Date();
  const primeiroDia = new Date(date.getFullYear(), date.getMonth(), 1);
  primeiroDia.setHours(primeiroDia.getHours() + 20);
  primeiroDia.setMinutes(primeiroDia.getMinutes() + 59);
  primeiroDia.setSeconds(primeiroDia.getSeconds() + 59);
  const ultimoDia = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  ultimoDia.setHours(ultimoDia.getHours() + 20);
  ultimoDia.setMinutes(ultimoDia.getMinutes() + 59);
  ultimoDia.setSeconds(ultimoDia.getSeconds() + 59);
  return [primeiroDia, ultimoDia];
};

class UserController {
  async login(request, response) {
    const { email, password } = request.body;

    const user = await prismaClient.user.findUnique({ where: { email } });
    if (!user || !bcryptjs.compareSync(password, user.password)) {
      return response
        .status(404)
        .send({ Messagem: "Email e/ou Senha Invalidos" });
    }

    const token = jsonwebtoken.sign(
      {
        id: user.id,
        nome: user.nome,
      },
      JWT_SECRET
    );

    return response.status(200).send({ Messagem: "Logado", Token: token });
  }

  async getOne(request, response) {
    const { id } = request.loggedUser;
    const [primeiroDia, ultimoDia] = filtroDate();
    try {
      let user = await prismaClient.user.findUnique({
        where: { id },
        include: {
          Categorias: {
            include: {
              Contas: {
                where: {
                  dat_hora: {
                    gte: primeiroDia,
                    lt: ultimoDia,
                  },
                },
              },
              Creditos: {
                where: {
                  dat_hota: {
                    gte: primeiroDia,
                    lt: ultimoDia,
                  },
                },
              },
              Debitos: {
                where: {
                  dat_hora: {
                    gte: primeiroDia,
                    lt: ultimoDia,
                  },
                },
              },
            },
          },
          Cartoes: true,
        },
      });

      if (user) {
        user.dat_recebe = moment(user.dat_recebe).date();
        return response.send(user);
      } else {
        return response
          .status(404)
          .send({ Messagem: "Usuario Não Encontrado" });
      }
    } catch (err) {
      return response.status(400).send({ Messagem: "Ocorreu um Erro", err });
    }
    return response.status(401).send({ Messagem: "Esse dado não é seu" });
  }

  async getOneUserData(request, response) {
    const { id } = request.loggedUser;

    try {
      let user = await prismaClient.user.findUnique({
        where: { id },
      });

      if (user) {
        user.dat_recebe = moment(user.dat_recebe).date();
        delete user.dat_recebe;
        delete user.saldo_resto;
        delete user.password;

        return response.send(user);
      } else {
        return response
          .status(404)
          .send({ Messagem: "Usuario Não Encontrado" });
      }
    } catch (err) {
      return response.status(400).send({ Messagem: "Ocorreu um Erro", err });
    }
    return response.status(401).send({ Messagem: "Esse dado não é seu" });
  }

  async store(request, response) {
    const { email, password, nome, dat_nasc } = request.body;

    const schema = yup.object().shape({
      email: yup
        .string("O e-mail deve ser String")
        .required("O e-mail é obrigatório.")
        .email("O e-mail precisa ser válido."),
      password: yup
        .string("A senha deve ser String")
        .required("A senha é obrigatório")
        .min(5, "A senha deve ter ao menos Cinco caracteres"),
      nome: yup
        .string("O nome deve ser uma String")
        .required("O nome é obrigatório"),
    });

    await schema
      .validate({ email, password, nome }, { abortEarly: false })
      .then(async () => {
        let dat_nasc_parse;

        if (dat_nasc) {
          if (moment(dat_nasc, "DD MM YYYY").isValid()) {
            dat_nasc_parse = new Date(moment(dat_nasc, "DD MM YYYY"));
          } else {
            return response
              .status(400)
              .send({ Error: "Insira uma Data Valida" });
          }
        }

        await prismaClient.user
          .create({
            data: {
              email,
              password: hashPassword(password),
              nome,
              dat_nasc: dat_nasc_parse,
            },
          })
          .then(() =>
            response
              .status(201)
              .send({ Usuario_Criado: true, email: email, nome: nome })
          )
          .catch((err) =>
            response
              .status(400)
              .send({ Error: "Database Error", Messagem: err.meta.target })
          );
      })
      .catch((err) =>
        response.status(400).send({ Error: "Validação", Messagem: err.errors })
      );
  }

  async remove(request, response) {
    const { id } = request.params;

    try {
      const user = await prismaClient.user.findUnique({ where: { id } });

      if (!user) {
        response.status(404).send({ Messagem: "Usuario Não Encontrado" });
      }

      await prismaClient.user.delete({ where: { id } });
      return response.status(200).send({ Messamgem: "Usuario Deletado" });
    } catch (err) {
      return response.status(400).send({ Messagem: "Ocorreu um Erro" });
    }
  }

  //Update de Nome, Data_Nascimento e Senha
  async uptadeAll(request, response) {
    const { id } = request.loggedUser;
    const { nome, password, dat_nasc } = request.body;

    const schema = yup.object().shape({
      nome: yup.string().min(4),
      password: yup.string().min(5),
    });

    await schema
      .validate({ nome, password })
      .then(async () => {
        let dat_nasc_parse;

        if (dat_nasc) {
          if (moment(dat_nasc, "DD MM YYYY").isValid()) {
            dat_nasc_parse = new Date(moment(dat_nasc, "DD MM YYYY"));
          } else {
            return response
              .status(400)
              .send({ Error: "Insira uma Data Valida" });
          }
        }

        await prismaClient.user
          .update({
            where: { id },
            data: {
              nome,
              password: password ? hashPassword(password) : undefined,
              dat_nasc: dat_nasc_parse,
            },
          })
          .then((result) => {
            delete result.dat_recebe;
            delete result.password;
            delete result.saldo_resto;

            response.status(200).send({ Messagem: "Dados Atualizado", result });
          })
          .catch((err) => response.status(400).send({ Error: err }));
      })
      .catch((err) => response.status(400).send({ Error: err.errors }));
  }

  async updateSaldo_Mensal(request, response) {
    const { id } = request.params;
    const { saldo_mensal } = request.body;

    const schema = yup.object().shape({
      saldo_mensal: yup
        .number()
        .required("Digite um valor")
        .positive("O valor deve ser maior que 0")
        .typeError("Deve ser um numero"),
    });

    await schema
      .validate({ saldo_mensal })
      .then(async () => {
        await prismaClient.user
          .update({
            where: { id },
            data: { saldo_mensal, saldo_resto: saldo_mensal },
          })
          .then(() =>
            response.status(200).send({ Messagem: "Saldo Atualizado" })
          )
          .catch((err) => response.status(400).send({ Error: err }));
      })
      .catch((err) => response.status(400).send({ Error: err.errors }));
  }

  async updateDate_Rece(request, response) {
    const { id } = request.params;
    const { dat_recebe } = request.body;

    let dat_nasc_parse;

    if (dat_recebe) {
      if (moment(dat_recebe, "DD MM YYYY").isValid()) {
        dat_nasc_parse = new Date(moment(dat_recebe, "DD MM YYYY"));
      } else {
        return response.status(400).send("Insira uma Data Valida");
      }
    }
    await prismaClient.user
      .update({ where: { id }, data: { dat_recebe: dat_nasc_parse } })
      .then(() => response.status(200).send({ Messagem: "Data Atualizada" }))
      .catch((err) => response.status(400).send({ Error: err }));
  }
}

export default UserController;
