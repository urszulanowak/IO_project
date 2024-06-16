var message_model = require('@models/message');
var ejs = require('ejs');

exports.get_messages_before = function (req, res) {
    var user = req.user;
    if (!user || user.is_guest) {
        res.statusMessage = 'Unauthorized';
        res.status(401).send();
        return;
    }
    var room_id = req.params.room_id;
    var before_id = req.params.before_id;
    var limit = req.params.limit;
    message_model.get_messages_before(user.user_id, room_id, before_id, limit)
        .then(messages => {
            ejs.renderFile('views/messages.ejs', { messages: messages }).then(html => {
                res.status(200).JSON({ html: html, oldest_message_id: messages[messages.length - 1].message_id });
            });
        })
        .catch(err => {
            console.log('Get messages error: ', err);
            res.status(500);
        });
}

exports.get_messages_after = function (req, res) {
    var user = req.user;
    if (!user || user.is_guest) {
        res.statusMessage = 'Unauthorized';
        res.status(401).send();
        return;
    }
    var room_id = req.params.room_id;
    var after_id = req.params.after_id;
    var limit = req.params.limit;
    message_model.get_messages_after(user.user_id, room_id, after_id, limit)
        .then(messages => {
            ejs.renderFile('views/messages.ejs', { messages: messages }).then(html => {
                res.status(200).JSON({ html: html, newest_message_id: messages[0].message_id });
            });
        })
        .catch(err => {
            console.log('Get messages error: ', err);
            res.status(500);
        });
}

exports.add_message = function (req, res) {
    var user = req.user;
    if (!user || user.is_guest) {
        res.statusMessage = 'Unauthorized';
        res.status(401).send();
        return;
    }
    var room_id = req.params.room_id;
    var text = req.body.text;
    message_model.add_message(user.user_id, room_id, text)
        .then(() => {
            res.status(200).send();
        })
        .catch(err => {
            console.log('Add message error: ', err);
            res.status(500);
        });
}