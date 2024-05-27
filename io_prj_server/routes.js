module.exports = function (app) {
    app.use('/', require('@routes/index'));
    app.use('/user', require('@routes/user'));
    app.use('/project', require('@routes/project'));
}