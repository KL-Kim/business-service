/**
 * Business service gRPC server
 *
 * @export {Object}
 * @version 0.0.1
 *
 * @author KL-Kim (https://github.com/KL-Kim)
 * @license MIT
 */

import grpc from 'grpc';
import _ from 'lodash';

import config from '../config/config';
import { addReview, updateReview, deleteReview, addToFavoredUser, removeFromFavoredUser } from './server.methods';

const PROTO_PATH = __dirname + '/../config/protos/business.proto';
const businessProto = grpc.load(PROTO_PATH).business;

const server = new grpc.Server();
server.addService(businessProto.BusinessService.service, {
  addReview: addReview,
  updateReview: updateReview,
  deleteReview: deleteReview,
  addToFavoredUser: addToFavoredUser,
  removeFromFavoredUser: removeFromFavoredUser,
});

if (process.env.NODE_ENV === 'development') {
  server.bind(config.businessGrpcServer.host + ':' + config.businessGrpcServer.port, grpc.ServerCredentials.createInsecure());
} else {
  server.bind(config.businessGrpcServer.host + ':' + config.businessGrpcServer.port, grpc.ServerCredentials.createSsl(null, [{
    cert_chain: config.grpcPublicKey,
    private_key: config.grpcPrivateKey
  }], false));
}

export default server;
