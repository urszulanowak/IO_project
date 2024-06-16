const db = require('../utility/database');
const { get_user_notifications } = require('../models/notification'); // Zmień tę ścieżkę na odpowiednią

jest.mock('../utility/database', () => {
    const dbMock = {
        Request: jest.fn().mockReturnThis(),
        input: jest.fn().mockReturnThis(),
        query: jest.fn()
    };
    return dbMock;
});

describe('get_user_notifications', () => {
    beforeEach(() => {
        db.Request.mockClear();
        db.input.mockClear();
        db.query.mockClear();
    });

    test('should fetch user notifications and mark them as seen', async () => {
        const mockNotifications = [
            {
                notification_id: 1,
                create_date: new Date().toISOString(),
                seen: 0,
                notification_type_name: 'Type1',
                from_user_id: 2,
                from_user_name: 'User2',
                from_user_is_admin: false,
                from_project_id: 3,
                from_project_title: 'Project1',
                message: 'Test message'
            }
        ];

        db.query
            .mockResolvedValueOnce({ recordset: mockNotifications })
            .mockResolvedValueOnce({});

        const userId = 1;
        const notifications = await get_user_notifications(userId);

        expect(notifications).toEqual(mockNotifications);
        expect(db.Request).toHaveBeenCalledTimes(2);
        expect(db.input).toHaveBeenCalledWith('user_id', userId);
        expect(db.query).toHaveBeenNthCalledWith(1, expect.stringContaining('SELECT'));
        expect(db.query).toHaveBeenNthCalledWith(2, expect.stringContaining('UPDATE'));
    });

    test('should return empty array if no notifications are found', async () => {
        db.query
            .mockResolvedValueOnce({ recordset: [] })
            .mockResolvedValueOnce({});

        const userId = 1;
        const notifications = await get_user_notifications(userId);

        expect(notifications).toEqual([]);
        expect(db.Request).toHaveBeenCalledTimes(2);
        expect(db.input).toHaveBeenCalledWith('user_id', userId);
        expect(db.query).toHaveBeenNthCalledWith(1, expect.stringContaining('SELECT'));
        expect(db.query).toHaveBeenNthCalledWith(2, expect.stringContaining('UPDATE'));
    });

    test('should handle errors gracefully', async () => {
        db.query.mockRejectedValue(new Error('Database error'));

        const userId = 1;

        await expect(get_user_notifications(userId)).rejects.toThrow('Database error');
        expect(db.Request).toHaveBeenCalledTimes(1);
        expect(db.input).toHaveBeenCalledWith('user_id', userId);
        expect(db.query).toHaveBeenCalledWith(expect.stringContaining('SELECT'));
    });
});
