
const express = require('express');
const request = require('supertest');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const jwt_cfg = require('@config/jwt_cfg');
const user_auth = require('../middlewares/user_auth');

jest.mock('jsonwebtoken', () => ({
    verify: jest.fn()
}));

jest.mock('@config/jwt_cfg', () => ({
    ACCESS_TOKEN_SECRET: 'your_secret'
}));

describe('user_auth middleware', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(cookieParser());
        app.use(user_auth);
        app.get('/test', (req, res) => {
            res.status(200).send({ user: req.user });
        });
    });

    test('should set user to guest if no token is provided', async () => {
        const response = await request(app).get('/test');

        expect(response.status).toBe(200);
        expect(response.body.user).toEqual({ is_guest: true });
    });

    test('should set user to guest if token verification fails', async () => {
        jwt.verify.mockImplementation((token, secret, callback) => {
            callback(new Error('Invalid token'), null);
        });

        const response = await request(app).get('/test').set('Cookie', ['jwt_access_token=invalidtoken']);

        expect(response.status).toBe(200);
        expect(response.body.user).toEqual({ is_guest: true });
    });

    test('should set user to the decoded user if token verification succeeds', async () => {
        const decodedUser = { id: 1, name: 'John Doe' };

        jwt.verify.mockImplementation((token, secret, callback) => {
            callback(null, decodedUser);
        });

        const response = await request(app).get('/test').set('Cookie', ['jwt_access_token=validtoken']);

        expect(response.status).toBe(200);
        expect(response.body.user).toEqual(decodedUser);
    });
});
