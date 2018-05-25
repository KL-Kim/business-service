/**
 * Business gRPC server
 */
import grpc from 'grpc';
import _ from 'lodash';

import config from '../config/config';

const PROTO_PATH = __dirname + '/../config/protos/business.proto';
const businessProto = grpc.load(PROTO_PATH).business;
import { addReview, updateReview, deleteReview, addToFavoredUser, removeFromFavoredUser } from './server.methods';

const server = new grpc.Server();
server.addService(businessProto.BusinessService.service, {
  addReview: addReview,
  updateReview: updateReview,
  deleteReview: deleteReview,
  addToFavoredUser: addToFavoredUser,
  removeFromFavoredUser: removeFromFavoredUser,
});

server.bind(config.businessGrpcServer.host + ':' + config.businessGrpcServer.port, grpc.ServerCredentials.createSsl(null, [{
  cert_chain: config.grpcPublicKey,
  private_key: config.grpcPrivateKey
}], false));

//server.bind('0.0.0.0:' + config.grpcServer.port, grpc.ServerCredentials.createInsecure());

export default server;
