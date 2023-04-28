const { User, Thought } = require('../models');

module.exports = {
    // gets all users
    getUsers(req, res) {
        User.find()
            .then((user) => res.json(user))
            .catch((err) => res.status(500).json(err));
    },

    // gets one user
    getSingleUser(req, res) {
        User.findOne({ _id: req.params.userId })
        .select('-__v')
        .populate('thoughts')
        .populate('friends')
            .then((user) =>
                !user
                    ? res.status(404).json({ message: "No user found with that id" })
                    : res.json(user))
            .catch((err) => res.status(500).json(err));
    },
    
    // creates a user
    createUser(req, res) {
        User.create(req.body)
            .then((dbUserData) => res.json
                (dbUserData))
            .catch((err) => res.status(500).json(err));
    },

    // adds a friend
    addFriend(req, res) {
        User.findOneAndUpdate(
            { _id: req.params.userId },
            { $addToSet: { friends: req.params.friendId } },
            { runValidators: true, new: true })
            .then((user) =>
                !user
                    ? res.status(404).json({ message: "No user found with that id" })
                    : res.json(user))
            .catch((err) => res.status(500).json(err));
    },

    // updates a user
    updateUser(req, res) {
        User.findOneAndUpdate(
            { _id: req.params.userId },
            { $set: req.body },
            { runValidators: true, new: true }
        )
            .then((thoughts) => {
                return Thought.updateMany(
                    { userId: req.params.userId },
                    { $set: { username: req.body.username } }
                );
            })
            .then((user) =>
                !user
                    ? res.status(404).json({ message: "no user with this id! " })
                    : res.json(user)
            )
            .catch((err) => {
                console.log(err);
                res.status(500).json(err);
            });
    },

    // removes friend
    removeFriend(req, res) {
        User.findOneAndUpdate(
            { _id: req.params.userId },
            { $pull: { friends: req.params.friendId } },
            { new: true }
        )
            .then((user) =>
                !user
                    ? res.status(404).json({ message: 'No user with this id!' })
                    : res.json(user)
            )
            .catch((err) => res.status(500).json(err));
    },

    // removes a user
    deleteUser(req, res) {
        User.findOneAndRemove({ _id: req.params.userId })
            .then((user) =>
                !user
                    ? res.status(404).json({ message: 'No user with this id!' })
                    : Thought.deleteMany(
                        { userId: req.params.userId }
                    )
            )
            .then((thought) =>
                !thought
                    ? res
                        .status(404)
                        .json({ message: 'User deleted but no thoughts for this user!' })
                    : res.json({ message: 'User successfully deleted!' })
            )
            .catch((err) => res.status(500).json(err));
    }
};