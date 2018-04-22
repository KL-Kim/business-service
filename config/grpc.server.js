/**
 * Business gRPC server
 */
import grpc from 'grpc';
import _ from 'lodash';

import config from './config';
import Business from '../models/business.model'

const PROTO_PATH = __dirname + '/protos/business.proto';
const businessProto = grpc.load(PROTO_PATH).business;

const addReview = (call, callback) => {
  const bid = call.request.bid;

  Business.getById(bid)
    .then(business => {
      if (_.isEmpty(business)) throw new Error("Not found");

      business.reviewsList.push(call.request.rid);
      business.ratingSum = business.ratingSum + call.request.rating;

      return business.save();

    })
    .then(business => {
      const data = {
        businessId: business._id.toString()
      };

      callback(null, data);
    })
    .catch(err => {
      callback(err, {});
    });
};

const updateReview = (call, callback) => {
  const bid = call.request.bid;
  const rid = call.request.rid;
  const difference = call.request.difference;


  Business.getById(bid)
    .then(business => {
      if (_.isEmpty(business)) throw new Error("Not found");

      let index = business.reviewsList.indexOf(rid);

      if (index > -1) {
        business.ratingSum = business.ratingSum + difference;
      }

      return business.save();
    })
    .then(business => {
      const data = {
        businessId: business._id.toString()
      };

      callback(null, data);
    })
    .catch(err => {
      callback(err, {});
    });
}

const deleteReview = (call, callback) => {
  const bid = call.request.bid;
  const rid = call.request.rid;
  const rating = call.request.rating;

  Business.getById(bid)
    .then(business => {
      if (_.isEmpty(business)) throw new Error("Not found");

      let reviewsList = business.reviewsList;
      const index = reviewsList.indexOf(rid);
      if (index > -1) {
        reviewsList.splice(index, 1);
        business.ratingSum = business.ratingSum - rating;
      }

      return business.save();
    })
    .then(business => {
      const data = {
        businessId: business._id.toString()
      };

      callback(null, data);
    })
    .catch(err => {
      callback(err, {});
    });
}

const server = new grpc.Server();
server.addService(businessProto.BusinessService.service, {
  addReview: addReview,
  updateReview: updateReview,
  deleteReview: deleteReview,
});

server.bind('0.0.0.0:' + config.grpcServer.port, grpc.ServerCredentials.createSsl(null, [{
  cert_chain: config.grpcPublicKey,
  private_key: config.grpcPrivateKey
}], false));

//server.bind('0.0.0.0:' + config.grpcServer.port, grpc.ServerCredentials.createInsecure());

export default server;
