const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const app = new Koa();
const routing = require('./routes');
const error = require('koa-json-error');
const paramMeter = require('koa-parameter');
const mongoose = require('mongoose');
const { connectionStr } = require('./config/index');

mongoose
	.connect(connectionStr, {
		useNewUrlParser: true
	})
	.then(() => {
		console.log('MongoDB have connected');
	});
mongoose.connection.on('error', () => {
	console.error;
});
app.use(
	error({
		postFormat: (e, { stack, ...rest }) => (process.NODE_ENV === 'production' ? rest : { stack, ...rest })
	})
);
app.use(bodyParser());
app.use(paramMeter(app));
routing(app);

const PORT = 3000;
app.listen(PORT, () => console.log(`程序启动在 ${PORT}`));
