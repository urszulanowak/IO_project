// __tests__/project.test.js

jest.mock('@utility/database');

const db = require('@utility/database');
const { get_project, get_project_previews, publish } = require('../models/project.js');

describe('get_project', () => {
    beforeEach(() => {
        db.request.mockReset();
    });

    it('should return project data and comments', async () => {
        const mockProject = [{ project_id: 1, title: 'Test Project' }];
        const mockComments = [{ comment_id: 1, text: 'Great project!', user_id: 1 }];
        db.request
            .mockReturnValueOnce({
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockResolvedValue({ recordset: mockProject })
            })
            .mockReturnValueOnce({
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockResolvedValue({ recordset: mockComments })
            });

        const result = await get_project(1);
        expect(result).toEqual({
            data: mockProject[0],
            comments: mockComments
        });
    });

    it('should throw an error if project is not found', async () => {
        db.request
            .mockReturnValueOnce({
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockResolvedValue({ recordset: [{}] })
            });

        await expect(get_project(0)).rejects.toThrow('project not found');
    });

    it('should handle database errors gracefully', async () => {
        db.request
            .mockReturnValueOnce({
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockRejectedValue(new Error('Database error'))
            });

        await expect(get_project(0)).rejects.toThrow('Database error');
    });
});

describe('get_project_previews', () => {
    beforeEach(() => {
        db.request.mockReset();
    });

    it('should return project previews', async () => {
        const mockPreviews = [{ project_id: 1, title: 'Test Project', description: 'Test description' }];
        db.request.mockReturnValue({
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({ recordset: mockPreviews })
        });

        const result = await get_project_previews([1, 2, 3]);
        expect(result).toEqual(mockPreviews);
    });

    it('should return an empty array when no projects are found', async () => {
        db.request.mockReturnValue({
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({ recordset: [] })
        });

        const result = await get_project_previews([1, 2, 3]);
        expect(result).toEqual([]);
    });

    it('should handle database errors gracefully', async () => {
        db.request.mockReturnValue({
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockRejectedValue(new Error('Database error'))
        });

        await expect(get_project_previews([1, 2, 3])).rejects.toThrow('Database error');
    });
});

describe('publish', () => {
    beforeEach(() => {
        db.request.mockReset();
    });

    it('should publish a project successfully', async () => {
        const mockResult = [{ project_id: 1 }];
        db.request.mockReturnValue({
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({ recordset: mockResult })
        });

        const result = await publish(1, 'Test Project', 'This is a test project description that is long enough xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.');
        expect(result).toBe(1);
    });

    it('should throw an error if title is too short', async () => {
        await expect(publish(1, 'Short', 'This is a test project description that is long enough.')).rejects.toThrow('title too short');
    });

    it('should throw an error if description is too short', async () => {
        await expect(publish(1, 'Test Project', 'Too short')).rejects.toThrow('description too short');
    });

    it('should handle database errors gracefully', async () => {
        db.request.mockReturnValue({
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockRejectedValue(new Error('Database error'))
        });

        await expect(publish(0, 'Test Project', 'This is a test project description that is long enoughssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss.')).rejects.toThrow('Database error');
    });
});
