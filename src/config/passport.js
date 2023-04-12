import local from "passport-local";
import passport from "passport";
import userModel from "../dao/Mongoose/models/UserSchema.js";
import GitHubStrategy from "passport-github2";
import jwt from "passport-jwt";
import { roleModel } from "../dao/Mongoose/models/RoleSchema.js";

const LocarStrategy = local.Strategy;
const JWTStrategy = jwt.Strategy;
const ExtractJWT = jwt.ExtractJwt;

const initializePassword = () => {
  const cookieExtractor = (req) => {
    const token = req.cookies ? req.cookies.jwtCookie : {};
    return token;
  };

  passport
    .use(
      "jwt",
      new JWTStrategy(
        {
          jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
          secretOrKey: process.env.JWT_PRIVATE_KEY,
        },
        async (jwt_payload, done) => {
          try {
            return done(null, jwt_payload);
          } catch (error) {
            return done(error);
          }
        }
      )
    )
    .use(
      "register",
      new LocarStrategy(
        { passReqToCallback: true, usernameField: "email" },
        async (req, username, password, done) => {
          try {
            const { firstName, lastName, age, passwordConfirm, roles } =
              req.body;
            req.session.register = {
              firstName,
              lastName,
              age,
              emailRegister: username,
            };
            let user = await userModel.findOne({ email: username });
            //Comprobacion para saber si el usuario ya esta registrado
            if (user) {
              req.session.signup = true;
              req.session.email = username;
              req.session.messageErrorSignup = "El usuario ya esta registrado. Inicie sesion";
              return done(null, false);
            }

            //Verificacion de password
            if (password != passwordConfirm) {
              req.session.signup = true;
              req.session.email = "";
              req.session.messageErrorSignup =
                "La contraseña no coincide";
              return done(null, false);
            }

            //Creacion de usuario
            let newUser = {
              firstName: firstName,
              lastName: lastName,
              age: parseInt(age),
              email: username,
              password: await userModel.encryptPassword(password),
            };

            //Asignamos un rol al usuario. Por defecto sera user
            if (roles) {
              const foundRoles = await roleModel.find({
                name: { $in: roles },
              });
              newUser.roles = foundRoles.map((role) => role._id);
            } else {
              const role = await roleModel.findOne({ name: "user" });
              newUser.roles = [role._id];
            }

            //Se le asigna un carrito al usuario
            let newCart = await userModel.addCartToUser()
            newUser.cart = newCart

            //Gurdamos en la BDD
            await userModel.create(newUser);

            //Redireccion al login
            req.session.signup = false;
            req.session.email = username;
            req.session.messageNewUser = "El usuario ya esta registrado. Inicie sesion";
            return done(null, false);
          } catch (error) {
            return done(error);
          }
        }
      )
    );

  passport.serializeUser(async (user, done) => {
    if (Array.isArray(user)) {
      done(null, user[0]._id);
    } else {
      done(null, user._id);
    }
  });

  passport.deserializeUser(async (id, done) => {
    let user = await userModel.findById(id);
    done(null, user);
  });

  passport
    .use(
      "login",
      new LocarStrategy(
        { passReqToCallback: true, usernameField: "email" },
        async (req, username, password, done) => {
          try {
            let user = await userModel
              .findOne({ email: username })
              .populate("roles");
            if (user == null) {
              req.session.signup = false;
              req.session.messageErrorLogin = "El email no es valido";
              return done(null, false);
            }
            if (await userModel.comparePassword(password, user.password)) {
              //const token = await userModel.createToken(user);
              //const accessToken = generateToken(user); Consultamos JWT pero no lo usamos por ahora
              return done(null, user);
            }
            req.session.signup = false;
            req.session.email = username;
            req.session.messageNewUser = "";
            req.session.messageErrorLogin = "Contraseña incorrecta";
            return done(null, false);
          } catch (error) {
            return done(error);
          }
        }
      )
    )
    .use(
      "github",
      new GitHubStrategy(
        {
          clientID: process.env.CLIENT_ID,
          clientSecret: process.env.CLIENT_SECRET,
          scope: ["user:email"],
          calbackURL: process.env.CALLBACK_URLL,
          passReqToCallback: true,
        },
        async (req, accessToken, refreshToken, profile, done) => {
          try {
            let userGithub = await userModel.findOne({
              email: profile.emails[0].value,
            });
            if (userGithub) {
              return done(null, userGithub);
            } else {
              const role = await roleModel.findOne({ name: "user" });
              let newUser = await userModel.create({
                firstName: profile._json.name,
                lastName: "", 
                age: 18, 
                email: profile.emails[0].value,
                password: "", 
                roles: [role._id],
              });
              return done(null, newUser);
            }
          } catch (error) {
            return done(error);
          }
        }
      )
    );
};

export default initializePassword;

