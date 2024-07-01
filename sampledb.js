const clients = [
    {
        id: '1',
        name: 'Benny John',
        email: 'bennyjohn@email.com',
        phone: '232-3243-123'
    },
    {
        id: '2',
        name: 'Will Smith',
        email: 'willsmith@email.com',
        phone: '232-675-123'
    },
    {
        id: '3',
        name: 'Andrew Tate',
        email: 'amdrewtate@email.com',
        phone: '232-3243-123'
    },
    {
        id: '4',
        name: 'Thristan Tate',
        email: 'thristantate@email.com',
        phone: '232-3243-123'
    },
]

const projects = [
    {
        id: '1',
        name: 'Web Dev',
        description: 'A web development project',
        status: 'Not Started',
        clientId: '1'
    },
    {
        id: '2',
        name: 'Mobile Dev',
        description: 'A mobile development project',
        status: 'In Progress',
        clientId: '2'
    },
    {
        id: '3',
        name: 'CMS Dev',
        description: 'A CMS development project',
        status: 'Completed',
        clientId: '3'
    },
    {
        id: '4',
        name: 'Flutter Dev',
        description: 'A Flutter app development project',
        status: 'Not Started',
        clientId: '4'
    },
]

module.exports = { clients, projects }