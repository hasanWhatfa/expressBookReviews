const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


const doesExist = (username)=>{
    let usersWithSameName = users.filter((user)=>{
        return user.username.toLowerCase() === username.toLowerCase();
    })

    if(usersWithSameName.length > 0){
        return true
    }
    else{return false}
}


public_users.post("/register", (req,res) => {

    const {username, password} = req.body;

    if(!username || !password){
        return res.status(401).json({error: `Enter your Credentials!`});
    }

    if(!doesExist(username)){
        users.push({
            username,
            password
        });
        return res.status(200).json({
            message: `Registerd Successfully, you can log in now`
        })
    }
    else{
        return res.status(401).json({
            message:`User name Already used.`
        })
    }
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try{
        let bookList = await new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(books);
            }, 1000);
        }
        );
        return res.status(200).json(bookList);
    }
    catch(error){
        return res.status(500).json({error: "Failed to retrieve book list"});
    }
});

// Get book details based on ISBN

public_users.get('/isbn/:isbn', (req, res) => {
    const { isbn } = req.params;

    axios.get(`http://localhost:5000/books/${isbn}`)
        .then((response) => {
            // Handle successful response
            return res.status(200).json(response.data);
        })
        .catch((error) => {
            // Handle error response
            return res.status(error.response?.status || 500).json({
                message: "Failed to retrieve book by ISBN"
            });
        });
});

  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    let author = decodeURIComponent(req.params.author);

    let booksByAuthor = Object.values(books).filter((book)=>{
        return book.author.toLowerCase() == author.toLowerCase()
    });

    if(booksByAuthor.length > 0){
        return res.status(200).json({
            books: booksByAuthor
        });
    }
    else{
        return res.status(404).json({
            message: "No Books for This author"
        });
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    let title = req.params.title;

    let booksByTitle = Object.values(books).filter((book)=>{
        return book.title.toLowerCase() == title.toLowerCase();
    })

    if(booksByTitle.length > 0){
        return res.status(200).json({
            "booksByTitle": booksByTitle
        })
    }
    else{
        return res.status(404).json({
            error:`No books with title ${title}`
        })
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {

    let isbn = req.params.isbn;
    let requiredBook = books[isbn];

    if(requiredBook){

        let hasReviews = Object.keys(requiredBook.reviews || {}).length > 0;

        return res.status(200).json({
            isbn: isbn,
            title: requiredBook.title,
            reviews: hasReviews ? requiredBook.reviews : `No Reviews Available for '${requiredBook.title}'`
        })  
    }
    else{
        return res.status(404).json({error:`Book with ID: '${isbn}' was Not Found.`})
    }
});

module.exports.general = public_users;
