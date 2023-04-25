 export const authorizationRole = (rol) => {
    return async (req, res, next) => {
      if (!req.user) {
        return res.status(401).send({ message: "No tiene autorizacion" });}
      if (req.user.user[0].roles != rol) {
        return res.status(401).send({ message: "No tiene permiso" });}
      next();
    };
  };

  