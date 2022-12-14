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
const updateSosmed = {
    name: 'Update Name',
    social_media_url: 'http://URLbaru.com',
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
    await queryInterface.bulkInsert('Users', [hashedUser]);
    await queryInterface.bulkInsert('SocialMedia', [defaultSosmed]);
});

const userToken = sign({ id: 1, email: userTest.email });
afterAll(async () => {
    sequelize.close();
});

describe('PUT /socialmedias/:socialMediaId', () => {
    test('Should return HTTP code 200 when update social media data success', async() => {
        const { _body } = await request(app)
        .put('/socialmedias/'+1)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
            name: updateSosmed.name,
            social_media_url: updateSosmed.social_media_url,
        })
        .expect(200);
    });

    test('Should return HTTP code 400 when update social media with wrong format poster image url', async() => {
        const { _body } = await request(app)
        .put('/socialmedias/'+1)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
            name : updateSosmed.name,
            social_media_url: "Wrong Format",
        })
        .expect(400);
        const {message} = _body;
        expect(message).toBeTruthy();
        expect(message).toBeDefined();
        expect(message).toEqual(expect.anything());
        expect(message[0]).toBe('Validation isUrl on social_media_url failed');
    });

    test('Should return HTTP code 401 when update social media data without JWT', async() => {
        const { _body } = await request(app)
        .put('/socialmedias/'+1)
        .send({
            name: updateSosmed.name,
            social_media_url: updateSosmed.social_media_url,
        })
        .expect(401);
        const {message} = _body;
        expect(message).toBeTruthy();
        expect(message).toBeDefined();
        expect(message).toEqual(expect.anything());
        expect(message).toMatch(/unauthorized/i);
    });

    test('Should return HTTP code 401 when update social media data without exist JWT', async() => {
        const { _body } = await request(app)
        .put('/socialmedias/'+1)
        .set('Authorization', `Bearer Wrong Token`)
        .send({
            name: updateSosmed.name,
            social_media_url: updateSosmed.social_media_url,
        })
        .expect(401);
        const {message} = _body;
        expect(message).toBeTruthy();
        expect(message).toBeDefined();
        expect(message).toEqual(expect.anything());
        expect(message).toMatch(/invalid token/i);
    });
});