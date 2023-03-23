/* global db */
db.createUser(
  {
    user: 'amberadmin',
    pwd: 'episalt',
    roles: [
      {
        role: 'readWrite',
        db: 'mobogadb',
      },
    ],
  },
);
