// __tests__/recommend.test.js

jest.mock('@utility/database');

const db = require('@utility/database');
const { recommend } = require('../models/recommend.js');

describe('recommend', () => {
    beforeEach(() => {
        db.request.mockReset();
    });

    it('should return correct number of project recommendations', async () => {
        const mockProjects = [{ project_id: 1 }, { project_id: 2 }, { project_id: 3 }];
        db.request.mockReturnValue({
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({ recordset: mockProjects })
        });

        const result = await recommend(3, 1, [4, 5, 6]);
        expect(result).toEqual([1, 2, 3]);
    });

    it('should return an empty array when there are no projects to recommend', async () => {
        db.request.mockReturnValue({
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({ recordset: [] })
        });

        const result = await recommend(3, 1, [4, 5, 6]);
        expect(result).toEqual([]);
    });

    it('should handle database errors gracefully', async () => {
        db.request.mockReturnValue({
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockRejectedValue(new Error('Database error'))
        });

        await expect(recommend(3, 1, [4, 5, 6])).rejects.toThrow('Database error');
    });
});
