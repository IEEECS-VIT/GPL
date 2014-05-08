
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'avi' });
    console.log("Hello World");
};