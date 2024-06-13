var db = require('../utility/database');

exports.recommend = async function (n_projects, user_id, seen_projects) {
    var recommendations = new Promise((resolve, reject) => {
        try{
            var tran = db.Transaction();
            tran.begin().then(() => {
                if (seen_projects.length != 0) {
                    var seen_projects_tab = new db.sql.Table('#seen_projects');
                    seen_projects_tab.create = true;
                    seen_projects_tab.columns.add('project_id', db.sql.BigInt, { nullable: false });
                    seen_projects.forEach(project_id => {
                        seen_projects_tab.rows.add(project_id);
                    });
                    tran.request().bulk(seen_projects_tab, () => {
                        tran.request()
                            .input('n_projects', n_projects)
                            .input('user_id', user_id)
                            .query(`SELECT TOP (@n_projects) project_id 
                        FROM [dbo].[project] 
                        WHERE project_id NOT IN (SELECT project_id FROM #seen_projects) 
                        ORDER BY NEWID();
                        DROP TABLE #seen_projects;`)
                            // https://github.com/tediousjs/node-mssql/issues/313
                            // NEWID() randomizes the order // TODO replace with actual recommendation algorithm
                            .then(result => {
                                resolve(result.recordset.map(row => row.project_id));
                                tran.commit();
                            });
                    });
                } else {
                    tran.request()
                        .input('n_projects', n_projects)
                        .query(`SELECT TOP (@n_projects) project_id 
                        FROM [dbo].[project] 
                        ORDER BY NEWID();`)
                        .then(result => {
                            resolve(result.recordset.map(row => row.project_id));
                            tran.commit();
                        });
                }
            });
        }
        catch(error){
            throw new Error("Database error");
        }
    });

    return await recommendations;
}

