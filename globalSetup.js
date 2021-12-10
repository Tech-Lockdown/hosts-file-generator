import express from 'express'
export default () => {
const app = express();

app.listen(process.env.PORT || 5000, console.log('App Running'))
	app.get('/test', async(req, res) => {
		res.send("HELLO")
	})
};