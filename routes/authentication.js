const express = require('express');
const router = express.Router();
const userModule   = require('../objects/user');
const authenticationService = require('../services/authentication');
const bcrypt = require('bcrypt-nodejs');
const async = require('async');

// =====================================
// Resetpw===============================
// =====================================
router.get('/', (req,res) => {
    const email = req.query.email;
    if(email){
        userModule.userMethods.findOne(email)
        .then(user => {
            res.send.user(200).send(user);
        })
        .catch(err => {
            res.status(401).send(error);
        }); 
    }
});

router.route('/register')
    // page
    .get(function(req,res){
        // Todo only for web
        res.send('Create user test');
    })
    // Create user
    .post(function(req,res){        
        // let { lastName, firstName, email } = req.body;

        let lastName = req.body.lastName;
        let firstName = req.body.firstName;
        let email = req.body.email;
        let password = req.body.password;
        let admin =  req.body.admin;
        userModule.userMethods.findOne(email)
        .then((user) => {
            if(user){                
                return;
            }

            return userModule.create(firstName, lastName, email, password, admin)
        })
        .then((user) => {
            if (!user) {
                res.status(409).send("Email already taken");
            } else {
                //TODO check why select= false not working
                user.password = null;
                res.send(user);
            }
        })
        .catch(err => {
            res.send(err);
        });
    });
    

router.route('/resetpassword')
    // page
    .get(function(req,res){
        // Todo only for web
        let email = req.body.email;
        let newPassword = req.body.password;
        authenticationService.resetpw(email, newPassword).then(user => {
            console.log("user ", user);
                res.send(user);
        }, error => {
            console.log(error);
            res.send(error);
        });
    });

router.route('/forgot')
    .post(function(req, res){
        let email = req.body.email;
        authModule.authMethods.forgot(email).then(user => {
            res.send("There has been an email send to reset your password!");
        },error => {
            console.log(error);
            res.send(error);
        });
    });
// =====================================
// Login===============================
// =====================================
router.post("/login", function(req, res){
    if(req.body.refreshToken != null){
        console.log("ok");
        authenticationService.loginRefreshToken(req.body.refreshToken)
        .then(user => {
            console.log("user", user);
            res.send(user);
        })
        .catch(err => {
            res.status(402).send(error);
        });
    }
    else {
        console.log(req.body.fireBaseToken);
        // response = {
		// 		_id: 0,
		// 		firstName: "Jeff",
		// 		lastName: "Liekens",
		// 		email: "liekensjeff@gmail.com",
		// 		refreshToken: "refreshToken",
		// 		loginToken: "loginToken",
		// 		//members: members,
		// 		admin: true
		// 	};
        //     res.send(response);
    // }
        authenticationService.login(req.body.email, req.body.password)
        .then((user) => {
            console.log(user);
            user.fireBaseToken = req.body.fireBaseToken;
            console.log("firebaseToken");
            console.log(user.fireBaseToken);
            userModule.update(user._id, user)
            .then(updatedUser => {
                console.log("updatedUser");
                console.log(updatedUser);
                res.send(updatedUser);
            })
            .catch(err =>{
                res.send(error);
            });
            res.send(user);
        },error => {
            res.status(409).send(error);
        });
    }
});

router.post("/auth", function(req,res){
    const loginToken = req.body.loginToken;
    let user = authModule.authMethods.verifyToken(loginToken);
    if(user){
        res.send(user);
    }else {
        res.send("Not a valid token!");
    }
});


// // =====================================
// // Logout===============================
// // =====================================
// router.get('/logout', function(req, res){
//   req.logout();
//   res.send("u have been logged out");  
// });

module.exports = router;