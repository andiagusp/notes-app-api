require('dotenv').config();
const Jwt = require('@hapi/jwt');
const Hapi = require('@hapi/hapi');

const notes = require('./api/notes');
const NotesValidator = require('./validator/notes');
const NotesService = require('./services/postgres/NotesService');

const users = require('./api/users');
const UsersValidator = require('./validator/users');
const UsersService = require('./services/postgres/UsersService');

const collaborations = require('./api/collaborations');
const CollaborationsValidator = require('./validator/collaborations');
const CollaborationsService = require('./services/postgres/CollaborationsService');

const TokenManager = require('./tokenize/TokenManager');
const authentications = require('./api/authentications');
const AuthenticationsValidator = require('./validator/authentications')
const AuthenticationsService = require('./services/postgres/AuthenticationsService');

const init = async () => {
  const collaborationsService = new CollaborationsService();
  const notesService = new NotesService(collaborationsService);
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  /* plugin external */
  await server.register([
    { plugin: Jwt, }
  ]);

  server.auth.strategy('notesapp_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id
      },
    }),
  });

  /* plugin internal */
  await server.register([
    {
      plugin: notes,
      options: {
        service: notesService,
        validator: NotesValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        notesService,
        validator: CollaborationsValidator,
      }
    }
  ]);

  try {
    await server.start();
  } catch(error) {
    console.log(error);
  }
  console.log(`Server running on ${server.info.uri}`);
};

init();
