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

    try {
      let user = await prismaClient.user.findUnique({
        where: { id },
        include: {
          Categorias: true,
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
      return response.status(400).send({ Messagem: "Ocorreu um Erro" });
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
    const { id } = request.params;
    const { nome, password, dat_nasc } = request.body;

    const schema = yup.object().shape({
      password: yup
        .string("A senha deve ser String")
        .min(5, "Deve ter ao menos Cinco caracteres"),
      nome: yup.string("O nome deve ser uma String").min(4),
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
              password: hashPassword(password),
              dat_nasc: dat_nasc_parse,
            },
          })
          .then(() =>
            response.status(200).send({ Messagem: "Dados Atualizado" })
          )
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
