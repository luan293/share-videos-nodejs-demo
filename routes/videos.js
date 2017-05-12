var videosController = require('../controllers/videos')
//import userController from '@controllers'
console.log(videosController)
module.exports = function(app) {  
	app.route('/post')
		.get((req, res) => {
			videosController.renderPostVideoController(req, res)
		})
        .post((req, res) => {
			videosController.postVideoController(req, res)
		});
	app.route('/vid/:id')
		.get((req, res) => {
			videosController.detailsVideoController(req, res)
		});
	app.route('/like')
		.post((req, res) => {
			videosController.stateVideoController(req, res)
		});
	app.route('/search/:title')
		.get((req, res) => {
			videosController.searchVideoController(req, res)
		});
		// .post((req, res) => {
		// 	videosController.searchVideoController(req, res)
		// });
	app.route('/index')
		.get((req, res) => {
			videosController.renderIndexController(req, res)
		});		
}