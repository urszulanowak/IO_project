const db = require('@utility/database');
var project_tag_model = require('@models/project_tag');
const { add_project_tags, get_all_tags, get_project_tags } = require('../models/project_tag');

// Mock the database module
jest.mock('@utility/database', () => ({
    sql: {
        Table: jest.fn().mockImplementation(() => ({
            create: false,
            columns: {
                add: jest.fn()
            },
            rows: {
                add: jest.fn()
            }
        })),
        BigInt: jest.fn(),
        Int: jest.fn()
    },
    Request: jest.fn().mockImplementation(() => ({
        query: jest.fn().mockResolvedValue({ recordset: [] }) // Ensure query returns a promise
    })),
    Transaction: jest.fn().mockImplementation(() => ({
        begin: jest.fn().mockResolvedValue(),
        commit: jest.fn().mockResolvedValue(),
        request: jest.fn().mockImplementation(() => ({
            bulk: jest.fn().mockResolvedValue(),
            query: jest.fn().mockResolvedValue({ recordset: [] }) // Ensure query returns a promise
        }))
    }))
}));

describe('add_project_tags', () => {
    it('should add project tags to the database', async () => {
        const tran = db.Transaction();
        const project_id = 1;
        const tags = [101, 102, 103];

        await add_project_tags(tran, project_id, tags);

        expect(db.sql.Table).toHaveBeenCalledWith('project_tag');
        //expect(tran.request().bulk).toHaveBeenCalled();
    });
});

describe('get_all_tags', () => {
    it('should retrieve all tags from the database', async () => {
        const mockTags = [
            { tag_id: 1, tag_name: 'tag1', category_id: 1, category_name: 'category1' },
            { tag_id: 2, tag_name: 'tag2', category_id: 1, category_name: 'category1' }
        ];
        // Mockowanie metody query
        db.Request.mockReturnValue({
            query: jest.fn().mockResolvedValue({ recordset: mockTags })
        });

        const tags= await get_all_tags();
        const tags2 = await project_tag_model.get_all_tags();

        //expect(db.Request().query).toHaveBeenCalledWith(expect.stringContaining('SELECT t.tag_id, t.name AS tag_name'));
        expect(tags2).toEqual(mockTags);
    });
});

describe('get_project_tags', () => {
    it('should return an empty array if no project IDs are provided', async () => {
        const project_ids = [];
        const tags = await get_project_tags(project_ids);
        expect(tags).toEqual([]);
    });

    it('should retrieve tags for the specified project IDs', async () => {
        const project_ids = [1, 2];
        const mockTags = [
            { project_id: 1, tag_id: 1, tag_name: 'tag1', category_id: 1, category_name: 'category1' },
            { project_id: 2, tag_id: 2, tag_name: 'tag2', category_id: 1, category_name: 'category1' }
        ];
        const tran = db.Transaction();

        queryMock = jest.fn().mockResolvedValue({ recordset: mockTags });
        queryMock.mockResolvedValueOnce({ recordset: mockTags });

        const tags = await get_project_tags(project_ids);

        expect(db.Transaction).toHaveBeenCalled();
        expect(tran.begin).toHaveBeenCalled();
        expect(tran.request().bulk).toHaveBeenCalled();
        expect(tran.request().query).toHaveBeenCalledWith(expect.stringContaining('SELECT pt.project_id, t.tag_id'));
        expect(tags).toEqual(mockTags);
    });
});
