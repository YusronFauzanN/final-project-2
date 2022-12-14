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
const socialmediaTest = {
    name : "akbar23",
    social_media_url: "https://url.com"
}
beforeAll(async () => {
    await queryInterface.bulkDelete('Users', null, {
      truncate: true,
      restartIdentity: true,
      cascade: true
    });
    const hashedUser = { ...userTest };
    hashedUser.password = hash(hashedUser.password);
    await queryInterface.bulkInsert('Users', [hashedUser]);
});
const userToken = sign({ id: 1, email: userTest.email });
afterAll(async () => {
    sequelize.close();
});
describe('POST /socialmedias', () => {
    test('Should return HTTP code 201 when create socialmedia success', async () => {
        const { _body } = await request(app)
        .post('/socialmedias')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
            name: socialmediaTest.name,
            social_media_url: socialmediaTest.social_media_url
        })
        .expect(201);
        expect(_body).toBeTruthy();
        expect(_body).toBeDefined();
        expect(_body).toEqual({
            id: expect.anything(),
            name: socialmediaTest.name,
            social_media_url: socialmediaTest.social_media_url,
            UserId: expect.anything()
        });
    });

    test('Should return HTTP code 401 when create socialmedia without JWT', async () => {
        const { _body } = await request(app)
        .post('/socialmedias')
        .send({
            name: socialmediaTest.name,
            social_media_url: socialmediaTest.social_media_url
        })
        .expect(401);
        const {message} = _body;
        expect(message).toBeTruthy();
        expect(message).toBeDefined();
        expect(message).toEqual(expect.anything());
        expect(message).toMatch(/unauthorized/i);
    });

    test('Should return HTTP code 400 when create socialmedia with wrong format', async () => {
        const { _body } = await request(app)
        .post('/socialmedias')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
            name: socialmediaTest.name,
            social_media_url: " ",
        })
        .expect(400);
        const {message} = _body;
        expect(message).toBeTruthy();
        expect(message).toBeDefined();
        expect(message).toEqual(expect.anything());
        expect(message).toEqual(expect.arrayContaining(['Validation isUrl on social_media_url failed']));
    });
});
