var express = require('express');
var router = express.Router();

router.get('/:id', function (req, res, next) {
    var id = req.params.id;
    var db = req.app.locals.db;
    
});

module.exports = router;