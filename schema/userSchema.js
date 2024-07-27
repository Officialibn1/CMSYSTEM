const { GraphQLObjectType, GraphQLList, GraphQLNonNull, GraphQLString, GraphQLID } = require('graphql')
const User = require('../config/models/User.js')
const Project = require('../config/models/Project')
const Client = require('../config/models/Client')
const admin = require('firebase-admin')
const { AuthenticationError } = require('../config/errors/authenticationError.js')

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => {
        const { ProjectType } = require('./projectsSchema.js')
        const { ClientType } = require('./clientSchema.js')

        return {
            id: { type: GraphQLID },
            uid: { type: GraphQLString },
            email: { type: GraphQLString },
            name: { type: GraphQLString },
            profileUrl: { type: GraphQLString },
            projects: {
                type: new GraphQLList(ProjectType),
                async resolve(parent, args) {
                    return await Project.find({ _id: { $in: parent.projects } })
                }
            },
            clients: {
                type: new GraphQLList(ClientType),
                async resolve(parent, args) {
                    return await Client.find({ _id: { $in: parent.clients } })
                }
            }
        }
    }
})

const UserQuery = {
    user: {
        type: UserType,
        args: {
            id: {
                type: new GraphQLNonNull(GraphQLID),
            }
        },
        async resolve(parent, args) {
            return await User.findByID(args.id)
        }
    }
}

const UserMutation = {
    signUp: {
        type: UserType,
        args: {
            uid: {
                type: new GraphQLNonNull(GraphQLID)
            },
            email: {
                type: new GraphQLNonNull(GraphQLString)
            },
            displayName: {
                type: new GraphQLNonNull(GraphQLString)
            },

        },
        async resolve(parent, args) {
            try {

                const newUser = new User({
                    uid: args.uid,
                    email: args.email,
                    name: args.displayName,
                    projects: [],
                    clients: [],
                })

                return newUser.save()
            } catch (error) {
                return new Error(error.message)
            }
        }
    },
    signIn: {
        type: UserType,
        args: {
            uid: { type: new GraphQLNonNull(GraphQLID) },
            email: { type: GraphQLString }
        },
        async resolve(parent, args) {
            try {
                const user = await admin.auth().getUser(args.uid)

                if (!user) {
                    throw new AuthenticationError()
                }

                return await User.findOne({ uid: { $in: args.uid } })
            } catch (error) {
                console.log(`Firebase Error: ${error}`.blue.underline);

                return new Error(error.message)

            }
        }
    },
    updateProfile: {
        type: UserType,
        args: {
            uid: { type: new GraphQLNonNull(GraphQLID) },
            name: { type: new GraphQLNonNull(GraphQLString) },
            email: { type: new GraphQLNonNull(GraphQLString) },
            profileUrl: { type: GraphQLString },
        },
        async resolve(parent, { uid, name, email, profileUrl }, context) {
            try {
                const user = await admin.auth().getUser(uid)

                if (!user) {
                    throw new AuthenticationError()
                }

                await admin.auth().updateUser(uid, {
                    email,
                    displayName: name,
                    photoURL: profileUrl ? profileUrl : null
                })

                const existingUser = await User.findOne({ uid })

                const newUserData = await User.findByIdAndUpdate(existingUser._id, {
                    name: name || existingUser.name,
                    email: email || existingUser.email,
                    profileUrl: profileUrl || existingUser.profileUrl
                })

                return newUserData
            } catch (error) {
                console.log(error);
                console.log(JSON.stringify(error, null, 2));

                throw new Error(error)
            }
        }
    },
    updatePassword: {
        type: UserType,
        args: {
            uid: { type: new GraphQLNonNull(GraphQLID) },
            password: { type: new GraphQLNonNull(GraphQLString) },

        },
        async resolve(parent, { uid, password }, context) {
            try {
                const user = await admin.auth().getUser(uid)

                if (!user) {
                    throw new AuthenticationError()
                }

                await admin.auth().updateUser(uid, {
                    password
                })

                const existingUser = await User.findOne({ uid })

                return existingUser
            } catch (error) {
                console.log(error);
                console.log(JSON.stringify(error, null, 2));

                throw new Error(error)
            }
        }
    },
    eraseData: {
        type: UserType,
        args: {
            uid: { type: new GraphQLNonNull(GraphQLID) }
        },
        async resolve(parent, { uid }, context) {

            if (!context.user) {
                throw new AuthenticationError()
            }

            const contextUID = await context.user.uid

            if (contextUID !== uid) {
                throw new Error('You don\'t have the permission to perform this operation')
            }

            try {
                await Project.deleteMany({ contextUID })

                await Client.deleteMany({ contextUID })

                return {
                    message: 'Data erased successfully!'
                }
            } catch (error) {
                console.log('Erasing User Data Error: ', error);

                throw new Error(error)


            }
        }
    },
    deleteAccount: {
        type: UserType,
        args: {
            uid: { type: new GraphQLNonNull(GraphQLID) }
        },
        async resolve(parent, { uid }, context) {
            if (!context.user) {
                throw new AuthenticationError()
            }

            const contextUID = await context?.user.uid

            if (contextUID !== uid) {
                throw new Error('You don\'t have permission to perform this operation')
            }

            try {
                await Project.deleteMany({ contextUID })

                await Client.deleteMany({ contextUID })

                await admin.auth().deleteUser(uid)

                return {
                    message: 'Data erased successfully!'
                }
            } catch (error) {
                console.log('Erasing User Data Error: ', error);

                throw new Error(error)
            }
        }
    }
}

module.exports = { UserType, UserMutation, UserQuery }