// @ts-ignore
import Orni from "./server.ts";

const orni = new Orni();
orni.listen(8080);
orni.get('/', async (req, res) => {
    res.status(400).json({msg: '1234'});
    // res.text("Hello World\n");
});

orni.get('/:name/a', async (req, res, {param, query}) => {
    console.log(param);
    res.json({msg: 'name'});
});
orni.get('/b/a', async (req, res, {param, query}) => {
    console.log(param);
    res.json({msg: 'b'});
});