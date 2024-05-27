var db = require('@utility/database');

exports.recommend = async function (n_projects, user_id, seen_projects) {
    return await db.request()
        .input('n_projects', n_projects)
        .input('user_id', user_id)
        .input('seen_projects', seen_projects.join(','))
        .query("SELECT TOP (@n_projects) project_id FROM [dbo].[project] WHERE project_id NOT IN (SELECT value FROM STRING_SPLIT(@seen_projects, ',')) ORDER BY NEWID()")
        // https://github.com/tediousjs/node-mssql/issues/313
        // NEWID() randomizes the order // TODO replace with actual recommendation algorithm
        .then(result => {
            return result.recordset.map(row => row.project_id);
        });
}