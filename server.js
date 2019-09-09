const express = require("express");
const app = express();
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('express-flash');

mongoose.connect('mongodb://localhost/message_board', {useNewUrlParser: true});

const CommentSchema = new mongoose.Schema({
    name: {type: String, required: [true, "Comments must have a name!"], minLength: 1},
    content: {type: String, required: [true, "Comments cannot be blank!"], minLength: 1}
   }, {timestamps: true})

const MessageSchema = new mongoose.Schema({
    name: {type: String, required: [true, "Messages must have a name!"], minLength: 1},
    content: {type: String, required: [true, "Messages cannot be blank!"], minLength: 1},
    comments: [CommentSchema]
   }, {timestamps: true})
   
const Message = mongoose.model('Message', MessageSchema);
const Comment = mongoose.model('Comment', CommentSchema);

app.use(express.static(__dirname + "/static"));
app.use(express.urlencoded({extended: true}));
app.use(flash());
app.use(session({
  secret: 'keyboardkitteh',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 }
}))

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.get('/', (req, res) => {  
    Message.find()
    .then(data => res.render("index", {the_messages: data}))
    .catch(err => res.json(err));  
});

app.post('/message/new', (req, res) => {
    const the_message = new Message();
    the_message.name = req.body.name;
    the_message.content = req.body.content;
    the_message.save()
      .then(newMessageData => {
        console.log('Message created: ', newMessageData)
        res.redirect('/');
        })
      .catch(err => {
        console.log("We have an error!", err);
        for (var key in err.errors) {
            req.flash('registration', err.errors[key].message);
        }
        res.redirect('/');
      });
}); 

app.post('/comment/new/:id', (req, res) => {
    const comment = new Comment();
    comment.name = req.body.name;
    comment.content = req.body.content;
    comment.save()
      .then(newCommentData => {
            console.log('Comment created: ', newCommentData)
            Message.findOneAndUpdate({'_id' : req.params.id}, {$push: {comments: newCommentData}}, function (err, data) {
                if(err) {
                    res.json(err);
                }
                else {
                    res.redirect('/');
                }
            });
        })
      .catch(err => {
        console.log("We have an error!", err);
        for (var key in err.errors) {
            req.flash('registration', err.errors[key].message);
        }
        res.redirect('/');
      });
});


app.listen(8000, () => console.log("listening on port 8000"));