const { User } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, { username }, context) => {
      return User.findOne({ _id: context.user._id });
    },
    
  },

  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw AuthenticationError;
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw AuthenticationError;
      }

      const token = signToken(user);

      return { token, user };
    },
    async saveBook(parent, args, context) {
        console.log(context.user);
        try {
          const updatedUser = await User.findOneAndUpdate(
            { _id: context.user._id },
            { $addToSet: { savedBooks: args } },
            { new: true, runValidators: true }
          );
          return updatedUser;
        } catch (err) {
          console.log(err);
          throw AuthenticationError;
        }
      },
      async removeBook(parent, args, context) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId: args.bookId } } },
          { new: true }
        );
        if (!updatedUser) {
            throw AuthenticationError;
        }
        return updatedUser;
      },
    },
  };

module.exports = resolvers;
