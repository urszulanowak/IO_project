var db = require('@utility/database');

exports.add_project_tags = async function (tran, project_id, tags) {
    var project_tag_tab = new db.sql.Table('project_tag');
    project_tag_tab.create = true;
    project_tag_tab.columns.add('project_id', db.sql.BigInt, { nullable: false });
    project_tag_tab.columns.add('tag_id', db.sql.Int, { nullable: false });
    tags.forEach(tag_id => {
        project_tag_tab.rows.add(project_id, tag_id);
    });
    await tran.request().bulk(project_tag_tab);
};

exports.get_all_tags = async function () {
    return await db.request()
        .query(`SELECT t.tag_id, t.tag_name, c.tag_category_id AS category_id, c.name AS category_name
                FROM [dbo].[tag] t
                JOIN [dbo].[tag_category] c ON t.tag_category_id = c.tag_category_id`)
        .then(result => {
            return result.recordset;
        });
}

exports.get_project_tags = async function (project_ids) {
    var project_ids_tab = new db.sql.Table('#project_ids');
    project_ids_tab.create = true;
    project_ids_tab.columns.add('project_id', db.sql.BigInt, { nullable: false });
    project_ids.forEach(project_id => {
        project_ids_tab.rows.add(project_id);
    });
    var request = db.request();
    var tags = new Promise((resolve, reject) => {
        request.bulk(project_ids_tab, async (err, rowCount) => {
            request.query(`SELECT pt.project_id, t.tag_id, t.name AS tag_name, c.tag_category_id AS category_id, c.name AS category_name
                        FROM [dbo].[project_tag] pt
                        JOIN [dbo].[tag] t ON pt.tag_id = t.tag_id
                        JOIN [dbo].[tag_category] c ON t.tag_category_id = c.tag_category_id
                        WHERE pt.project_id IN (SELECT project_id FROM #project_ids)`)
                .then(result => {
                    resolve(result.recordset);
                });
        });
    });
    return await tags;
}