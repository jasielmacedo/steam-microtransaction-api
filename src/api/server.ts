import helmet from 'helmet'
import cors from 'cors'
import bodyParser from 'body-parser'
import Debug from 'debug'

const Log = Debug("server")

export default ({app, host, port}) => {

    var corsOptions = 
    {
        origin: ["*"],
        allowedHeaders : ["Origin", "X-Requested-With", "Content-Type", "Accept"],
        credentials : true,
        optionsSuccessStatus : 200
    }

    // cors
    app.use(cors(corsOptions));

    // helmet
    app.use(helmet());

    // bodyParser
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));

    // disable powered by
    app.disable('x-powered-by');

    // start the app
    app.listen(port,host);
    Log(`Server ${host} started at port:${port}`)
}