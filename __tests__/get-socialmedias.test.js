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

const defaultSosmed = {
    name: 'Default name',
    social_media_url: 'https://urls.com',
    UserId: 1,
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
    await queryInterface.bulkInsert('Users', [hashedUser]);
    await queryInterface.bulkInsert('SocialMedia', [defaultSosmed]);
});

const userToken = sign({ id: 1, email: userTest.email });
afterAll(async () => {
    sequelize.close();
});

describe('GET /socialmedias', () => {
    test('Should return HTTP code 200 when get Social Media success', async () => {
        const { _body } = await request(app)
        .get('/socialmedias')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
        const {socialMedias} = _body;
        expect(socialMedias).toBeTruthy();
        expect(socialMedias).toBeDefined();
        expect(socialMedias[0]).toHaveProperty('name');
        expect(socialMedias[0]).toHaveProperty('social_media_url');
        expect(socialMedias[0]).toHaveProperty('UserId');
    });

    test('Should return HTTP code 401 when get social media data without JWT', async() => {
        const { _body } = await request(app)
        .get('/socialmedias')
        .expect(401);
        const {message} = _body;
        expect(message).toBeTruthy();
        expect(message).toBeDefined();
        expect(message).toEqual(expect.anything());
        expect(message).toMatch(/unauthorized/i);
    });

    test('Should return HTTP code 401 when get social media data without exist JWT', async() => {
        const { _body } = await request(app)
        .get('/socialmedias')
        .set('Authorization', `Bearer Wrong Token`)
        .expect(401);
        const {message} = _body;
        expect(message).toBeTruthy();
        expect(message).toBeDefined();
        expect(message).toEqual(expect.anything());
        expect(message).toMatch(/invalid token/i);
    });
});