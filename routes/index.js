
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Exp' });
    console.log("Hello World");
};