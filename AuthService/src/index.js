const express = require("express");
const app = express();
const {PORT, DB_SYNC} = require('./config/serverConfig')
const db = require('./models/index');
const bodyParser = require('body-parser');
const {User, Role} = require('./models/index')

const startServer = () => {

    

    
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({extended: true}))

    const apiRouter = require('./routes/index')
    app.use('/api', apiRouter )
    
    console.log(PORT)
    app.listen(PORT, async () => {
        
        //db.sequelize.sync({alter:true});
        const u1=await User.findByPk(1);
        const r1 = await Role.findByPk(2);
        //r1.addUser(u1)
        
        
        console.log(`Server listening `+PORT);
    })
}
startServer();