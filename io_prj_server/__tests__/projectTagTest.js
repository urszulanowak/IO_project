// Import necessary modules
const db = require('@utility/database');
const projectTags = require('@models/project_tag'); // Adjust the path if necessary

// Mock database and transaction objects
jest.mock('@utility/database', () => {
    const sql = require('mssql');
    const Request = jest.fn().mockImplementation(() => ({
        query: jest.fn().mockResolvedValue({ recordset: [] }),
    }));

    const Transaction = jest.fn().mockImplementation(() => ({
        begin: jest.fn().mockResolvedValue(),
        request: jest.fn().mockReturnValue(new Request()),
        commit: jest.fn().mockResolvedValue(),
    }));

    return {
        sql,
        Request,
        Transaction,
    };
});

describe('Project Tags Functions', () => {
    describe('add_project_tags', () => {
        it('should add project tags to the database', async () => {
            // Mock variables
            const tran = new db.Transaction();
            const project_id = 1;
            const tags = [101, 102];

            // Mock bulk function of transaction
            tran.request().bulk = jest.fn().mockResolvedValue();

            await projectTags.add_project_tags(tran, project_id, tags);

            // Expect bulk to be called with correct parameters
            const expectedTable = new db.sql.Table('project_tag');
            expectedTable.create = true;
            expectedTable.columns.add('project_id', db.sql.BigInt, { nullable: false });
            expectedTable.columns.add('tag_id', db.sql.Int, { nullable: false });
            expectedTable.rows.add(project_id, tags[0]);
            expectedTable.rows.add(project_id, tags[1]);

            expect(tran.request().bulk).toHaveBeenCalledWith(expectedTable);
        });
    });

    describe('get_all_tags', () => {
        it('should retrieve all tags from the database', async () => {
            // Mock query result
            const mockRecordset = [
                { tag_id: 1, tag_name: 'Tag 1', category_id: 1, category_name: 'Category 1' },
                { tag_id: 2, tag_name: 'Tag 2', category_id: 2, category_name: 'Category 2' },
            ];

            db.Request().query.mockResolvedValue({ recordset: mockRecordset });

            const tags = await projectTags.get_all_tags();

            expect(tags).toEqual(mockRecordset);
            expect(db.Request().query).toHaveBeenCalledWith(expect.any(String));
        });
    });

    describe('get_project_tags', () => {
        it('should retrieve tags for specified project IDs', async () => {
            // Mock variables
            const project_ids = [1, 2];
            const mockRecordset = [
                { project_id: 1, tag_id: 101, tag_name: 'Tag 1', category_id: 1, category_name: 'Category 1' },
                { project_id: 1, tag_id: 102, tag_name: 'Tag 2', category_id: 1, category_name: 'Category 1' },
                { project_id: 2, tag_id: 101, tag_name: 'Tag 1', category_id: 1, category_name: 'Category 1' },
                { project_id: 2, tag_id: 103, tag_name: 'Tag 3', category_id: 2, category_name: 'Category 2' },
            ];

            // Mock transaction and query result
            const tran = new db.Transaction();
            tran.request().bulk = jest.fn().mockResolvedValue();
            tran.request().query.mockResolvedValue({ recordset: mockRecordset });

            const tags = await projectTags.get_project_tags(project_ids);

            // Expect transaction and query to be called correctly
            const expectedTable = new db.sql.Table('#project_ids');
            expectedTable.create = true;
            expectedTable.columns.add('project_id', db.sql.BigInt, { nullable: false });
            expectedTable.rows.add(project_ids[0]);
            expectedTable.rows.add(project_ids[1]);

            expect(tran.request().bulk).toHaveBeenCalledWith(expectedTable, expect.any(Function));
            expect(tran.request().query).toHaveBeenCalledWith(expect.any(String));

            // Expect correct tags to be returned
            expect(tags).toEqual(mockRecordset);
        });

        it('should return an empty array if no project IDs are provided', async () => {
            const tags = await projectTags.get_project_tags([]);

            expect(tags).toEqual([]);
        });
    });
});
