// __tests__/userTest.js
jest.mock('@utility/database');

const { login, register } = require('../models/user');
const db = require('@utility/database');

describe('User Authentication Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('login', () => {
        it('should login successfully with correct email and password', async () => {
            const email = 'test@example.com';
            const pass = 'password123';
            const userRecord = {
                user_id: 1,
                email: email,
                name: 'Test User',
                is_admin: false
            };

            db.request.mockReturnValue({
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockResolvedValue({ recordset: [userRecord] })
            });

            const user = await login(email, pass);

            expect(user).toEqual({
                user_id: userRecord.user_id,
                email: userRecord.email,
                name: userRecord.name,
                is_guest: false,
                is_admin: userRecord.is_admin
            });
        });

        it('should throw error for incorrect email', async () => {
            db.request.mockReturnValue({
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockResolvedValue({ recordset: [] })
            });

            await expect(login('wrong@example.com', 'password123')).rejects.toThrow('invalid email or password');
        });

        it('should throw error for incorrect password', async () => {
            db.request.mockReturnValue({
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockResolvedValue({ recordset: [] })
            });

            await expect(login('test@example.com', 'wrongpassword')).rejects.toThrow('invalid email or password');
        });
    });

    describe('register', () => {
        it('should register user successfully with valid data', async () => {
            // Zamockowanie metody db.request().query do zwracania pustego wyniku
            db.request.mockReturnValue({
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockResolvedValue({})
            });

            // Sprawdzenie, czy rejestracja zakończy się sukcesem bez rzucania błędu
            await expect(register('new@example.com', 'New User', 'password123', new Date(2000, 0, 1), 'M')).resolves.not.toThrow();
        });

        it('should throw error if email already exists', async () => {
            db.request.mockReturnValue({
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockRejectedValue({
                    code: 'EREQUEST',
                    originalError: {
                        info: { message: 'unique_email' }
                    }
                })
            });

            await expect(register('existing@example.com', 'New User', 'password123', new Date(2000, 0, 1), 'M')).rejects.toThrow('email already exists');
        });

        it('should throw error if name already exists', async () => {
            db.request.mockReturnValue({
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockRejectedValue({
                    code: 'EREQUEST',
                    originalError: {
                        info: { message: 'unique_name' }
                    }
                })
            });

            await expect(register('new@example.com', 'Existing User', 'password123', new Date(2000, 0, 1), 'M')).rejects.toThrow('name already exists');
        });

        it('should throw error if email is too short', async () => {
            db.request.mockReturnValue({
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockRejectedValue({
                    code: 'EREQUEST',
                    originalError: {
                        info: { message: 'email_len' }
                    }
                })
            });

            await expect(register('short@e.com', 'New User', 'password123', new Date(2000, 0, 1), 'M')).rejects.toThrow('email too short');
        });

        it('should throw error if name is too short', async () => {
            db.request.mockReturnValue({
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockRejectedValue({
                    code: 'EREQUEST',
                    originalError: {
                        info: { message: 'name_len' }
                    }
                })
            });

            await expect(register('new@example.com', 'Nu', 'password123', new Date(2000, 0, 1), 'M')).rejects.toThrow('name too short');
        });

        it('should throw error if password is too short', async () => {
            db.request.mockReturnValue({
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockRejectedValue({
                    code: 'EREQUEST',
                    originalError: {
                        info: { message: 'pass_len' }
                    }
                })
            });

            await expect(register('new@example.com', 'New User', 'short', new Date(2000, 0, 1), 'M')).rejects.toThrow('pass too short');
        });

        it('should throw error if user age is less than 16 years', async () => {
            db.request.mockReturnValue({
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockRejectedValue({
                    code: 'EREQUEST',
                    originalError: {
                        info: { message: 'user_age' }
                    }
                })
            });

            await expect(register('new@example.com', 'New User', 'password123', new Date(2010, 0, 1), 'M')).rejects.toThrow('user age');
        });

    });
});
