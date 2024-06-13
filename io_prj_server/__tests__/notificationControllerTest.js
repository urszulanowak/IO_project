const request = require('supertest');
const ejs = require('ejs');
const express = require('express');
const notification_model = require('@models/notification');
const notification_controler = require('../controllers/notification');
var path = require('path');
const bodyParser = require('body-parser');


const app = express();
function createApp(setUserMiddleware) {
    const app = express();

    app.set('views', path.join(__dirname, '../views'));
    app.set('view engine', 'ejs');

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // Ustawienie middleware do ustawiania użytkownika
    app.use(setUserMiddleware);

    // Endpoint do uzyskania powiadomień
    app.get('/user/notifications', notification_controler.get_user_notifications);

    return app;
}

notification_model.get_user_notifications = jest.fn().mockResolvedValue({
recordset: [
    { notification_id: 1,
        create_date: '2024-06-10T12:00:00.000Z',
        seen: 0,
        notification_type_name: 'Test Notification',
        from_user_id: 2,
        from_user_name: 'John Doe',
        from_user_is_admin: true,
        from_project_id: 3,
        from_project_title: 'Test Project',
        message: 'Test message' },
]
});

jest.mock('@models/notification', () => ({
    get_user_notifications: jest.fn()
}));

describe('GET /user/notifications', () => {
    test('should return HTML with user notifications', async () => {
        // Dane testowe
        const user_id = 1;
        const mockUser = {
            user_id: 1,
            email: 'test@example.com',
            name: 'Test User',
            is_guest: false,
            is_admin: false,
        };
        const mockNotifications =
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
        ;

        const loggedInUser = { user_id: 1, is_guest: false };

        const app = createApp((req, res, next) => {
            req.user = loggedInUser;
            next();
        });
        // Symulacja zapytania HTTP z zalogowanym użytkownikiem
        const res = await request(app)
            .get('/user/notifications')
            .expect(200)
            .expect('Content-Type', /html/);


        console.log(res.text);
        // Sprawdzenie czy funkcja get_user_notifications została poprawnie wywołana
        expect(notification_model.get_user_notifications).toHaveBeenCalledWith(user_id);
        //expect(res.text).toContain('<html>');
        //expect(res.text).toContain('<body>');
       // expect(res.text).toContain('Notification 1');
        //expect(res.text).toContain('Notification 2');

    });

    test('should return 401 Unauthorized if user is not logged in', async () => {
        const app = createApp((req, res, next) => {
            req.user = null;
            next();
        });
        const res = await request(app)
            .get('/user/notifications')

        expect(res.status).toEqual(401);
    });

    test('should return 500 Internal Server Error if there is an error', async () => {
        // Mockowanie funkcji get_user_notifications z błędem
        notification_model.get_user_notifications.mockRejectedValue(new Error('Database connection failed'));
        const app = createApp((req, res, next) => {
            req.user = { user_id: '123456789', is_guest: false };
            next();
        });
        const res = await request(app)
            .get('/user/notifications')
            .set('Accept', 'text/html');

        expect(res.status).toEqual(500);
        expect(res.text).toContain('server error');
    });
});
