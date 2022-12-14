const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../models/index');
const { queryInterface } = sequelize;
const { hash } = require('../helpers/hash');
const { sign, verify } = require('../helpers/jwt');
const { post } = require('../routes');

const userTest = {
    email: 'user1@mail.com',
    full_name: 'User 1',
    username: 'User1',
    password: 'password',
    profile_image_url: 'https://www.pexels.com/search/animal/',
    age: 21,
    phone_number: 1231231,
    createdAt: new Date(),
    updatedAt: new Date()
};

const updateComment = {
    comment: 'Update Comment',
    PhotoId : 1
};

const defaultPhoto = {
    title: 'Default Photo',
    caption: 'Default Photo caption',
    poster_image_url: 'http://image.com/defaultphoto.png',
    UserId: 1,
    createdAt: new Date(),
    updatedAt: new Date()
};

const defaultComment = {
    comment: 'Default Comment',
    PhotoId : 1,
    UserId: 1,
    createdAt: new Date(),
    updatedAt: new Date()
};

beforeAll(async () => {
    await queryInterface.bulkDelete('Comments', null, {
        truncate: true,
        restartIdentity: true,
        cascade: true
      });
    await queryInterface.bulkDelete('Photos', null, {
      truncate: true,
      restartIdentity: true,
      cascade: true
    });
    await queryInterface.bulkDelete('Users', null, {
      truncate: true,
      restartIdentity: true,
      cascade: true
    });
    const hashedUser = { ...userTest };
    hashedUser.password = hash(hashedUser.password);
    await queryInterface.bulkInsert('Users', [hashedUser]);
    await queryInterface.bulkInsert('Photos', [defaultPhoto]);
    await queryInterface.bulkInsert('Comments', [defaultComment]);
});

const userToken = sign({ id: 1, email: userTest.email });
afterAll(async () => {
    sequelize.close();
});

describe('PUT /comments/:commentId', () => {
    test('Should return HTTP code 200 when update user data photo', async() => {
        const { _body } = await request(app)
        .put('/comments/'+1)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
            comment: updateComment.comment,
        })
        .expect(200);
        const { comment} = _body;
        expect(comment).toBeTruthy();
        expect(comment).toBeDefined();
        expect(comment).toEqual({
            id: expect.anything(),
            UserId: expect.anything(),
            PhotoId: expect.anything(),
            comment: updateComment.comment,
            createdAt: expect.anything(),
            updatedAt: expect.anything()
        });
    });

    test('Should return HTTP code 401 when edit commment without exist JWT', async() => {
        const { _body } = await request(app)
        .put('/comments/'+1)
        .set('Authorization', `Bearer Wrong Token`)
        .send({
            comment: defaultComment.comment,
        })
        .expect(401);
        const {message} = _body;
        expect(message).toBeTruthy();
        expect(message).toBeDefined();
        expect(message).toEqual(expect.anything());
        expect(message).toMatch(/invalid token/i);
    });

    test('Should return HTTP code 401 when edit comment without JWT', async() => {
        const {_body} = await request(app)
        .put('/comments'+1)
        .send({
            comment: defaultComment.comment,
        })
        .expect(401);
        const {message} = _body;
        expect(message).toBeTruthy();
        expect(message).toBeDefined();
        expect(message).toEqual(expect.anything());
        expect(message).toMatch(/unauthorized/i);
    });
});