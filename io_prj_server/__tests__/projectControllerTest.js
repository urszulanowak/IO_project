const request = require('supertest');
const express = require('express');
const ejs = require('ejs');
var path = require('path');
const {
    get_project,
    get_project_previews,
    get_my_project_previews,
    join_project,
    publish,
    join_request,
    project_create
} = require('../controllers/project');

const project_model = require('@models/project');
const recommend_model = require('@models/recommend');
const project_tag_model = require('@models/project_tag');



const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware to mock user session
app.use((req, res, next) => {
    req.user = { user_id: 1, is_guest: false };
    req.session = {};
    next();
});

// view engine setup
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

app.get('/id/:id', get_project);
app.get('/get_project_previews', get_project_previews);
app.get('/get_my_project', get_my_project_previews);
app.get('/join/:id', join_project);
app.post('/publish', publish);
app.post('/join', join_request);
app.get('/create', project_create);

jest.mock('@models/project');
jest.mock('@models/recommend');
jest.mock('@models/project_tag');
jest.mock('ejs');


describe('Project Controller', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('get_project', () => {
        it('should render project view', async () => {
            const project = { id: 1, name: 'Test Project', description: 'This is a test project', tags: ['tag1', 'tag2'] };
            project_model.get_project.mockResolvedValue(project);

            const res = await request(app).get('/id/1');

            expect(project_model.get_project).toHaveBeenCalledWith('1');
            expect(res.status).toBe(200);
        });

        it('should handle project not found', async () => {
            project_model.get_project.mockRejectedValue(new Error('project not found'));

            const res = await request(app).get('/id/1');

            expect(res.status).toBe(404);
        });

        it('should handle server error', async () => {
            project_model.get_project.mockRejectedValue(new Error('server error'));

            const res = await request(app).get('/id/1');

            expect(res.status).toBe(500);
        });
    });

    describe('get_project_previews', () => {
        it('should render project previews', async () => {
            recommend_model.recommend.mockResolvedValue([1, 2]);
            project_model.get_project_previews.mockResolvedValue([]);
            ejs.renderFile.mockResolvedValue('<html></html>');

            const res = await request(app).get('/get_project_previews');

            expect(recommend_model.recommend).toHaveBeenCalled();
            expect(project_model.get_project_previews).toHaveBeenCalled();
            expect(res.status).toBe(200);
            expect(res.text).toBe('<html></html>');
        });

        it('should handle server error', async () => {
            recommend_model.recommend.mockRejectedValue(new Error('server error'));

            const res = await request(app).get('/get_project_previews');

            expect(res.status).toBe(500);
        });
    });

    describe('get_my_project_previews', () => {
        it('should render my project previews', async () => {
            project_model.get_project_previews_by_user_id.mockResolvedValue([]);
            ejs.renderFile.mockResolvedValue('<html></html>');

            const res = await request(app).get('/get_my_project');

            expect(project_model.get_project_previews_by_user_id).toHaveBeenCalledWith(1);
            expect(res.status).toBe(200);
            expect(res.text).toBe('<html></html>');
        });

        it('should handle server error', async () => {
            project_model.get_project_previews_by_user_id.mockRejectedValue(new Error('server error'));

            const res = await request(app).get('/get_my_project');

            expect(res.status).toBe(500);
        });
    });

    describe('join_project', () => {
        it('should render join project view', async () => {
            project_model.get_project.mockResolvedValue({});

            ejs.renderFile.mockImplementation((filePath, options, callback) => {
                const renderedContent = 'rendered content'; // Możesz dostosować zawartość renderowaną do potrzeb testu
                callback(null, renderedContent);
            });

            const res = await request(app).get('/join/1');

            expect(project_model.get_project).toHaveBeenCalledWith('1');
            expect(res.status).toBe(200);
            expect(res.text).toBe('rendered content');
        });

        it('should handle project not found', async () => {
            project_model.get_project.mockRejectedValue(new Error('project not found'));

            const res = await request(app).get('/join/1');

            expect(res.status).toBe(404);
        });

        it('should handle server error', async () => {
            project_model.get_project.mockRejectedValue(new Error('server error'));

            const res = await request(app).get('/join/1');

            expect(res.status).toBe(500);
        });
    });

    describe('publish', () => {
        it('should publish project', async () => {
            project_model.publish.mockResolvedValue(1);

            const res = await request(app).post('/publish').send({
                title: 'Project Title',
                description: 'Project Description',
                tags: 'java'
            });

            expect(project_model.publish).toHaveBeenCalledWith(1, 'Project Title', 'Project Description', 'java');
            expect(res.status).toBe(200);
            //expect(res.text).toBe(1);
        });

        it('should handle validation errors', async () => {
            project_model.publish.mockRejectedValue(new Error('title too short'));

            const res = await request(app).post('/publish').send({
                title: 'T',
                description: 'Project Description',
                tags: []
            });

            expect(res.status).toBe(400);
            expect(res.text).toBe('Tytuł jest zbyt krótki!');
        });

        it('should handle server error', async () => {
            project_model.publish.mockRejectedValue(new Error('server error'));

            const res = await request(app).post('/publish').send({
                title: 'Project Title',
                description: 'Project Description',
                tags: []
            });

            expect(res.status).toBe(500);
            expect(res.text).toBe('server error');
        });
    });

    describe('join_request', () => {
        it('should handle join request', async () => {
            project_model.join_request.mockResolvedValue();

            const res = await request(app).post('/join').send({
                project_id: 1,
                message: 'Request message'
            });

            expect(project_model.join_request).toHaveBeenCalledWith(1, 1, 'Request message');
            expect(res.status).toBe(200);
        });

        it('should handle validation errors', async () => {
            project_model.join_request.mockRejectedValue(new Error('message too short'));

            const res = await request(app).post('/join').send({
                project_id: 1,
                message: 'Msg'
            });

            expect(res.status).toBe(400);
            expect(res.text).toBe('Wiadomość jest zbyt krótka!');
        });

        it('should handle server error', async () => {
            project_model.join_request.mockRejectedValue(new Error('server error'));

            const res = await request(app).post('/join').send({
                project_id: 1,
                message: 'Request message'
            });

            expect(res.status).toBe(500);
            expect(res.text).toBe('server error');
        });
    });

    describe('project_create', () => {
        it('should render project create view with tags', async () => {
            project_tag_model.get_all_tags.mockResolvedValue([
                { category_id: 1, name: 'Tag1' },
                { category_id: 2, name: 'Tag2' },
                { category_id: 3, name: 'Tag3' }
            ]);
            ejs.renderFile.mockImplementation((filePath, options, callback) => {
                const renderedContent = 'rendered content'; // Możesz dostosować zawartość renderowaną do potrzeb testu
                callback(null, renderedContent);
            });

            const res = await request(app).get('/create');

            expect(project_tag_model.get_all_tags).toHaveBeenCalled();
            expect(res.status).toBe(200);
            expect(res.text).toBe('rendered content');
        });

        it('should handle server error', async () => {
            project_tag_model.get_all_tags.mockRejectedValue(new Error('server error'));

            const res = await request(app).get('/create');

            expect(res.status).toBe(500);
            expect(res.text).toBe('server error');
        });
    });
});
