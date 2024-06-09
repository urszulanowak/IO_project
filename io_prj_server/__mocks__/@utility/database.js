module.exports = {
    request: jest.fn(() => ({
        input: jest.fn().mockReturnThis(),
        query: jest.fn()
    }))
};