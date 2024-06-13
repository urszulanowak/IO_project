const recommend_model = require('../models/recommend'); // Adjust the path accordingly
const db = require('../utility/database');

jest.mock('../utility/database', () => {
    const mssql = require('mssql');

    const mockRequest = {
        input: jest.fn().mockReturnThis(),
        query: jest.fn(),
        bulk: jest.fn((table, callback) => callback()),
    };

    const mockTransaction = {
        begin: jest.fn().mockResolvedValue(),
        commit: jest.fn().mockResolvedValue(),
        request: jest.fn(() => mockRequest),
    };

    return {
        Transaction: jest.fn(() => mockTransaction),
        sql: {
            Table: jest.fn(() => ({
                create: false,
                columns: {
                    add: jest.fn(),
                },
                rows: {
                    add: jest.fn(),
                },
            })),
            BigInt: mssql.BigInt,
        },
    };
});

describe('recommend', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('should return recommended projects excluding seen projects', async () => {
        const n_projects = 5;
        const user_id = 1;
        const seen_projects = [1, 2, 3];

        const mockRequest = db.Transaction().request();
        mockRequest.query.mockResolvedValue({
            recordset: [{ project_id: 4 }, { project_id: 5 }]
        });

        const result = await recommend_model.recommend(n_projects, user_id, seen_projects);
        expect(result).toEqual([4, 5]);

        expect(db.Transaction).toHaveBeenCalledTimes(2);
        expect(db.Transaction().begin).toHaveBeenCalledTimes(1);
        expect(mockRequest.input).toHaveBeenCalledWith('n_projects', n_projects);
        expect(mockRequest.input).toHaveBeenCalledWith('user_id', user_id);
        expect(mockRequest.query).toHaveBeenCalledWith(expect.stringContaining(`SELECT TOP (@n_projects) project_id 
                    FROM [dbo].[project] 
                    WHERE project_id NOT IN (SELECT project_id FROM #seen_projects) 
                    ORDER BY NEWID();
                    DROP TABLE #seen_projects;`));
        expect(db.Transaction().commit).toHaveBeenCalledTimes(1);
    });

    it('should return recommended projects if no seen projects', async () => {
        const n_projects = 5;
        const user_id = 1;
        const seen_projects = [];

        const mockRequest = db.Transaction().request();
        mockRequest.query.mockResolvedValue({
            recordset: [{ project_id: 6 }, { project_id: 7 }]
        });

        const result = await recommend_model.recommend(n_projects, user_id, seen_projects);
        expect(result).toEqual([6, 7]);

        expect(db.Transaction).toHaveBeenCalledTimes(2);
        expect(db.Transaction().begin).toHaveBeenCalledTimes(1);
        expect(mockRequest.input).toHaveBeenCalledWith('n_projects', n_projects);
        expect(mockRequest.query).toHaveBeenCalledWith(expect.stringContaining(`SELECT TOP (@n_projects) project_id 
                    FROM [dbo].[project] 
                    ORDER BY NEWID();`));
        expect(db.Transaction().commit).toHaveBeenCalledTimes(1);
    });

    it('should handle errors gracefully', () => {

        try {
            const n_projects = 5;
            const user_id = 1;
            const seen_projects = [1, 2, 3];


            const mockRequest = db.Transaction().request();
            mockRequest.query.mockRejectedValue(new Error('Database error'));
            expect(recommend_model.recommend(n_projects, user_id, seen_projects)).rejects.toThrow('Database error');
        }
        catch(error) {
            console.error(error);
            expect(error.message).toBe("Database error")
            expect(db.Transaction).toHaveBeenCalledTimes(2);
            expect(db.Transaction().begin).toHaveBeenCalledTimes(1);
            expect(mockRequest.input).toHaveBeenCalledWith('n_projects', n_projects);
            expect(mockRequest.input).toHaveBeenCalledWith('user_id', user_id);
            expect(db.Transaction().commit).not.toHaveBeenCalled();
        }
    });
});
