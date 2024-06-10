const { login, register } = require('../models/user');
const db = require('@utility/database');


const mockInput = jest.fn().mockReturnThis();
const mockQuery = jest.fn();

jest.mock('@utility/database', () => ({
    Request: jest.fn(() => ({
        input: mockInput,
        query: mockQuery,
    })),
}));

describe('User Authentication', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('login', () => {
        it('should return user data if email and password are correct', async () => {
            const mockUser = {
                user_id: 1,
                email: 'test@example.com',
                name: 'Test User',
                is_admin: false,
            };

            mockQuery.mockResolvedValue({
                recordset: [mockUser],
            });

            const result = await login('test@example.com', 'password');

            expect(result).toEqual({
                user_id: 1,
                email: 'test@example.com',
                name: 'Test User',
                is_guest: false,
                is_admin: false,
            });
        });

        it('should throw error if email and password do not match', async () => {
            mockQuery.mockResolvedValue({
                recordset: [],
            });

            await expect(login('test@example.com', 'wrongpassword')).rejects.toThrow('invalid email or password');
        });
    });

    describe('register', () => {
        it('should register a user with valid data', async () => {
            mockQuery.mockResolvedValue({});

            await expect(register('test@example.com', 'Test User', 'password', new Date(2000, 0, 1), 'male')).resolves.toBeUndefined();
        });

        it('should throw error if email already exists', async () => {
            const mockError = new Error();
            mockError.code = 'EREQUEST';
            mockError.originalError = {
                info: {
                    message: 'unique_email',
                },
            };

            mockQuery.mockRejectedValue(mockError);

            await expect(register('test@example.com', 'Test User', 'password', new Date(2000, 0, 1), 'male')).rejects.toThrow('email already exists');
        });

        it('should throw error if name already exists', async () => {
            const mockError = new Error();
            mockError.code = 'EREQUEST';
            mockError.originalError = {
                info: {
                    message: 'unique_name',
                },
            };

            mockQuery.mockRejectedValue(mockError);

            await expect(register('test@example.com', 'Test User', 'password', new Date(2000, 0, 1), 'male')).rejects.toThrow('name already exists');
        });

        it('should throw error if email is too short', async () => {
            const mockError = new Error();
            mockError.code = 'EREQUEST';
            mockError.originalError = {
                info: {
                    message: 'email_len',
                },
            };

            mockQuery.mockRejectedValue(mockError);

            await expect(register('short@e.com', 'Test User', 'password', new Date(2000, 0, 1), 'male')).rejects.toThrow('email too short');
        });

        it('should throw error if name is too short', async () => {
            const mockError = new Error();
            mockError.code = 'EREQUEST';
            mockError.originalError = {
                info: {
                    message: 'name_len',
                },
            };

            mockQuery.mockRejectedValue(mockError);

            await expect(register('test@example.com', 'Tu', 'password', new Date(2000, 0, 1), 'male')).rejects.toThrow('name too short');
        });

        it('should throw error if password is too short', async () => {
            const mockError = new Error();
            mockError.code = 'EREQUEST';
            mockError.originalError = {
                info: {
                    message: 'pass_len',
                },
            };

            mockQuery.mockRejectedValue(mockError);

            await expect(register('test@example.com', 'Test User', 'pass', new Date(2000, 0, 1), 'male')).rejects.toThrow('pass too short');
        });


        it('should throw error if user age is less than 16 years', async () => {
            const mockError = new Error();
            mockError.code = 'EREQUEST';
            mockError.originalError = {
                info: {
                    message: 'user_age',
                },
            };

            mockQuery.mockRejectedValue(mockError);

            await expect(register('test@example.com', 'Test User', 'password', new Date(2010, 0, 1), 'male')).rejects.toThrow('user age');
        });
    });
});
