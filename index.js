const { ApolloServer } = require('apollo-server');
const { typeDefs } = require('./db/schema');
const { resolvers } = require('./db/resolvers');
const jwt = require('jsonwebtoken');

const conectarDB = require('./config/db');

// Conectar a la base de datos
conectarDB();

// Server 
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({req}) => {
    const token = req.headers['authorization'] || '';
    if(token){
      try {
        const usuario = jwt.verify(token,  process.env.SECRET_KEY);

        return {
          usuario
        };
      } catch (error) {
        console.log(error);
      }
    }
  }
});

// Start server
server.listen().then(({ url }) => {
  console.log(`Servidor listo en la url: ${url}`);
})