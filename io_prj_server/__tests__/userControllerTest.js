
jest.mock('@models/user');
jest.mock('jsonwebtoken');
jest.mock('@config/jwt_cfg');

const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { profile } = require('../controllers/user');

const user_model = require('@models/user');
const jwt = require('jsonwebtoken');
const jwt_cfg = require('@config/jwt_cfg');

const authController = require('../controllers/user');

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({ secret: 'testsecret', resave: false, saveUninitialized: true }));

app.post('/login', authController.login);
app.post('/register', authController.register);
app.post('/logout', authController.logout);
app.post('/refresh_jwt', authController.refresh_jwt);
app.get('/profile', authController.profile);

describe('User Controller Tests', () => {
    describe('login', () => {
        it('should login user successfully with valid data', async () => {
            user_model.login.mockResolvedValue({
                user_id: 1,
                email: 'test@example.com',
                name: 'Test User',
                is_guest: false,
                is_admin: false
            });

            jwt.sign.mockImplementation(() => 'mockToken');

            const response = await request(app)
                .post('/login')
                .send({ email: 'test@example.com', pass: 'password123' });

            expect(response.status).toBe(200);
            expect(response.headers['set-cookie']).toBeDefined();
        });

        it('should return 401 for invalid email or password', async () => {
            user_model.login.mockRejectedValue(new Error('invalid email or password'));

            const response = await request(app)
                .post('/login')
                .send({ email: 'test@example.com', pass: 'wrongpassword' });

            expect(response.status).toBe(401);
            expect(response.text).toContain('Błąd logowania! Nieprawidłowy email lub hasło.');
        });

        it('should return 500 for server error', async () => {
            user_model.login.mockRejectedValue(new Error('Server error'));

            const response = await request(app)
                .post('/login')
                .send({ email: 'test@example.com', pass: 'password123' });

            expect(response.status).toBe(500);
            expect(response.text).toContain('Server error.');
        });
    });

    describe('register', () => {
        it('should register user successfully with valid data', async () => {
            user_model.register.mockResolvedValue();

            const response = await request(app)
                .post('/register')
                .send({
                    email: 'new@example.com',
                    name: 'New User',
                    pass: 'password123',
                    confirm_pass: 'password123',
                    birth_date: '2000-01-01',
                    gender: 'M'
                });

            expect(response.status).toBe(200);
        });

        it('should return 400 for mismatched passwords', async () => {
            const response = await request(app)
                .post('/register')
                .send({
                    email: 'new@example.com',
                    name: 'New User',
                    pass: 'password123',
                    confirm_pass: 'wrongpassword',
                    birth_date: '2000-01-01',
                    gender: 'M'
                });

            expect(response.status).toBe(400);
            expect(response.text).toContain('Passwords do not match.');
        });

        it.each([
            ['email already exists', 'Błąd rejestracji! Email jest już w użyciu.'],
            ['name already exists', 'Błąd rejestracji! Użytkownik jest już w bazie.'],
            ['email too short', 'Błąd rejestracji! Za krótki email.'],
            ['name too short', 'Błąd rejestracji! Za krótkia nazwa użytkownika.'],
            ['pass too short', 'Błąd rejestracji! Za krótkie hasło.'],
            ['value too long', 'Błąd rejestracji! Za długa wartość.'],
            ['user age', 'Błąd rejestracji! Musisz mieć powyżej 16 lat, aby móc się zarejestrować.']
        ])('should return 400 for registration error: %s', async (error, message) => {
            user_model.register.mockRejectedValue(new Error(error));

            const response = await request(app)
                .post('/register')
                .send({
                    email: 'new@example.com',
                    name: 'New User',
                    pass: 'password123',
                    confirm_pass: 'password123',
                    birth_date: '2000-01-01',
                    gender: 'M'
                });

            expect(response.status).toBe(400);
            expect(response.text).toContain(message);
        });

        it('should return 500 for server error', async () => {
            user_model.register.mockRejectedValue(new Error('server error'));

            const response = await request(app)
                .post('/register')
                .send({
                    email: 'new@example.com',
                    name: 'New User',
                    pass: 'password123',
                    confirm_pass: 'password123',
                    birth_date: '2000-01-01',
                    gender: 'M'
                });

            expect(response.status).toBe(500);
            expect(response.text).toContain('Server error.');
        });
    });

    describe('refresh_jwt', () => {
        it('should refresh JWT successfully with valid token', async () => {
            const user = { user_id: 1, email: 'test@example.com', name: 'Test User' };

            jwt.verify.mockImplementation((token, secret, callback) => {
                callback(null, user);
            });

            jwt.sign.mockImplementation(() => 'newMockAccessToken');

            const response = await request(app)
                .post('/refresh_jwt')
                .set('Cookie', ['jwt_refresh_token=validRefreshToken']);

            expect(response.status).toBe(200);
            expect(response.text).toBe('ok');
        });

        it('should return 403 if no token is provided', async () => {
            const response = await request(app)
                .post('/refresh_jwt');

            expect(response.status).toBe(403);
            expect(response.text).toBe('no token');
        });

        it('should return 403 for invalid token', async () => {
            jwt.verify.mockImplementation((token, secret, callback) => {
                callback(new Error('invalid token'), null);
            });

            const response = await request(app)
                .post('/refresh_jwt')
                .set('Cookie', ['jwt_refresh_token=invalidRefreshToken']);

            expect(response.status).toBe(403);
            expect(response.text).toBe('invalid token');
        });

        it('should return 500 for server error', async () => {
            jwt.verify.mockImplementation((token, secret, callback) => {
                throw new Error('server error');
            });

            const response = await request(app)
                .post('/refresh_jwt')
                .set('Cookie', ['jwt_refresh_token=validRefreshToken']);

            expect(response.status).toBe(500);
            expect(response.text).toBe('server error');
        });
    });

    describe('GET /profile', () => {
        beforeEach(() => {
            req = {
                user: {
                    name: 'Test User',
                    join_date: '2021-01-01',
                    ownProjects: ['Project1', 'Project2'],
                    participatedProjects: ['Project3'],
                    is_guest: false
                }
            };
            res = {
                render: jest.fn(),
                redirect: jest.fn()
            };
            next = jest.fn();
        });

        it('should render profile when user is logged in and not a guest', async () => {
            profile(req, res, next);
            expect(res.render).toHaveBeenCalledWith('profile', {
                user: {
                    name: 'Test User',
                    join_date: '2021-01-01',
                    ownProjects: ['Project1', 'Project2'],
                    participatedProjects: ['Project3']
                }
            });
            expect(res.redirect).not.toHaveBeenCalled();


        });

        it('should redirect to login when user is not logged in', async () => {

            const response = await request(app).get('/profile');
            expect(response.status).toBe(302);
            expect(response.header.location).toBe('/user/login');
        });

        it('should redirect to login when user is a guest', async () => {
            const response = await request(app).get('/profile');
            expect(response.status).toBe(302);
            expect(response.header.location).toBe('/user/login');
        });
    });
});