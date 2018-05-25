/**
 * Business grpc server methods
 */
import _ from 'lodash';

import Business from '../models/business.model';

/**
 * Add review to business's reviewsList
 * @property {ObjecteId} call.request.bid - business id
 * @property {ObjecteId} call.request.rid - business's review
 */
export const addReview = (call, callback) => {
  const bid = call.request.bid;

  Business.getById(bid)
    .then(business => {
      if (_.isEmpty(business)) throw new Error("Not found");

      business.reviewsList.push(call.request.rid);
      business.ratingSum = business.ratingSum + call.request.rating;
      business.ratingAverage = business.ratingSum / business.reviewsList.length;

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

/**
 * Update review and recalculate rating
 * @property {ObjecteId} call.request.bid - business id
 * @property {ObjecteId} call.request.rid - business's review
 * @property {Number} call.request.difference - difference between orginal rating and updated rating
 */
export const updateReview = (call, callback) => {
  const bid = call.request.bid;
  const rid = call.request.rid;
  const difference = call.request.difference;


  Business.getById(bid)
    .then(business => {
      if (_.isEmpty(business)) throw new Error("Not found");

      let index = business.reviewsList.indexOf(rid);

      if (index > -1) {
        business.ratingSum = business.ratingSum + difference;
        business.ratingAverage = business.ratingSum / business.reviewsList.length;
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
};

/**
 * Remove review and recalculate rating
 * @property {ObjecteId} call.request.bid - business id
 * @property {ObjecteId} call.request.rid - business's review
 * @property {Number} call.request.rating - review rating
 */
export const deleteReview = (call, callback) => {
  const bid = call.request.bid;
  const rid = call.request.rid;
  const rating = call.request.rating;

  Business.getById(bid)
    .then(business => {
      if (_.isEmpty(business)) throw new Error("Not found");

      const reviewsList = business.reviewsList;
      const index = reviewsList.indexOf(rid);

      if (index > -1) {
        reviewsList.splice(index, 1);
        business.ratingSum = business.ratingSum - rating;
        business.ratingAverage = business.ratingSum / business.reviewsList.length;
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
};

/**
 * Add user to Business favored user list
 * @property {ObjecteId} call.request.bid - business id
 * @property {ObjecteId} call.request.uid - User id
 */
export const addToFavoredUser = (call, callback) => {
  const uid = call.request.uid;
  const bid = call.request.bid;

  Business.getById(bid)
    .then(business => {
      if (_.isEmpty(business)) throw new Error("Not found");

      const favoredUser = business.favoredUser;
      const index = favoredUser.indexOf(uid);

      if (index < 0) {
        favoredUser.push(uid);
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
};

/**
 * Remove user from Business favored user list
 * @property {ObjecteId} call.request.bid - business id
 * @property {ObjecteId} call.request.uid - User id
 */
export const removeFromFavoredUser = (call, callback) => {
  const uid = call.request.uid;
  const bid = call.request.bid;

  Business.getById(bid)
    .then(business => {
      if (_.isEmpty(business)) throw new Error("Not found");

      const favoredUser = business.favoredUser;
      const index = favoredUser.indexOf(uid);

      if (index > -1) {
        favoredUser.splice(index, 1);
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
