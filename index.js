import express from "express";
import bodyParser from "body-parser";
import ejs, { render } from 'ejs';
import _ from 'lodash';
import mongoose from "mongoose";

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express()

app.use(express.static(__dirname + '/public'))
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended:true}))

// connection to DB
const dbName = 'blogDB'
const uri = "mongodb://0.0.0.0:27017/" + dbName
mongoose.connect(uri).then(()=>{
    console.log("Connected successfully to " + dbName)
})

// DB document schema
const postSchema = new mongoose.Schema({
    title : String,
    content: String,
    truncatedContent: String
})

// DB document model
const Post = new mongoose.model('Post', postSchema)


const homeStartingContent  = "Today is a brand new day filled with endless possibilities. It's time to embark on a journey of self-reflection, inspiration, and personal growth. Let your thoughts flow onto these pages and watch as they transform into meaningful words, capturing the essence of your unique experiences.  <br> <br> -Happy Journaling!"

const aboutContent = "At The Daily Journal, we believe in the power of introspection and self-expression. We understand that life is a beautiful and complex tapestry, woven together by our experiences, emotions, and aspirations. That's why we created this platform—a place where you can reflect, discover, and grow.<br> <br> Our mission is to provide you with a sanctuary for your thoughts, where you can freely explore your inner landscape and document your personal journey. We believe that journaling is not just a mere act of writing; it's a transformative practice that can unlock your creativity, enhance self-awareness, and promote emotional well-being. <br> <br> -Happy Journaling!"

const contactContent = "We would love to hear from you! <br> <br>At The Daily Journal, we value your feedback, suggestions, and inquiries. Please don't hesitate to reach out to us using the contact information provided below. Our dedicated team is here to assist you and ensure you have the best journaling experience possible."


// let posts = []   //old array containing all posts

let posts = []
Post.find({}).then((docs)=>{
    posts = docs
})

app.get('/', (req, res)=>{
    Post.find({}).then((docs)=>{
        posts = docs
        res.render('home', {homeStartingContent: homeStartingContent, posts:posts})
    })
    
})

app.get('/about', (req, res)=>{
    res.render('about', {aboutContent: aboutContent})
})

app.get('/contact', (req, res)=>{
    res.render('contact', {contactContent : contactContent})
})
app.get('/compose', (req, res)=>{
    res.render('compose')
})

// Get request using route parameters to route to an indivisual page for a post
app.get('/posts/:postId', (req, res)=>{      
    let postId = req.params.postId
    postId = _.kebabCase(postId)
    var kebabPostTitle = ''
    for(let post in posts){
        kebabPostTitle = _.kebabCase(posts[post].title)
        if(postId === kebabPostTitle){
            // console.log("Found")
            res.render('post', {title: posts[post].title, content: posts[post].content})

        }
    }
})    


// Add a post
app.post('/compose', (req, res)=>{
    const truncate = req.body.postContent.substring(0,150)
    ////Old method to add a post
    // const post = {
    //     title : req.body.postTitle,
    //     content: req.body.postContent,
    //     truncatedContent: truncate
    // }
    // posts.push(post)

    //Adding post using mongoDB
    const newPost = new Post({
        title : req.body.postTitle,
        content: req.body.postContent,
        truncatedContent: truncate
    })
    newPost.save().then(()=>{
        console.log("post added to DB")
        res.redirect("/")
    })
    
})

//Delete a post
app.post('/delete', (req, res)=>{
    // console.log(req.body.idOfPost)
    Post.findByIdAndRemove({_id: req.body.idOfPost}).then(()=>{
        console.log("Post removed")
        res.redirect('/')
    })
    
})

// Server start
app.listen(process.env.PORT || 3000, ()=>console.log("Server started on port 3000"))