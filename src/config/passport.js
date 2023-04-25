import local from 'passport-local'
import passport from 'passport'
import GitHubStrategy from 'passport-github2'
import jwt from 'passport-jwt'
import UserService from '../services/user.js'
import * as roleService from '../services/rol.js'

const LocarStrategy = local.Strategy
const JWTStrategy = jwt.Strategy
const ExtractJWT = jwt.ExtractJwt

const userService = new UserService()

const initializePassword = () => {
  const cookieExtractor = req => {
    const token = req.cookies ? req.cookies.jwtCookie : {}
    return token
  }

  passport
    .use(
      'jwt',
      new JWTStrategy(
        {
          jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
          secretOrKey: process.env.JWT
        },
        async (jwtPayload, done) => {
          try {
            return done(null, jwtPayload)
          } catch (error) {
            return done(error)
          }
        }
      )
    )
    .use(
      'register',
      new LocarStrategy(
        { passReqToCallback: true, usernameField: 'email' },
        async (req, username, password, done) => {
          try {
            const { firstName, lastName, age, passwordConfirm, roles } =
              req.body
            req.session.register = {
              firstName,
              lastName,
              age,
              emailRegister: username
            }
            const user = await userService.findOneUser(username)
            if (user) {
              req.session.signup = true
              req.session.email = username
              req.session.messageErrorSignup = 'Ingresa con tu contraseña'
              return done(null, false)
            }
            if (password !== passwordConfirm) {
              req.session.signup = true
              req.session.email = ''
              req.session.messageErrorSignup =
                'Las contraseñas no coinciden'
              return done(null, false)
            }

            const newUser = {
              firstName,
              lastName,
              age: parseInt(age),
              email: username,
              password: await userService.encryptPassword(password)
            }

            if (roles) {
              const foundRoles = await roleService.findRoles({
                name: { $in: roles }
              })
              newUser.roles = foundRoles.map(role => role._id)
            } else {
              const role = await roleService.findOneRole('user')
              newUser.roles = [role._id]
            }

            const newCart = await userService.addCartToUser()
            newUser.cart = newCart

            await userService.createUser(newUser)

            req.session.signup = false
            req.session.email = username
            req.session.messageNewUser = 'Ingresa con tu contraseña'
            return done(null, false)
          } catch (error) {
            return done(error)
          }
        }
      )
    )

  passport.serializeUser(async (user, done) => {
    if (Array.isArray(user)) {
      done(null, user[0]._id)
    } else {
      done(null, user._id)
    }
  })

  passport.deserializeUser(async (id, done) => {
    const user = await userService.findByIdUser(id)
    done(null, user)
  })

  passport
    .use(
      'login',
      new LocarStrategy(
        { passReqToCallback: true, usernameField: 'email' },
        async (req, username, password, done) => {
          try {
            const user = await userService.findOneUser(username)
            if (user == null) {
              req.session.signup = false
              req.session.messageErrorLogin = 'Email incorrecto'
              return done(null, false)
            }
            if (await userService.comparePassword(password, user.password)) {

              return done(null, user)
            }
            req.session.signup = false
            req.session.email = username
            req.session.messageNewUser = ''
            req.session.messageErrorLogin = 'Contraseña incorrecta'
            return done(null, false)
          } catch (error) {
            return done(error)
          }
        }
      )
    )
    .use(
      'github',
      new GitHubStrategy(
        {
          clientID: process.env.CLIENT_ID,
          clientSecret: process.env.CLIENT_SECRET,
          scope: ['user:email'],
          calbackURL: process.env.CALLBACK_URL,
          passReqToCallback: true
        },



        async (req, accessToken, refreshToken, profile, done) => {
          try {
            const userGithub = await userService.findOneUser({
              email: profile.emails[0].value
            })
            if (userGithub) {
              return done(null, userGithub)
            } else {
              const role = await roleService.findOneRole('user')
              const cart = await userService.addCartToUser()
              const newUser = await userService.createUser({
                firstName: profile._json.name,
                lastName: '',
                age: 18, 
                email: profile.emails[0].value,
                password: '', 
                roles: [role._id],
                cart
              })
              return done(null, newUser)
            }
          } catch (error) {
            return done(error)
          }
        }
      )
    )
}

export default initializePassword


