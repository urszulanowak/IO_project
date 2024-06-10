const request = require('supertest');
const express = require('express');
const projectController = require('../controllers/project.js');
const project_model = require('@models/project');
const recommend_model = require('@models/recommend');
const ejs = require('ejs');

jest.mock('@models/project');
jest.mock('@models/recommend');
jest.mock('ejs');

const app = express();
app.use(express.json());
app.get('/project/:id', projectController.get_project);
app.get('/project_previews', projectController.get_project_previews);
app.post('/publish', (req, res, next) => {
    req.user = { user_id: 1, is_guest: false }; // Mock user for authentication
    next();
}, projectController.publish);

describe('get_project', () => {
    it('should return project data and render view', async () => {
        const mockProject = { data: { project_id: 1, title: 'Test Project' }, comments: [] };
        project_model.get_project.mockResolvedValue(mockProject);

        const response = await request(app).get('/project/1');
        expect(response.status).toBe(200);
        expect(response.text).toContain('Test Project');
    });

    it('should return 404 if project is not found', async () => {
        project_model.get_project.mockRejectedValue(new Error('project not found'));

        const response = await request(app).get('/project/1');
        expect(response.status).toBe(404);
    });

    it('should return 500 on server error', async () => {
        project_model.get_project.mockRejectedValue(new Error('Database error'));

        const response = await request(app).get('/project/1');
        expect(response.status).toBe(500);
    });
});

describe('get_project_previews', () => {
    it('should return project previews and render view', async () => {
        const mockRecommendations = [1, 2, 3];
        const mockPreviews = [{ project_id: 1, title: 'Test Project', description: 'Test description' }];
        recommend_model.recommend.mockResolvedValue(mockRecommendations);
        project_model.get_project_previews.mockResolvedValue(mockPreviews);
        ejs.renderFile.mockResolvedValue('<div>Test Project</div>');

        const response = await request(app).get('/project_previews');
        expect(response.status).toBe(200);
        expect(response.text).toContain('Test Project');
    });

    it('should return 500 if no recommendations are found', async () => {
        recommend_model.recommend.mockResolvedValue([]);

        const response = await request(app).get('/project_previews');
        expect(response.status).toBe(500);
    });

    it('should return 500 on server error', async () => {
        recommend_model.recommend.mockRejectedValue(new Error('Database error'));

        const response = await request(app).get('/project_previews');
        expect(response.status).toBe(500);
    });
});

describe('publish', () => {
    it('should publish a project successfully', async () => {
        project_model.publish.mockResolvedValue(1);

        const response = await request(app)
            .post('/publish')
            .send({ title: 'Test Project', description: 'This is a test project description that is long enough.' });
        expect(response.status).toBe(200);
        expect(response.text).toBe('1');
    });

    it('should return 401 if user is not authenticated', async () => {
        const unauthenticatedApp = express();
        unauthenticatedApp.use(express.json());
        unauthenticatedApp.post('/publish', projectController.publish);

        const response = await request(unauthenticatedApp)
            .post('/publish')
            .send({ title: 'Test Project', description: 'This is a test project description that is long enough.' });
        expect(response.status).toBe(401);
    });

    it('should return 400 if title is too short', async () => {
        project_model.publish.mockRejectedValue(new Error('title too short'));

        const response = await request(app)
            .post('/publish')
            .send({ title: 'Short', description: 'This is a test project description that is long enough.' });
        expect(response.status).toBe(400);
    });

    it('should return 400 if description is too short', async () => {
        project_model.publish.mockRejectedValue(new Error('description too short'));

        const response = await request(app)
            .post('/publish')
            .send({ title: 'Test Project', description: 'Too short' });
        expect(response.status).toBe(400);
    });

    it('should return 500 on server error', async () => {
        project_model.publish.mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .post('/publish')
            .send({ title: 'Test Project', description: 'This is a test project description that is long enough.' });
        expect(response.status).toBe(500);
    });
});
