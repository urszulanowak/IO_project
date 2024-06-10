const db = require('@utility/database');
const { get_user_notifications } = require('../models/notification');

describe('get_user_notifications', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should fetch user notifications and mark them as seen', async () => {
        // Dane testowe
        const user_id = 1;
        const seen_time = new Date().toISOString();
        const mockRecordset = [
            {
                notification_id: 1,
                create_date: '2024-06-10T12:00:00.000Z',
                seen: 0,
                notification_type_name: 'Test Notification',
                from_user_id: 2,
                from_user_name: 'John Doe',
                from_user_is_admin: true,
                from_project_id: 3,
                from_project_title: 'Test Project',
                message: 'Test message'
            }
        ];

        // Mockowanie funkcji Request, input i query
        db.Request = jest.fn().mockReturnValue({
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({ recordset: mockRecordset })
        });

        // Wywołanie funkcji get_user_notifications
        const notifications = await get_user_notifications(user_id);

        // Sprawdzenie wyników
        expect(notifications).toEqual(mockRecordset);

        // Sprawdzenie, czy funkcje zostały poprawnie wywołane
        expect(db.Request).toHaveBeenCalledTimes(2);
        expect(db.Request).toHaveBeenCalledWith();
        expect(db.Request().input).toHaveBeenCalledWith('user_id', user_id);
        expect(db.Request().query).toHaveBeenNthCalledWith(
            1,
            expect.stringContaining('SELECT')
        );
        expect(db.Request().input).toHaveBeenCalledWith('user_id', user_id);
        expect(db.Request().query).toHaveBeenNthCalledWith(
            2,
            expect.stringContaining('UPDATE')
        );
    });
});
