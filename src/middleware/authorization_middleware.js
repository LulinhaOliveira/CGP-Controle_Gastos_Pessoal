import jsonwebtoken from "jsonwebtoken";

const { JWT_SECRET } = process.env;

const AuthorizationMiddleware = (request, response, next) => {
  const { authorization } = request.headers;

  if (
    request.url === "/cgp/login" ||
    (request.url === "/cgp/users" && request.method === "POST")
  ) {
    return next();
  }

  if (!authorization) {
    return response.status(401).json({ Messagem: "Usuario não autorizado" });
  }

  const [, token] = authorization.split(" ");

  try {
    const payload = jsonwebtoken.verify(token, JWT_SECRET);

    request.loggedUser = payload;
  } catch (err) {
    return response.status(401).json({ message: "Token Invalid" });
  }
  next();
};

export default AuthorizationMiddleware;
