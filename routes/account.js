var mongoose = require("mongoose"); 
var Account = require("../model/account");
var Customer = require("../model/customer");
function getAccounts(req, res){
    Account.find({}, function(err, accounts){
        var response; 
        if (err){
            response = { error: "could not get all accounts"};
            return res.json(response);
        }
        else{    
            response = accounts;
            return res.json(response);
        }
    });     
}

function getAccount(req, res){
    Account.find({_id: req.params.id}, function(err, account){ 
        var response; 
        if (err){
            response = { error: "could not get account"};
            res.json(response);
        }
        else{
            if (account.length == 0){
                response = { error: "account does not exist"};
                res.json(response);
            }
            else{
                response = account[0]; 
                res.json(response);
            }
        }
    }); 
}

function postAccount(req, res){
    var response; 
    var accountBody = new Account(req.body);
    accountBody.customer_id = req.params.id;
    accountBody.validate(function(error){
            if (error){
                response = { error: "incorrectly formatted account"};
                res.json(response);
            }    
            else{
                if (accountBody.balance.value < 0){
                    response = { error: "account balance must be at least 0"};
                    res.json(response);
                }
                else{
                    Customer.find({_id: req.params.id}, function(err0, customer){ 
                        if (err0){
                            response = { error: "could not find customer"};
                            res.json(response);
                        }
                        else{
                            if (customer.length == 0){
                                response = { error: "customer does not exist"};
                                res.json(response);
                            }
                            else{
                                Account.find({customer_id: req.params.id}, function(err, accounts){ 
                                    var response; 
                                    if (err){
                                        response = { error: "error when trying to get account"};
                                        res.json(response);
                                    }
                                    else{
                                        /*if (accounts.length != 0){
                                            response = { error: "this customer already has an account!"};
                                            res.json(response);
                                        }*/ //--- allowed to have multiple accounts now
                                        //else{
                                            var newAccount = new Account(req.body);
                                            for (var i = 0; i < accounts.length; i++) { // if account with this nickname already exists
                                        		if (accounts[i].nickname == newAccount.nickname) {
                                        			response = {error: "This customer already has an account under this nickname!"};
                                            		res.json(response);
                                            		return;
                                        		}
                                        	}
                                        	// if we made it to this point, an account with the desired nickname does not
                                        	// already exist, so we can make one, under the same customer id
                                            newAccount.customer_id = req.params.id; // redundant?
                                            newAccount.save(function(err1, account1){
                                                var response; 
                                                if (err1){
                                                    response = { error: "could not add new account"};
                                                    res.json(response);
                                                }
                                                else{
                                                    response = { success: "added account", body: account1};    
                                                    res.json(response);
                                                }
                                            });                
                                       //}
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
}

function getCustomerAccounts(req, res){
    Customer.find({_id: req.params.id}, function(err, customer){ 
        var response = []; 
        if (err){
            response = { error: "could not find customer"};
            res.json(response);
        }
        else{
            if (customer.length == 0){
                response = { error: "customer does not exist"};
                res.json(response);
            }
            else{
                Account.find({customer_id: req.params.id}, function(err1, accounts){ 
                    var response; 
                    if (err1){
                        response = { error: "could not get accounts"};
                        res.json(response);
                    }
                    else{
                        if (accounts.length == 0){
                            response = { error: "accounts do not exist"};
                            res.json(response);
                        }
                        else{
                            //response = account[0]; 
                            response = accounts; // may be > 1
                            res.json(response);
                        }
                    }
                }); 
            }
        }
    });    
}
function updateAccount(req, res){ 
        var response; 
        var accountBody = new Account(req.body);
        accountBody.validate(function(error){
            if (error){
                response = { error: "incorrectly formatted account"};
                res.json(response);
            }    
            else{
                if (accountBody.balance.value < 0){
                    response = { error: "account balance must be at least 0"};
                    res.json(response); 
                }
                else{
                    Account.find({_id: req.params.id}, function(err, account){
                        if (err){
                            response = { error: "could not find account"};
                            res.json(response);
                        }
                        else{
                            if (account.length == 0){
                                response = { error: "account does not exist"}; 
                                res.json(response);
                            }
                            else{
                                var updatedAccount = Object.assign(account[0], req.body); 
                                updatedAccount.save(function(err1, account1){
                                    if (err1){
                                        response = { error: "could not update account"};
                                        res.json(response);
                                    }
                                    else{
                                        response = { success: "updated account", body: account1};
                                        res.json(response);
                                    }
                                }); 
                            }
                        }
                    });
                }
            }
        });
}
function deleteAccount(req, res){
    Account.findOneAndRemove({_id: req.params.id}, function(err, account, result) {
        var response; 
        if (err || account == null){
            response = { error: "could not find and delete account"};
            res.json(response);
        }
        else{
            response = { success: "found and deleted account"};     
            res.json(response);
        }
    }); 
} 

module.exports = {getAccounts, getAccount, getCustomerAccounts, postAccount, updateAccount, deleteAccount};
