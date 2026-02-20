import { Query } from './query.js';
import { Mutation } from './mutation.js';
import {
  User,
  Challenge,
  UserChallenge,
  CheckIn,
  AIMessage,
  Notification,
  AIInsight,
  ChallengeRecommendation,
  TaskProgress,
  UserChallengeParticipant,
  FeatureRequest,
  FriendActivity
} from './types.js';

/**
 * Combined resolvers for GraphQL
 */
export const resolvers = {
  Query,
  Mutation,
  User,
  Challenge,
  UserChallenge,
  CheckIn,
  AIMessage,
  Notification,
  AIInsight,
  ChallengeRecommendation,
  TaskProgress,
  UserChallengeParticipant,
  FeatureRequest,
  FriendActivity
};

export default resolvers;
