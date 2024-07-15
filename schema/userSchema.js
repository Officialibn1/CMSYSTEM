const { GraphQLObjectType, GraphQLList, GraphQLNonNull, GraphQLString, GraphQLID } = require('graphql')


const User = require('../config/models/User.js')
const { ProjectType } = require('./projectsSchema.js')
const { ClientType } = require('./clientSchema.js')
const Project = require('../config/models/Project')
const Client = require('../config/models/Client')

const admin = require('firebase-admin')



const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLID },
        uid: { type: GraphQLID },
        email: { type: GraphQLString },
        name: { type: GraphQLString },
        projects: {
            type: new GraphQLList(ProjectType),
            resolve(parent, args) {
                return Project.find({ _id: { $in: parent.projects } })
            }
        },
        clients: {
            type: new GraphQLList(ClientType),
            resolve(parent, args) {
                return Client.find({ _id: { $in: parent.clients } })
            }
        }
    })
})

const UserQuery = {
    user: {
        type: UserType,
        args: {
            id: {
                type: new GraphQLNonNull(GraphQLID),
            }
        },
        resolve(parent, args) {
            return User.findByID(args.id)
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
                // const userRecord = await admin.auth().createUser({
                //     email: args.email,
                //     password: args.password,
                //     displayName: args.name
                // })

                // const verifyUser = await admin
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
        type: GraphQLString,
        args: {
            uid: { type: new GraphQLNonNull(GraphQLID) },
            email: { type: GraphQLString }
        },
        async resolve(parent, args) {
            try {
                const user = await admin.auth().getUserByProviderUid(args.uid)

                if (!user) {
                    throw new Error('User Does Not Exist.')
                }

                return User.findOne({ uid: { $in: args.uid } })
            } catch (error) {
                console.log(`Firebase Error: ${error}`.blue.underline);

                return new Error(error.message)

            }
        }
    }
}

module.exports = { UserType, UserMutation, UserQuery }