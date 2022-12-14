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
const userTest2 = {
    email: 'user2@mail.com',
    full_name: 'User 2',
    username: 'User2',
    password: 'password',
    profile_image_url: 'https://www.pexels.com/search/animal/',
    age: 22,
    phone_number: 1231231,
    createdAt: new Date(),
    updatedAt: new Date()
};

const defaultSosmed = {
    name: 'default Name',
    social_media_url: 'http://URL.com',
    UserId: 1,
    createdAt: new Date(),
    updatedAt: new Date()
};

const defaultSosmed2 = {
    name: 'default Name2',
    social_media_url: 'http://URL2.com',
    UserId: 2,
    createdAt: new Date(),
    updatedAt: new Date()
};

beforeAll(async () => {
    await queryInterface.bulkDelete('SocialMedia', null, {
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
    const hashedUser2 = { ...userTest2 };
    hashedUser2.password = hash(hashedUser2.password);
    await queryInterface.bulkInsert('Users', [hashedUser, hashedUser2]);
    await queryInterface.bulkInsert('SocialMedia', [defaultSosmed, defaultSosmed2]);
});

const userToken = sign({ id: 1, email: userTest.email });
afterAll(async () => {
    sequelize.close();
});

describe('DELETE /socialmedias/:socialMediaId', () => {
    test('Should return HTTP code 200 when delete social media success', async () => {
        const {_body} = await request(app)
        .delete('/socialmedias/'+1)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
        const { message } = _body
        expect(message).toBeTruthy();
        expect(message).toBeDefined();
        expect(message).toEqual(expect.anything());
        expect(message).toMatch(/success/i);
    });

    test('Should return HTTP code 400 when delete other user social media', async() => {
        const { _body } = await request(app)
        .delete('/socialmedias/'+2)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(401);
        const {message} = _body;
        expect(message).toBeTruthy();
        expect(message).toBeDefined();
        expect(message).toEqual(expect.anything());
        expect(message).toMatch(/unauthorized/i);
    });

    test('Should return HTTP code 401 when delete social media without JWT', async() => {
        const { _body } = await request(app)
        .delete('/socialmedias/'+1)
        .expect(401);
        const {message} = _body;
        expect(message).toBeTruthy();
        expect(message).toBeDefined();
        expect(message).toEqual(expect.anything());
        expect(message).toMatch(/unauthorized/i);
    });

    test('Should return HTTP code 401 when delete social media with invalid JWT', async() => {
        const { _body } = await request(app)
        .delete('/socialmedias/'+1)
        .set('Authorization', `Bearer Wrong Token`)
        .expect(401);
        const {message} = _body;
        expect(message).toBeTruthy();
        expect(message).toBeDefined();
        expect(message).toEqual(expect.anything());
        expect(message).toMatch(/invalid token/i);
    });
});