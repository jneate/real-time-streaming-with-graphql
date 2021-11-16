import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import http from 'http';
import { GraphQLSchema } from 'graphql/type';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { useServer } from 'graphql-ws/lib/use/ws';
import WebSocket from 'ws';

import { typeDefs } from './schema';
import { resolvers } from './resolver';
import { ApolloServerPluginLandingPageDisabled } from 'apollo-server-core';

let server: http.Server;
let schema: GraphQLSchema;

async function startServer() {
  
  const app = express();
  server = http.createServer(app);

  schema = makeExecutableSchema({
    typeDefs,
    resolvers 
  });

  const apolloServer = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginLandingPageDisabled()
    ]
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({ app });

  configureWebSockets();

}

function configureWebSockets() {

  server.listen({
    port: 4000,
    host: '127.0.0.1'
  }, () => {

    const webSocketServer = new WebSocket.Server({
      server,
      path: '/graphql'
    });

    useServer(
      {
        schema,
        context: (context) => ({
          ...context.extra
        }),
        connectionInitWaitTimeout: 5_000
      },
      webSocketServer
    );

    console.log(`🚀 Server ready at http://localhost:4000/graphql`);

  });
  
}

startServer();