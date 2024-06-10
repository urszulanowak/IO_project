const request = require('supertest');
const ejs = require('ejs');
const notification_model = require('@models/notification');
const app = require('../app');

jest.mock('@models/notification', () => ({
    get_user_notifications: jest.fn()
}));

describe('GET /user/notification', () => {
    test('should return HTML with user notifications', async () => {
        // Dane testowe
        const user_id = 1;
        const mockUser = {
            user_id: user_id,
            is_guest: false
        };
        const mockNotifications = [
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

        notification_model.get_user_notifications.mockResolvedValue(mockNotifications);

        // Symulacja zapytania HTTP z zalogowanym użytkownikiem
        const res = await request(app)
            .get('/user/notification')
            .set('Accept', 'text/html')
            .set('Cookie', ['user=' + JSON.stringify(mockUser)]); // Przekazanie danych użytkownika jako ciasteczko

        // Sprawdzenie odpowiedzi HTTP
        expect(res.status).toEqual(200);
        expect(res.text).toContain('Test Notification');
        expect(res.text).toContain('John Doe');
        expect(res.text).toContain('Test Project');
        expect(res.text).toContain('Test message');

        // Sprawdzenie czy funkcja get_user_notifications została poprawnie wywołana
        expect(notification_model.get_user_notifications).toHaveBeenCalledWith(user_id);

        // Sprawdzenie czy renderowanie ejs zostało poprawnie wywołane
        expect(ejs.renderFile).toHaveBeenCalledWith('views/notifications.ejs', { notifications: mockNotifications });
    });

    test('should return 401 Unauthorized if user is not logged in', async () => {
        const res = await request(app)
            .get('/user/notification')
            .set('Accept', 'text/html');

        expect(res.status).toEqual(401);
    });

    test('should return 500 Internal Server Error if there is an error', async () => {
        // Mockowanie funkcji get_user_notifications z błędem
        notification_model.get_user_notifications.mockRejectedValue(new Error('Database connection failed'));

        const res = await request(app)
            .get('/user/notification')
            .set('Accept', 'text/html');

        expect(res.status).toEqual(500);
        expect(res.text).toContain('Internal Server Error');
    });
});
