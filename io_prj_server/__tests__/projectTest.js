const db = require('@utility/database');
const tag_model = require('@models/project_tag');
const projectService = require('../models/project'); // Zmień na odpowiednią ścieżkę do twojego pliku

jest.mock('@utility/database');
jest.mock('@models/project_tag');

describe('Project Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('get_project', () => {
        it('should retrieve the project with comments and tags', async () => {
            db.Request = jest.fn().mockImplementation(() => ({
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockImplementation((query) => {
                    if (query.includes('SELECT * FROM [dbo].[project] WHERE project_id')) {
                        return Promise.resolve({ recordset: [{ project_id: 1, name: 'Test Project' }] });
                    }
                    if (query.includes('SELECT * FROM [dbo].[project_comment]')) {
                        return Promise.resolve({ recordset: [{ comment: 'Test Comment' }] });
                    }
                })
            }));
            tag_model.get_project_tags = jest.fn().mockResolvedValue([{ project_id: 1, tag: 'Test Tag' }]);

            const project = await projectService.get_project(1);

            expect(project).toEqual({
                data: { project_id: 1, name: 'Test Project' },
                comments: [{ comment: 'Test Comment' }],
                tags: [{ project_id: 1, tag: 'Test Tag' }]
            });
        });

        it('should throw an error if the project is not found', async () => {
            db.Request = jest.fn().mockImplementation(() => ({
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockResolvedValue({ recordset: [] })
            }));

            await expect(projectService.get_project(1)).rejects.toThrow('project not found');
        });
    });

    describe('get_project_previews', () => {
        it('should retrieve project previews with tags', async () => {
            db.Request = jest.fn().mockImplementation(() => ({
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockResolvedValue({
                    recordset: [
                        { project_id: 1, title: 'Test Project', description: 'Test Description' }
                    ]
                })
            }));
            tag_model.get_project_tags = jest.fn().mockResolvedValue([
                { project_id: 1, tag: 'Test Tag' }
            ]);

            const previews = await projectService.get_project_previews([1]);

            expect(previews).toEqual([
                {
                    project_id: 1,
                    title: 'Test Project',
                    description: 'Test Description',
                    tags: [{ project_id: 1, tag: 'Test Tag' }]
                }
            ]);
        });
    });

    describe('get_project_previews_by_user_id', () => {
        it('should retrieve project previews by user id with tags', async () => {
            db.Request = jest.fn().mockImplementation(() => ({
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockResolvedValue({
                    recordset: [
                        { project_id: 1, title: 'Test Project', description: 'Test Description' }
                    ]
                })
            }));
            tag_model.get_project_tags = jest.fn().mockResolvedValue([
                { project_id: 1, tag: 'Test Tag' }
            ]);

            const previews = await projectService.get_project_previews_by_user_id(1);

            expect(previews).toEqual([
                {
                    project_id: 1,
                    title: 'Test Project',
                    description: 'Test Description',
                    tags: [{ project_id: 1, tag: 'Test Tag' }]
                }
            ]);
        });
    });

    describe('publish', () => {
        it('should publish a new project', async () => {
            db.pool = {
                transaction: jest.fn().mockReturnValue({
                    begin: jest.fn().mockResolvedValue(),
                    request: jest.fn().mockReturnThis(),
                    input: jest.fn().mockReturnThis(),
                    query: jest.fn().mockImplementation((query) => {
                        if (query.includes('INSERT INTO [dbo].[project]')) {
                            return Promise.resolve({ recordset: [{ project_id: 1 }] });
                        }
                        if (query.includes('INSERT INTO [dbo].[project_member]')) {
                            return Promise.resolve();
                        }
                    }),
                    commit: jest.fn().mockResolvedValue(),
                    rollback: jest.fn().mockResolvedValue()
                })
            };
            tag_model.add_project_tags = jest.fn().mockResolvedValue();

            const project_id = await projectService.publish(1, 'Test Title', 'Test Descriptionssssssssssssssssssssssssssssssddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddsssssssssssssssssssssssssssssssssssssssss', [1, 2]);

            expect(project_id).toBe(1);
        });

        it('should throw an error if the title is too short', async () => {
            await expect(projectService.publish(1, 'Short', 'Test Description', [1, 2])).rejects.toThrow('title too short');
        });

        it('should throw an error if the description is too short', async () => {
            await expect(projectService.publish(1, 'Test Title', 'Short', [1, 2])).rejects.toThrow('description too short');
        });
    });

    describe('join_request', () => {
        it('should send a join request', async () => {
            db.Transaction = jest.fn().mockReturnValue({
                begin: jest.fn().mockResolvedValue(),
                request: jest.fn().mockReturnThis(),
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockImplementation((query) => {
                    if (query.includes('SELECT * FROM [dbo].[project_member]')) {
                        return Promise.resolve({ recordset: [] });
                    }
                    if (query.includes('INSERT INTO [dbo].[project_member]')) {
                        return Promise.resolve();
                    }
                    if (query.includes('INSERT INTO [dbo].[notification]')) {
                        return Promise.resolve();
                    }
                }),
                commit: jest.fn().mockResolvedValue(),
                rollback: jest.fn().mockResolvedValue()
            });

            await projectService.join_request(1, 1, 'This is a valid join request messagessssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss.');

            expect(db.Transaction().commit).toHaveBeenCalled();
        });

        it('should throw an error if the message is too short', async () => {
            await expect(projectService.join_request(1, 1, 'Short')).rejects.toThrow('message too short');
        });

        it('should throw an error if the message is too long', async () => {
            await expect(projectService.join_request(1, 1, 'L'.repeat(257))).rejects.toThrow('message too long');
        });

        it('should throw an error if the user is already a member', async () => {
            db.Transaction = jest.fn().mockReturnValue({
                begin: jest.fn().mockResolvedValue(),
                request: jest.fn().mockReturnThis(),
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockImplementation(() => {
                    return Promise.resolve({ recordset: [{ creator: 1 }] });
                }),
                commit: jest.fn().mockResolvedValue(),
                rollback: jest.fn().mockResolvedValue()
            });

            await expect(projectService.join_request(1, 1, 'This is a valid join request messagessssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss.')).rejects.toThrow('already member');
        });
    });
});
