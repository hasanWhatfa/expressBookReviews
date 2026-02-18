const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
    {username:"myUser",password:"myPassword123"}
];


const authenticatedUser = (username,password)=>{
    let userInDB = users.filter((user)=>{
       return user.username === username && user.password === password 
    })

    if(userInDB.length > 0){
        return true
    }
    else{
        return false
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const {username, password} = req.body;

    if(!username || !password){
        return res.status(401).send('Enter your Credentials')
    }

    if(authenticatedUser(username,password)){
        let accessToken = jwt.sign(
            {
                data: username
            },
            'fingerprint_customer',
            {expiresIn: '1h'}
        );
        req.session.authorization = {
            accessToken,
            username
        }
        res.status(202).json({
            message:`Loged In Successfully`
        })
    }else{
        return res.status(401).json({
            message:'Not Authendicated!, Check Your Creds',
            test: users
        })
    }

});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    let isbn = req.params.isbn;
    let review = req.query.review;
    let username = req.session.authorization?.username || 'myUser';
    let book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
    }
    if(review){
        let reviews = book.reviews;
        reviews[username] = review;

        return res.status(200).json({
            message: `Review for book with ISBN ${isbn} has been added/updated.`,
            reviews: book.reviews
        });
    }
    else{
        return res.status(403).json({
            message: `No Review Were Provieded.`
        })
    }
});

module.exports.authenticated = regd_users;
module.exports.users = users;
