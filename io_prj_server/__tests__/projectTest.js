const { get_project, get_project_previews, get_project_previews_by_user_id, publish, join_request } = require('../models/project'); // Zaktualizuj ścieżkę do swojego modułu
const db = require('@utility/database');
const tag_model = require('@models/project_tag');

// Mockowanie funkcji wewnątrz bloku jest.mock
jest.mock('@utility/database', () => {
    const mockInput = jest.fn().mockReturnThis();
    const mockQuery = jest.fn();
    const mockBegin = jest.fn().mockReturnThis();
    const mockCommit = jest.fn().mockResolvedValue();
    const mockRollback = jest.fn().mockResolvedValue();
    const mockTransaction = jest.fn().mockReturnValue({
        begin: jest.fn().mockReturnThis(),
        commit: jest.fn().mockReturnThis(),
        rollback: jest.fn().mockReturnThis(),
        request: mockRequest,
    });

    return {
        Request: jest.fn(() => ({
            input: mockInput,
            query: mockQuery,
        })),
        pool: {
            transaction: mockTransaction
        },
        Transaction: mockTransaction
    };
});

jest.mock('@models/project_tag', () => ({
    get_project_tags: jest.fn(),
    add_project_tags: jest.fn()
}));

describe('Project Management', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('get_project', () => {
        it('should retrieve project data, comments and tags', async () => {
            const mockProjectData = { project_id: 1, title: 'Test Project' };
            const mockComments = [{ comment: 'Test Comment', user_id: 1, name: 'Test User' }];
            const mockTags = [{ tag_id: 1, project_id: 1, name: 'Test Tag' }];

            db.Request().query
                .mockResolvedValueOnce({ recordset: [mockProjectData] }) // Project data
                .mockResolvedValueOnce({ recordset: mockComments }); // Comments

            tag_model.get_project_tags.mockResolvedValue(mockTags);

            const result = await get_project(1);

            expect(result).toEqual({
                data: mockProjectData,
                comments: mockComments,
                tags: mockTags
            });
        });

        it('should throw error if project not found', async () => {
            db.Request().query.mockResolvedValueOnce({ recordset: [] });

            await expect(get_project(1)).rejects.toThrow('project not found');
        });
    });

    describe('get_project_previews', () => {
        it('should retrieve project previews and tags', async () => {
            const mockPreviews = [
                { project_id: 1, title: 'Test Project', description: 'Test Description' }
            ];
            const mockTags = [{ tag_id: 1, project_id: 1, name: 'Test Tag' }];

            db.Request().query.mockResolvedValueOnce({ recordset: mockPreviews });
            tag_model.get_project_tags.mockResolvedValue(mockTags);

            const result = await get_project_previews([1]);

            expect(result).toEqual([
                {
                    project_id: 1,
                    title: 'Test Project',
                    description: 'Test Description',
                    tags: mockTags
                }
            ]);
        });
    });

    describe('get_project_previews_by_user_id', () => {
        it('should retrieve project previews by user ID and tags', async () => {
            const mockPreviews = [
                { project_id: 1, title: 'Test Project', description: 'Test Description' }
            ];
            const mockTags = [{ tag_id: 1, project_id: 1, name: 'Test Tag' }];

            db.Request().query.mockResolvedValueOnce({ recordset: mockPreviews });
            tag_model.get_project_tags.mockResolvedValue(mockTags);

            const result = await get_project_previews_by_user_id(1);

            expect(result).toEqual([
                {
                    project_id: 1,
                    title: 'Test Project',
                    description: 'Test Description',
                    tags: mockTags
                }
            ]);
        });
    });

    describe('publish', () => {
        it('should publish a new project', async () => {
            const user_id = 1;
            const title = 'Test Project';
            const description = 'This is a test project description that is sufficiently long.';
            const tags = [1, 2, 3];
            const mockProjectId = 1;

            db.pool.transaction().begin.mockResolvedValueOnce();
            db.Request().query
                .mockResolvedValueOnce({ recordset: [{ project_id: mockProjectId }] }) // Project insert
                .mockResolvedValueOnce({}); // Member insert
            tag_model.add_project_tags.mockResolvedValueOnce();
            db.pool.transaction().commit.mockResolvedValueOnce();

            const result = await publish(user_id, title, description, tags);

            expect(result).toBe(mockProjectId);
        });

        it('should throw error if title is too short', async () => {
            await expect(publish(1, 'Short', 'Valid description', [1, 2, 3])).rejects.toThrow('title too short');
        });

        it('should throw error if description is too short', async () => {
            await expect(publish(1, 'Valid Title', 'Short', [1, 2, 3])).rejects.toThrow('description too short');
        });
    });

    describe('join_request', () => {
        it('should send join request successfully', async () => {
            const mockUserId = 1;
            const mockProjectId = 1;
            const mockMessage = 'Join request message';

            db.Transaction().request()
                .mockResolvedValueOnce({ recordset: [] }) // Simulate user not being a member
                .mockResolvedValueOnce({}); // Simulate successful insert

            await join_request(mockUserId, mockProjectId, mockMessage);

            // Check if the request was made with the correct parameters
            expect(db.Transaction().request).toHaveBeenCalledWith();
            expect(db.Transaction().request().input).toHaveBeenCalledWith('user_id', mockUserId);
            expect(db.Transaction().request().input).toHaveBeenCalledWith('project_id', mockProjectId);
            expect(db.Transaction().request().input).toHaveBeenCalledWith('message', mockMessage);
        });

        it('should throw error if user is already a member', async () => {
            const mockUserId = 1;
            const mockProjectId = 1;
            const mockMessage = 'Join request message';

            db.Transaction().request()
                .mockResolvedValueOnce({ recordset: [{ creator: 1 }] }); // Simulate user is already a member

            await expect(join_request(mockUserId, mockProjectId, mockMessage)).rejects.toThrow('already member');
        });

        it('should throw error if user is banned from the project', async () => {
            const mockUserId = 1;
            const mockProjectId = 1;
            const mockMessage = 'Join request message';

            db.Transaction().request()
                .mockResolvedValueOnce({ recordset: [{ baned: 1 }] }); // Simulate user is banned from the project

            await expect(join_request(mockUserId, mockProjectId, mockMessage)).rejects.toThrow('request denied');
        });

        it('should throw error if user has pending request', async () => {
            const mockUserId = 1;
            const mockProjectId = 1;
            const mockMessage = 'Join request message';

            db.Transaction().request()
                .mockResolvedValueOnce({ recordset: [{ creator: 0, accepted: 0, baned: 0 }] }); // Simulate user has pending request

            await expect(join_request(mockUserId, mockProjectId, mockMessage)).rejects.toThrow('request pending');
        });

        it('should throw error if message is too short', async () => {
            const mockUserId = 1;
            const mockProjectId = 1;
            const mockMessage = 'short'; // Message is too short

            await expect(join_request(mockUserId, mockProjectId, mockMessage)).rejects.toThrow('message too short');
        });

        it('should throw error if message is too long', async () => {
            const mockUserId = 1;
            const mockProjectId = 1;
            const mockMessage = 'a'.repeat(300); // Message is too long

            await expect(join_request(mockUserId, mockProjectId, mockMessage)).rejects.toThrow('message too long');
        });
    });
});
