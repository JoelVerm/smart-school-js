import * as app from './http.js'
import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config()

app.onGet('/', async (req, res) => {
    res.render('index.html')
})
app.onPost('/login', async (req, res) => {
    let data = await req.getPostData()
    let schools =
		(await axios.get('https://servers.somtoday.nl/organisaties.json')).data[0].instellingen
    let school = schools.find(v => v.naam.includes(data.schoolName))
    if (!school) {
        res.return('error')
        return
    }
    let reqData = new URLSearchParams()
    reqData.append('grant_type', 'password')
    reqData.append('username', `${school.uuid}\\${data.id}`)
    reqData.append('password', data.password)
    reqData.append('scope', 'openid')
    reqData.append('client_id', 'D50E0C06-32D1-4B41-A137-A9A850C892C2')
    let userData = await axios.post('https://somtoday.nl/oauth2/token', reqData).catch(e => console.error(e))
    res.return(JSON.stringify(userData))
})

let port = process.env.PORT || 80
let server = await app.start(port)
