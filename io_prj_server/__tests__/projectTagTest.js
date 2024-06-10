const db = require('@utility/database');
const { add_project_tags, get_all_tags, get_project_tags } = require('../models/project_tag');

// Mockowanie metod z db
jest.mock('@utility/database', () => ({
    sql: {
        Table: jest.fn(() => ({
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
    Request: jest.fn(() => ({
        input: jest.fn().mockReturnThis(),
        query: jest.fn()
    })),
    Transaction: jest.fn(() => ({
        begin: jest.fn().mockResolvedValue(),
        request: jest.fn(() => ({
            input: jest.fn().mockReturnThis(),
            bulk: jest.fn(),
            query: jest.fn()
        })),
        commit: jest.fn().mockResolvedValue()
    }))
}));

describe('add_project_tags', () => {
    test('should add project tags to the database', async () => {
        const tran = db.Transaction();
        const project_id = 1;
        const tags = [101, 102, 103];

        await add_project_tags(tran, project_id, tags);

        expect(db.sql.Table).toHaveBeenCalledWith('project_tag');
        //expect(tran.request().bulk).toHaveBeenCalled();
        expect(tran.request().bulk.mock.calls[0][0].rows.add).toHaveBeenCalledTimes(tags.length);
        tags.forEach(tag_id => {
            expect(tran.request().bulk.mock.calls[0][0].rows.add).toHaveBeenCalledWith(project_id, tag_id);
        });
    });
});

describe('get_all_tags', () => {
    test('should retrieve all tags from the database', async () => {
        const mockRecordset = [
            { tag_id: 1, tag_name: 'tag1', category_id: 1, category_name: 'category1' },
            { tag_id: 2, tag_name: 'tag2', category_id: 2, category_name: 'category2' }
        ];

        db.Request().query.mockResolvedValue({ recordset: mockRecordset });

        const tags = await get_all_tags();

        expect(tags).toEqual(mockRecordset);
        expect(db.Request).toHaveBeenCalledTimes(1);
        expect(db.Request().query).toHaveBeenCalledWith(expect.stringContaining('SELECT'));
    });
});

describe('get_project_tags', () => {
    test('should retrieve tags for the specified project IDs', async () => {
        const project_ids = [1, 2, 3];
        const mockRecordset = [
            { project_id: 1, tag_id: 101, tag_name: 'tag101', category_id: 1, category_name: 'category1' },
            { project_id: 2, tag_id: 102, tag_name: 'tag102', category_id: 2, category_name: 'category2' }
        ];

        db.Transaction().request().query.mockResolvedValue({ recordset: mockRecordset });

        const tags = await get_project_tags(project_ids);

        expect(tags).toEqual(mockRecordset);
        expect(db.Transaction).toHaveBeenCalledTimes(1);
        expect(db.Transaction().begin).toHaveBeenCalled();
        expect(db.Transaction().request().bulk).toHaveBeenCalled();
        expect(db.Transaction().request().query).toHaveBeenCalledWith(expect.stringContaining('SELECT'));
        expect(db.Transaction().commit).toHaveBeenCalled();
    });

    test('should return an empty array if no project IDs are provided', async () => {
        const project_ids = [];

        const tags = await get_project_tags(project_ids);

        expect(tags).toEqual([]);
    });
});
