/**
 * Business gRPC server
 */
import grpc from 'grpc';
import _ from 'lodash';

import config from './config';
import Business from '../models/business.model'

const PROTO_PATH = __dirname + '/protos/business.proto';
const businessProto = grpc.load(PROTO_PATH).business;

const getBusiness = (call) => {
  let business, promises = [], promise;

  _.each(call.request.bid, bid => {
    promise = new Promise((resolve, reject) => {
      Business.getById(bid).then(business => {
        call.write({
          business: {
            _id: business._id.toString(),
            krName: business.krName,
            cnName: business.cnName,
            enName: business.enName,
            status: business.status,
            thumbnailUri: business.thumbnailUri.toJSON(),
          }
        });

        resolve(business);
      }).catch(err => {
        reject(err);
      });
    });

    promises.push(promise);
  });

  Promise.all(promises).then(() => {
    call.end();
  }).catch(err => {
    throw err;
  });
};

const server = new grpc.Server();
server.addService(businessProto.BusinessService.service, {
  getBusiness: getBusiness,
});

server.bind('0.0.0.0:' + config.grpcServer.port, grpc.ServerCredentials.createSsl(null, [{
  cert_chain: config.grpcPublicKey,
  private_key: config.grpcPrivateKey
}], false));

//server.bind('0.0.0.0:' + config.grpcServer.port, grpc.ServerCredentials.createInsecure());

export default server;
