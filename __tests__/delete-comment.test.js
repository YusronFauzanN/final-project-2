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

const defaultComment = {
    comment : 'komen',
    PhotoId: 1,
    UserId: 1,
    createdAt: new Date(),
    updatedAt: new Date()
}

const defaultPhoto = {
    title: 'Default Photo',
    caption: 'Default Photo caption',
    poster_image_url: 'http://image.com/defaultphoto.png',
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

describe('DELETE /comments/:commentId', () => {
    test('Should return HTTP code 200 when delete comment success', async () => {
        const {_body} = await request(app)
        .delete('/comments/'+1)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
        const { message } = _body
        expect(message).toBeTruthy();
        expect(message).toBeDefined();
        expect(message).toEqual(expect.anything());
        expect(message).toBe("Your comment has been successfully deleted");
    });

    test('Should return HTTP code 401 when delete comment without JWT', async() => {
        const { _body } = await request(app)
        .delete('/comments/'+1)
        .expect(401);
        const {message} = _body;
        expect(message).toBeTruthy();
        expect(message).toBeDefined();
        expect(message).toEqual(expect.anything());
        expect(message).toMatch(/unauthorized/i);
    });

    test('Should return HTTP code 401 when delete comment with invalid JWT', async() => {
        const { _body } = await request(app)
        .delete('/comments/'+1)
        .set('Authorization', `Bearer Wrong Token`)
        .expect(401);
        const {message} = _body;
        expect(message).toBeTruthy();
        expect(message).toBeDefined();
        expect(message).toEqual(expect.anything());
        expect(message).toMatch(/invalid token/i);
    });
});